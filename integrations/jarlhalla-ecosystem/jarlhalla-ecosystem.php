<?php
/**
 * Plugin Name: Jarlhalla Ecosystem Workflow
 * Description: Opt-in ecosystem directory and private workflow for existing jh_inquiry records.
 * Version: 0.1.0
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 */
namespace Jarlhalla\Ecosystem;
defined('ABSPATH') || exit;
require_once __DIR__ . '/workflow.php';

function registry(): array {
    $data = json_decode((string) file_get_contents(__DIR__ . '/registry.json'), true);
    return is_array($data) ? $data['initiatives'] : [];
}

function areas(): array {
    return ['general'=>'Generelt', 'building'=>'Bygg og BIM', 'sustainability'=>'Bærekraft og arkitektur',
        'ai'=>'AI og teknologi', 'creative'=>'Kunst og design', 'research'=>'Natur og forskning',
        'community'=>'Samfunn og mentoring', 'learning'=>'Kurs og læring', 'labs'=>'Utvikling og simulering',
        'publishing'=>'Publisering'];
}

function stages(): array {
    return ['new'=>'Ny', 'triage'=>'Avklaring', 'active'=>'Under arbeid', 'waiting'=>'Venter',
        'delivered'=>'Levert', 'closed'=>'Lukket'];
}

function state(int $id): array {
    $value = get_post_meta($id, '_jh_eco_workflow', true);
    return is_array($value) ? $value : initial_state();
}

function setup(): void {
    // Do not replace the site's existing inquiry registration or public submission handler.
    if (!post_type_exists('jh_inquiry')) {
        add_action('admin_notices', function () {
            if (current_user_can('manage_options')) {
                echo '<div class="notice notice-warning"><p>Jarlhalla: eksisterende jh_inquiry-register mangler. Saksflyt er inaktiv; ingen nytt register er opprettet.</p></div>';
            }
        });
        return;
    }
    add_action('add_meta_boxes_jh_inquiry', function () {
        add_meta_box('jh-ecosystem-workflow', 'Jarlhalla – saksflyt', __NAMESPACE__ . '\\metabox', 'jh_inquiry', 'normal', 'high');
    });
    add_action('admin_menu', function () {
        add_submenu_page('edit.php?post_type=jh_inquiry', 'Jarlhalla arbeidskø', 'Arbeidskø',
            'manage_options', 'jh-ecosystem', __NAMESPACE__ . '\\dashboard');
    });
}
add_action('init', __NAMESPACE__ . '\\setup', 100);

function metabox(\WP_Post $post): void {
    if (!current_user_can('manage_options') || !current_user_can('edit_post', $post->ID)) return;
    $s = state($post->ID);
    wp_nonce_field('jh_eco_save_' . $post->ID, 'jh_eco_nonce');
    echo '<input type="hidden" name="jh_eco[revision]" value="' . esc_attr((string) $s['revision']) . '">';
    foreach (['area'=>areas(), 'stage'=>stages()] as $field=>$choices) {
        echo '<p><label>' . ($field === 'area' ? 'Fagområde' : 'Status') . ' <select name="jh_eco[' . esc_attr($field) . ']">';
        foreach ($choices as $key=>$label) {
            echo '<option value="' . esc_attr($key) . '"' . selected($s[$field], $key, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select></label></p>';
    }
    echo '<p><label for="jh-eco-owner">Ansvarlig</label> ';
    wp_dropdown_users(['name'=>'jh_eco[owner]', 'id'=>'jh-eco-owner', 'selected'=>$s['owner'], 'show_option_none'=>'Ikke fordelt',
        'option_none_value'=>0, 'capability'=>'manage_options']);
    echo '</p>';
    echo '<p><label>Neste oppfølging <input type="date" name="jh_eco[due]" value="' . esc_attr($s['due']) . '"></label></p>';
    echo '<p><label>Eksisterende Notion-oppgave <input type="url" class="widefat" name="jh_eco[task_url]" value="' . esc_attr($s['task_url']) . '"></label></p>';
    echo '<p>Lenken knytter saken til hovedoppgaven. Ingen automatisk synk eller overføring av personopplysninger.</p>';
    echo '<p><label>Internt notat <textarea class="widefat" name="jh_eco[note]" maxlength="2000"></textarea></label></p>';
    echo '<p>Referanse: JH-' . esc_html((string) $post->ID) . ' · Versjon ' . esc_html((string) $s['revision']) . '</p><ol>';
    foreach (array_reverse($s['history']) as $event) {
        $actor = get_userdata($event['actor']);
        echo '<li>' . esc_html($event['at'] . ' · ' . ($actor ? $actor->display_name : 'System') . ' · ' .
            (stages()[$event['stage']] ?? $event['stage']) . ' · ' . $event['note']) . '</li>';
    }
    echo '</ol><p>Historikken er intern sakslogg, ikke en manipulasjonssikker revisjonslogg. Saksflyt lagres med WordPress-knappen Oppdater.</p>';
}

function save(int $id): void {
    if (wp_is_post_revision($id) || wp_is_post_autosave($id) || !isset($_POST['jh_eco_nonce'], $_POST['jh_eco'])) return;
    if (!current_user_can('manage_options') || !current_user_can('edit_post', $id)) return;
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['jh_eco_nonce'])), 'jh_eco_save_' . $id)) return;
    $input = wp_unslash($_POST['jh_eco']);
    if (!is_array($input)) return;
    // wp_postmeta has no unique key on (post_id, meta_key). Serialize first writes
    // too, using the database's unique option_name constraint. Never steal a lock.
    $lock = 'jh_eco_lock_' . $id;
    if (!add_option($lock, gmdate('c'), '', false)) {
        set_transient('jh_eco_error_' . get_current_user_id(), 'Saken lagres allerede. Last siden på nytt og prøv igjen.', 60);
        return;
    }
    try {
        wp_cache_delete($id, 'post_meta');
        $old = get_post_meta($id, '_jh_eco_workflow', true);
        $s = is_array($old) ? $old : initial_state();
        $next = transition($s, $input, get_current_user_id(), gmdate('c'));
        if ($next['owner'] && !user_can($next['owner'], 'manage_options')) throw new \DomainException('Ansvarlig må være en eksisterende administrator.');
        if ($next === $s) return;
        // Atomic compare-and-set: stale/concurrent editors must reload, never silently overwrite.
        $ok = is_array($old)
            ? update_post_meta($id, '_jh_eco_workflow', wp_slash($next), $old)
            : add_post_meta($id, '_jh_eco_workflow', wp_slash($next), true);
        if (!$ok) throw new \DomainException('Saken ble endret samtidig. Last siden på nytt før nytt forsøk.');
    } catch (\DomainException $error) {
        set_transient('jh_eco_error_' . get_current_user_id(), $error->getMessage(), 60);
    } finally {
        delete_option($lock);
    }
}
add_action('save_post_jh_inquiry', __NAMESPACE__ . '\\save');
add_action('admin_notices', function () {
    $key = 'jh_eco_error_' . get_current_user_id();
    $message = get_transient($key);
    if ($message) {
        delete_transient($key);
        echo '<div class="notice notice-error"><p>Saksflyt ble ikke lagret: ' . esc_html($message) . '</p></div>';
    }
});

function dashboard(): void {
    if (!current_user_can('manage_options')) return;
    $page = max(1, absint($_GET['paged'] ?? 1));
    $query = new \WP_Query(['post_type'=>'jh_inquiry', 'post_status'=>['publish','private','draft','pending'],
        'posts_per_page'=>30, 'paged'=>$page, 'orderby'=>'date', 'order'=>'DESC']);
    echo '<div class="wrap"><h1>Jarlhalla – arbeidskø</h1><p>Eksisterende henvendelser med fagområde, ansvar og neste oppfølging. Ny sak starter i avklaring før arbeid eller levering.</p>';
    echo '<table class="widefat striped"><thead><tr><th>Sak</th><th>Fagområde</th><th>Status</th><th>Ansvarlig</th><th>Oppfølging</th><th>Hovedoppgave</th></tr></thead><tbody>';
    foreach ($query->posts as $post) {
        $s = state($post->ID); $owner = get_userdata($s['owner']);
        $late = $s['due'] && $s['due'] < current_time('Y-m-d') && !in_array($s['stage'], ['closed','delivered'], true);
        echo '<tr><td><a href="' . esc_url(get_edit_post_link($post->ID)) . '">JH-' . esc_html((string) $post->ID) . ' ' . esc_html(get_the_title($post)) . '</a></td>';
        echo '<td>' . esc_html(areas()[$s['area']] ?? 'Generelt') . '</td><td>' . esc_html(stages()[$s['stage']] ?? 'Ny') . '</td>';
        echo '<td>' . esc_html($owner ? $owner->display_name : 'Ikke fordelt') . '</td><td>' . esc_html(($s['due'] ?: 'Ikke satt') . ($late ? ' – forfalt' : '')) . '</td>';
        echo '<td>' . ($s['task_url'] ? '<a href="' . esc_url($s['task_url']) . '">Åpne Notion</a>' : 'Ikke koblet') . '</td></tr>';
    }
    if (!$query->posts) echo '<tr><td colspan="6">Ingen henvendelser registrert.</td></tr>';
    echo '</tbody></table>';
    echo wp_kses_post(paginate_links(['base'=>add_query_arg('paged', '%#%'), 'format'=>'', 'current'=>$page, 'total'=>$query->max_num_pages]));
    echo '</div>';
}

function directory(): string {
    wp_enqueue_style('jh-ecosystem', plugins_url('assets/directory.css', __FILE__), [], '0.1.0');
    $labels = ['existing-link'=>'Eksisterende inngang', 'preparation'=>'Under forberedelse', 'private'=>'Privat løsning'];
    $out = '<section class="jh-eco" aria-label="Jarlhalla-økosystemet"><p>Finn fagområdet eller initiativet som passer ditt behov. Status beskriver tilgjengelig inngang; den bekrefter ikke at alle funksjoner er ferdig testet.</p><div class="jh-eco-grid">';
    foreach (registry() as $item) {
        // Private and unverified app endpoints are never exposed by the directory.
        $out .= '<article class="jh-eco-card"><h3>' . esc_html($item['name']) . '</h3><p class="jh-eco-status">' . esc_html($labels[$item['availability']]) . '</p><p>' . esc_html($item['description']) . '</p>';
        if ($item['availability'] === 'existing-link' && $item['url']) {
            $out .= '<a href="' . esc_url($item['url']) . '">Besøk ' . esc_html($item['name']) . '</a>';
        }
        $out .= '</article>';
    }
    return $out . '</div></section>';
}
add_shortcode('jarlhalla_ecosystem', __NAMESPACE__ . '\\directory');
