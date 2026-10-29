<?php
// Supported legacy WordPress handles must remain accepted.
register_block_type('fixture/legacy', [
    'editor_script' => 'fixture-script',
    'editor_style' => 'fixture-style',
    'style' => 'fixture-front-style',
    'attributes' => ['content' => ['type' => 'string']],
    'render_callback' => static function ($attributes) { return ''; },
]);
