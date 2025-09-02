jQuery(document).ready(function($) {
    // Design Settings Page
    if ($('#wpss-design-form').length) {
        // Initialize CodeMirror for CSS editor if available
        if (typeof CodeMirror !== 'undefined' && $('#custom_css').length) {
            var cssEditor = CodeMirror.fromTextArea(document.getElementById('custom_css'), {
                mode: 'css',
                theme: 'default',
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true
            });
        }

        // Initialize CodeMirror for JS editor if available
        if (typeof CodeMirror !== 'undefined' && $('#custom_js').length) {
            var jsEditor = CodeMirror.fromTextArea(document.getElementById('custom_js'), {
                mode: 'javascript',
                theme: 'default',
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true
            });
        }

        // Handle font management
        $('#add-font').on('click', function() {
            var template = `
                <div class="knokspack-font-entry knokspack-card knokspack-mb-4">
                    <div class="knokspack-form-group">
                        <input type="text" class="knokspack-input" name="font_names[]" placeholder="Font Name">
                    </div>
                    <div class="knokspack-form-group">
                        <input type="url" class="knokspack-input" name="font_urls[]" placeholder="Font URL">
                    </div>
                    <button type="button" class="knokspack-button knokspack-button-error remove-font">Remove Font</button>
                </div>
            `;
            $('#knokspack-fonts-container').append(template);
        });

        // Remove font entry
        $(document).on('click', '.remove-font', function() {
            $(this).closest('.knokspack-font-entry').remove();
        });

        // Form submission
        $('#wpss-design-form').on('submit', function(e) {
            e.preventDefault();

            // Update CodeMirror content if editors exist
            if (typeof cssEditor !== 'undefined') {
                $('#custom_css').val(cssEditor.getValue());
            }
            if (typeof jsEditor !== 'undefined') {
                $('#custom_js').val(jsEditor.getValue());
            }

            // Collect font data
            var fonts = [];
            $('.knokspack-font-entry').each(function() {
                var name = $(this).find('input[name="font_names[]"]').val();
                var url = $(this).find('input[name="font_urls[]"]').val();
                if (name && url) {
                    fonts.push({ name: name, url: url });
                }
            });

            // Prepare form data
            var formData = {
                action: 'knokspack_save_design',
                _ajax_nonce: $('#_wpnonce').val(),
                custom_css: $('#custom_css').val(),
                custom_js: $('#custom_js').val(),
                custom_fonts: JSON.stringify(fonts)
            };

            // Submit via AJAX
            $.post(ajaxurl, formData, function(response) {
                if (response.success) {
                    showNotice('success', 'Settings saved successfully.');
                } else {
                    showNotice('error', 'Error saving settings.');
                }
            }).fail(function() {
                showNotice('error', 'Network error occurred.');
            });
        });
    }

    // Helper function to show notices
    function showNotice(type, message) {
        var noticeClass = type === 'success' ? 'knokspack-alert-success' : 'knokspack-alert-error';
        var notice = $('<div class="knokspack-alert ' + noticeClass + '">' + message + '</div>');
        
        $('#knokspack-notices').html(notice);
        setTimeout(function() {
            notice.fadeOut(function() {
                $(this).remove();
            });
        }, 3000);
    }
});
