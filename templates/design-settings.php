<?php
if (!defined('ABSPATH')) exit;

// Get current settings
$options = get_option('knokspack_design_settings', array(
    'enable_blocks' => true,
    'enable_templates' => true,
    'custom_css' => '',
    'custom_js' => '',
    'custom_fonts' => array()
));
?>

<div class="wrap">
    <h1><?php echo esc_html__('Design Settings', 'knokspack'); ?></h1>

    <div id="knokspack-design-settings" class="knokspack-settings-container">
        <form id="knokspack-design-form" method="post">
            <?php wp_nonce_field('knokspack_design_nonce'); ?>

            <div class="knokspack-settings-section">
                <h2><?php echo esc_html__('Block Editor Settings', 'knokspack'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php echo esc_html__('Enable Custom Blocks', 'knokspack'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="enable_blocks" value="1" 
                                    <?php checked($options['enable_blocks']); ?>>
                                <?php echo esc_html__('Enable custom blocks in the editor', 'knokspack'); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Enable Templates', 'knokspack'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="enable_templates" value="1" 
                                    <?php checked($options['enable_templates']); ?>>
                                <?php echo esc_html__('Enable block templates', 'knokspack'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="wpss-settings-section">
                <h2><?php echo esc_html__('Custom CSS', 'knokspack'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="custom_css"><?php echo esc_html__('Custom CSS', 'knokspack'); ?></label>
                        </th>
                        <td>
                            <textarea name="custom_css" id="custom_css" rows="10" class="large-text code"><?php 
                                echo esc_textarea($options['custom_css']); 
                            ?></textarea>
                            <p class="description">
                                <?php echo esc_html__('Add your custom CSS here. It will be added to all pages.', 'knokspack'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="wpss-settings-section">
                <h2><?php echo esc_html__('Custom JavaScript', 'knokspack'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="custom_js"><?php echo esc_html__('Custom JavaScript', 'knokspack'); ?></label>
                        </th>
                        <td>
                            <textarea name="custom_js" id="custom_js" rows="10" class="large-text code"><?php 
                                echo esc_textarea($options['custom_js']); 
                            ?></textarea>
                            <p class="description">
                                <?php echo esc_html__('Add your custom JavaScript here. It will be added to all pages.', 'knokspack'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="wpss-settings-section">
                <h2><?php echo esc_html__('Custom Fonts', 'knokspack'); ?></h2>
                <div id="knokspack-fonts-container">
                    <?php foreach ($options['custom_fonts'] as $index => $font): ?>
                        <div class="knokspack-font-entry">
                            <input type="text" name="font_names[]" value="<?php echo esc_attr($font['name']); ?>" 
                                   placeholder="<?php echo esc_attr__('Font Name', 'knokspack'); ?>">
                            <input type="url" name="font_urls[]" value="<?php echo esc_url($font['url']); ?>" 
                                   placeholder="<?php echo esc_attr__('Font URL', 'knokspack'); ?>">
                            <button type="button" class="button remove-font">
                                <?php echo esc_html__('Remove', 'knokspack'); ?>
                            </button>
                        </div>
                    <?php endforeach; ?>
                </div>
                <button type="button" id="add-font" class="button">
                    <?php echo esc_html__('Add Font', 'knokspack'); ?>
                </button>
            </div>

            <p class="submit">
                <input type="submit" name="submit" id="submit" class="button button-primary" 
                       value="<?php echo esc_attr__('Save Changes', 'knokspack'); ?>">
            </p>
        </form>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Add new font entry
    $('#add-font').on('click', function() {
        var template = `
            <div class="knokspack-font-entry">
                <input type="text" name="font_names[]" placeholder="<?php echo esc_attr__('Font Name', 'knokspack'); ?>">
                <input type="url" name="font_urls[]" placeholder="<?php echo esc_attr__('Font URL', 'knokspack'); ?>">
                <button type="button" class="button remove-font"><?php echo esc_js(__('Remove', 'knokspack')); ?></button>
            </div>
        `;
        $('#knokspack-fonts-container').append(template);
    });

    // Remove font entry
    $(document).on('click', '.remove-font', function() {
        $(this).closest('.knokspack-font-entry').remove();
    });

    // Form submission
    $('#knokspack-design-form').on('submit', function(e) {
        e.preventDefault();

        var fonts = [];
        $('.knokspack-font-entry').each(function() {
            var name = $(this).find('input[name="font_names[]"]').val();
            var url = $(this).find('input[name="font_urls[]"]').val();
            if (name && url) {
                fonts.push({ name: name, url: url });
            }
        });

        var data = {
            action: 'knokspack_save_design',
            _ajax_nonce: $('#_wpnonce').val(),
            enable_blocks: $('input[name="enable_blocks"]').is(':checked') ? 1 : 0,
            enable_templates: $('input[name="enable_templates"]').is(':checked') ? 1 : 0,
            custom_css: $('#custom_css').val(),
            custom_js: $('#custom_js').val(),
            custom_fonts: JSON.stringify(fonts)
        };

        $.post(ajaxurl, data, function(response) {
            if (response.success) {
                alert('<?php echo esc_js(__('Settings saved successfully.', 'knokspack')); ?>');
            } else {
                alert('<?php echo esc_js(__('Error saving settings.', 'knokspack')); ?>');
            }
        });
    });
});</script>

<style>
.knokspack-settings-container {
    max-width: 1200px;
    margin: 20px 0;
}

.knokspack-settings-section {
    background: #fff;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.knokspack-settings-section h2 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.knokspack-font-entry {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
}

.knokspack-font-entry input {
    flex: 1;
}

#custom_css,
#custom_js {
    font-family: monospace;
    tab-size: 4;
}

.form-table td {
    padding: 15px 10px;
}

.form-table th {
    padding: 20px 10px 20px 0;
}
</style>
