const { registerBlockType } = wp.blocks;
const { RichText, InspectorControls } = wp.blockEditor;
const { PanelBody, TextControl, SelectControl } = wp.components;

registerBlockType('knokspack/ai-content-helper', {
    title: 'AI Content Helper',
    icon: 'text',
    category: 'common',
    attributes: {
        content: {
            type: 'string',
            default: ''
        },
        prompt: {
            type: 'string',
            default: ''
        },
        style: {
            type: 'string',
            default: 'casual'
        },
        length: {
            type: 'string',
            default: 'medium'
        }
    },
    edit: function(props) {
        const { attributes, setAttributes } = props;
        const { content, prompt, style, length } = attributes;

        return [
            <InspectorControls>
                <PanelBody title="AI Settings">
                    <TextControl
                        label="Writing Prompt"
                        value={prompt}
                        onChange={(value) => setAttributes({ prompt: value })}
                    />
                    <SelectControl
                        label="Writing Style"
                        value={style}
                        options={[
                            { label: 'Casual', value: 'casual' },
                            { label: 'Professional', value: 'professional' },
                            { label: 'Academic', value: 'academic' }
                        ]}
                        onChange={(value) => setAttributes({ style: value })}
                    />
                    <SelectControl
                        label="Content Length"
                        value={length}
                        options={[
                            { label: 'Short', value: 'short' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'Long', value: 'long' }
                        ]}
                        onChange={(value) => setAttributes({ length: value })}
                    />
                </PanelBody>
            </InspectorControls>,
            <RichText
                tagName="div"
                className="knokspack-ai-content"
                value={content}
                onChange={(value) => setAttributes({ content: value })}
                placeholder="Enter text or use AI suggestions..."
            />
        ];
    },
    save: function() {
        return null; // Use PHP render callback
    }
});
