<?php
/**
 * Server-side AI proxy: REST routes knokspack/v1/ai/generate and ai/image.
 * The API key lives in the knokspack_ai option and never reaches the browser.
 *
 * @package Knokspack
 */

if (!defined('ABSPATH')) {
    exit;
}

class Knokspack_AI {
    const OPTION = 'knokspack_ai';
    const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
    const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';
    const MAX_PROMPT_CHARS = 60000;

    public function __construct() {
        add_action('rest_api_init', array($this, 'routes'));
    }

    public static function settings() {
        return wp_parse_args(get_option(self::OPTION, array()), array(
            'provider' => 'gemini',
            'model'    => '',
            'base_url' => '',
            'api_key'  => '',
        ));
    }

    public static function is_configured() {
        $s = self::settings();
        if ($s['provider'] === 'openai') {
            // Local servers such as Ollama need no key, only a URL.
            return $s['base_url'] !== '';
        }
        return $s['api_key'] !== '';
    }

    public function routes() {
        $args = array(
            'prompt' => array(
                'type'     => 'string',
                'required' => true,
            ),
        );
        register_rest_route('knokspack/v1', '/ai/generate', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'generate'),
            'permission_callback' => array($this, 'can_use'),
            'args'                => $args + array('google_search' => array('type' => 'boolean', 'default' => false)),
        ));
        register_rest_route('knokspack/v1', '/ai/image', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'image'),
            'permission_callback' => array($this, 'can_use'),
            'args'                => $args,
        ));
        register_rest_route('knokspack/v1', '/ai/status', array(
            'methods'             => 'GET',
            'callback'            => function () {
                $s = self::settings();
                return array('configured' => self::is_configured(), 'provider' => $s['provider']);
            },
            'permission_callback' => array($this, 'can_use'),
        ));
    }

    public function can_use() {
        return current_user_can('edit_posts');
    }

    private function check_prompt($prompt) {
        $prompt = trim((string) $prompt);
        if ($prompt === '') {
            return new WP_Error('knokspack_ai_empty', __('Write a prompt first.', 'knokspack'), array('status' => 400));
        }
        if (mb_strlen($prompt) > self::MAX_PROMPT_CHARS) {
            return new WP_Error('knokspack_ai_long', __('The prompt is too long.', 'knokspack'), array('status' => 413));
        }
        if (!self::is_configured()) {
            return new WP_Error('knokspack_ai_setup', __('AI is not set up yet. Add an API key under Knokspack → Settings.', 'knokspack'), array('status' => 412));
        }
        return $prompt;
    }

    public function generate(WP_REST_Request $request) {
        $prompt = $this->check_prompt($request->get_param('prompt'));
        if (is_wp_error($prompt)) {
            return $prompt;
        }
        $s = self::settings();
        $text = $s['provider'] === 'openai'
            ? $this->openai_text($s, $prompt)
            : $this->gemini_text($s, $prompt, (bool) $request->get_param('google_search'));
        if (is_wp_error($text)) {
            return $text;
        }
        return is_array($text) ? $text : array('text' => $text);
    }

    public function image(WP_REST_Request $request) {
        $prompt = $this->check_prompt($request->get_param('prompt'));
        if (is_wp_error($prompt)) {
            return $prompt;
        }
        $s = self::settings();
        if ($s['provider'] !== 'gemini') {
            return new WP_Error('knokspack_ai_image', __('Image generation needs the Gemini provider.', 'knokspack'), array('status' => 400));
        }
        $body = array(
            'contents'         => array(array('parts' => array(array('text' => $prompt)))),
            'generationConfig' => array('responseModalities' => array('IMAGE')),
        );
        $json = $this->post(
            'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode(self::DEFAULT_IMAGE_MODEL) . ':generateContent',
            array('x-goog-api-key' => $s['api_key']),
            $body
        );
        if (is_wp_error($json)) {
            return $json;
        }
        foreach ((array) ($json['candidates'][0]['content']['parts'] ?? array()) as $part) {
            if (!empty($part['inlineData']['data'])) {
                $mime = preg_match('#^image/[a-z0-9.+-]+$#', $part['inlineData']['mimeType'] ?? '') ? $part['inlineData']['mimeType'] : 'image/png';
                return array('dataUrl' => 'data:' . $mime . ';base64,' . $part['inlineData']['data']);
            }
        }
        return new WP_Error('knokspack_ai_image', __('The AI did not return an image. The prompt may have been blocked.', 'knokspack'), array('status' => 502));
    }

    private function gemini_text($s, $prompt, $search) {
        $model = $s['model'] !== '' ? $s['model'] : self::DEFAULT_GEMINI_MODEL;
        $body = array(
            'contents'         => array(array('role' => 'user', 'parts' => array(array('text' => $prompt)))),
            'generationConfig' => array('temperature' => 0.7, 'maxOutputTokens' => 4096),
        );
        if ($search) {
            $body['tools'] = array(array('google_search' => new stdClass()));
        }
        $json = $this->post(
            'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent',
            array('x-goog-api-key' => $s['api_key']),
            $body
        );
        if (is_wp_error($json)) {
            return $json;
        }
        $text = '';
        foreach ((array) ($json['candidates'][0]['content']['parts'] ?? array()) as $part) {
            $text .= (string) ($part['text'] ?? '');
        }
        if ($text === '') {
            return new WP_Error('knokspack_ai_empty_reply', __('The AI returned no text. The prompt may have been blocked.', 'knokspack'), array('status' => 502));
        }
        $sources = array();
        foreach ((array) ($json['candidates'][0]['groundingMetadata']['groundingChunks'] ?? array()) as $chunk) {
            if (!empty($chunk['web']['uri'])) {
                $sources[] = array('web' => array(
                    'uri'   => esc_url_raw($chunk['web']['uri']),
                    'title' => sanitize_text_field($chunk['web']['title'] ?? ''),
                ));
            }
        }
        return array('text' => $text, 'sources' => $sources);
    }

    private function openai_text($s, $prompt) {
        $base = untrailingslashit($s['base_url'] !== '' ? $s['base_url'] : 'https://api.openai.com/v1');
        $headers = array();
        if ($s['api_key'] !== '') {
            $headers['Authorization'] = 'Bearer ' . $s['api_key'];
        }
        $json = $this->post($base . '/chat/completions', $headers, array(
            'model'    => $s['model'] !== '' ? $s['model'] : 'gpt-4o-mini',
            'messages' => array(array('role' => 'user', 'content' => $prompt)),
        ));
        if (is_wp_error($json)) {
            return $json;
        }
        $text = (string) ($json['choices'][0]['message']['content'] ?? '');
        if ($text === '') {
            return new WP_Error('knokspack_ai_empty_reply', __('The AI returned no text.', 'knokspack'), array('status' => 502));
        }
        return $text;
    }

    private function post($url, $headers, $body) {
        $response = wp_remote_post($url, array(
            'timeout' => 90,
            'headers' => array_merge(array('Content-Type' => 'application/json'), $headers),
            'body'    => wp_json_encode($body),
        ));
        if (is_wp_error($response)) {
            return new WP_Error('knokspack_ai_network', $response->get_error_message(), array('status' => 502));
        }
        $code = (int) wp_remote_retrieve_response_code($response);
        $json = json_decode((string) wp_remote_retrieve_body($response), true);
        if ($code < 200 || $code >= 300) {
            $message = is_array($json) ? ($json['error']['message'] ?? '') : '';
            return new WP_Error(
                'knokspack_ai_upstream',
                /* translators: 1: HTTP status, 2: provider message */
                sprintf(__('The AI service answered %1$d. %2$s', 'knokspack'), $code, $message),
                array('status' => 502)
            );
        }
        return is_array($json) ? $json : new WP_Error('knokspack_ai_upstream', __('Unreadable reply from the AI service.', 'knokspack'), array('status' => 502));
    }
}
