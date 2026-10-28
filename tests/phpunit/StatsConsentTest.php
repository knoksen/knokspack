<?php

use PHPUnit\Framework\TestCase;

class StatsConsentTest extends TestCase {
    private $stats;

    protected function setUp(): void {
        $GLOBALS['wpdb'] = new Knokspack_Test_Wpdb();
        $GLOBALS['knokspack_test_options'] = array(
            'knokspack_stats_settings' => array(
                'enable_tracking' => true,
                'track_visitors' => true,
                'track_page_views' => true,
                'track_events' => true,
                'retention_days' => 90,
            ),
        );
        unset($_COOKIE['knokspack_analytics_consent']);
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REMOTE_ADDR'] = '192.0.2.10';
        $_SERVER['HTTP_USER_AGENT'] = 'Mozilla/5.0 Chrome/120.0';
        $_SERVER['HTTP_ORIGIN'] = 'https://example.test';
        $this->stats = new Knokspack_Stats();
    }

    public function test_new_install_defaults_do_not_enable_tracking(): void {
        $GLOBALS['knokspack_test_options'] = array();
        $_COOKIE['knokspack_analytics_consent'] = $this->consentCookie('granted');
        $stats = new Knokspack_Stats();
        $stats->track_page_view();

        self::assertCount(0, $GLOBALS['wpdb']->inserts);
    }

    public function test_page_view_is_not_collected_without_visitor_consent(): void {
        $this->stats->track_page_view();

        self::assertCount(0, $GLOBALS['wpdb']->inserts);
    }

    public function test_valid_opt_in_preserves_page_view_collection(): void {
        $_COOKIE['knokspack_analytics_consent'] = $this->consentCookie('granted');

        $this->stats->track_page_view();

        self::assertCount(1, $GLOBALS['wpdb']->inserts);
        self::assertSame('wp_knokspack_analytics', $GLOBALS['wpdb']->inserts[0][0]);
    }

    public function test_event_is_not_collected_without_visitor_consent(): void {
        $_POST = array(
            'event_type' => 'click',
            'event_name' => 'cta',
            'event_data' => '{}',
        );

        try {
            $this->stats->ajax_track_event();
            self::fail('Event submission without consent should be rejected.');
        } catch (Knokspack_Test_Json_Response $response) {
            self::assertSame(403, $response->status);
            self::assertCount(0, $GLOBALS['wpdb']->inserts);
        } finally {
            $_POST = array();
        }
    }

    public function test_withdrawal_prevents_subsequent_page_and_event_collection(): void {
        $_COOKIE['knokspack_analytics_consent'] = $this->consentCookie('granted');
        $_POST = array('consent' => 'denied');

        try {
            $this->stats->ajax_set_analytics_consent();
            self::fail('Preference endpoint should return a JSON response.');
        } catch (Knokspack_Test_Json_Response $response) {
            self::assertTrue($response->payload['success']);
            self::assertSame('denied', $response->payload['data']['consent']);
        } finally {
            $_POST = array();
        }

        $this->stats->track_page_view();
        $_POST = array('event_type' => 'click', 'event_name' => 'cta');
        try {
            $this->stats->ajax_track_event();
            self::fail('Event submission after withdrawal should be rejected.');
        } catch (Knokspack_Test_Json_Response $response) {
            self::assertSame(403, $response->status);
        } finally {
            $_POST = array();
        }

        self::assertCount(0, $GLOBALS['wpdb']->inserts);
    }

    public function test_consent_endpoint_rejects_cross_origin_preference_changes(): void {
        $_SERVER['HTTP_ORIGIN'] = 'https://attacker.test';
        $_POST = array('consent' => 'granted');

        try {
            $this->stats->ajax_set_analytics_consent();
            self::fail('Cross-origin preference changes should be rejected.');
        } catch (Knokspack_Test_Json_Response $response) {
            self::assertSame(403, $response->status);
            self::assertCount(0, $GLOBALS['wpdb']->inserts);
        } finally {
            $_POST = array();
        }
    }


    public function test_invalid_expired_and_denied_cookies_do_not_collect(): void {
        foreach (array('granted', 'granted|9999999999|forged', $this->consentCookie('denied'), 'granted|1|expired') as $cookie) {
            $_COOKIE['knokspack_analytics_consent'] = $cookie;
            $this->stats->track_page_view();
        }
        self::assertCount(0, $GLOBALS['wpdb']->inserts);
    }

    public function test_consent_endpoint_rejects_same_host_different_scheme_or_port(): void {
        foreach (array('http://example.test', 'https://example.test:8443') as $origin) {
            $_SERVER['HTTP_ORIGIN'] = $origin;
            $_POST = array('consent' => 'granted');
            try {
                $this->stats->ajax_set_analytics_consent();
                self::fail('Mismatched origin must be rejected.');
            } catch (Knokspack_Test_Json_Response $response) {
                self::assertSame(403, $response->status);
            }
        }
        $_POST = array();
    }

    private function consentCookie($choice): string {
        $expires = time() + 15552000;
        $signature = wp_hash('knokspack_analytics_consent|' . $choice . '|' . $expires, 'auth');
        return $choice . '|' . $expires . '|' . $signature;
    }
}
