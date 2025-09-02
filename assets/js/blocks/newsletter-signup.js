const { registerBlockType } = wp.blocks;
const { RichText, InspectorControls } = wp.blockEditor;
const { PanelBody, TextControl, SelectControl } = wp.components;

registerBlockType('knokspack/newsletter-signup', {
    title: 'Newsletter Signup',
    icon: 'email',
    category: 'common',
    attributes: {
        title: {
            type: 'string',
            default: 'Subscribe to our Newsletter'
        },
        description: {
            type: 'string',
            default: 'Stay updated with our latest news and updates.'
        },
        buttonText: {
            type: 'string',
            default: 'Subscribe'
        },
        style: {
            type: 'string',
            default: 'default'
        }
    },
    edit: function(props) {
        const { attributes, setAttributes } = props;
        const { title, description, buttonText, style } = attributes;

        return [
            <InspectorControls>
                <PanelBody title="Newsletter Settings">
                    <TextControl
                        label="Title"
                        value={title}
                        onChange={(value) => setAttributes({ title: value })}
                    />
                    <TextControl
                        label="Description"
                        value={description}
                        onChange={(value) => setAttributes({ description: value })}
                    />
                    <TextControl
                        label="Button Text"
                        value={buttonText}
                        onChange={(value) => setAttributes({ buttonText: value })}
                    />
                    <SelectControl
                        label="Style"
                        value={style}
                        options={[
                            { label: 'Default', value: 'default' },
                            { label: 'Modern', value: 'modern' },
                            { label: 'Minimal', value: 'minimal' }
                        ]}
                        onChange={(value) => setAttributes({ style: value })}
                    />
                </PanelBody>
            </InspectorControls>,
            <div className={`knokspack-newsletter-signup style-${style}`}>
                <RichText
                    tagName="h3"
                    value={title}
                    onChange={(value) => setAttributes({ title: value })}
                    placeholder="Enter newsletter title..."
                />
                <RichText
                    tagName="p"
                    value={description}
                    onChange={(value) => setAttributes({ description: value })}
                    placeholder="Enter newsletter description..."
                />
                <div className="knokspack-newsletter-form">
                    <input type="email" placeholder="Enter your email" disabled />
                    <button type="button">{buttonText}</button>
                </div>
            </div>
        ];
    },
    save: function() {
        return null; // Use PHP render callback
    }
});
