const { registerBlockType } = wp.blocks;
const { RichText, InspectorControls, AlignmentToolbar, BlockControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;

registerBlockType('knokspack/heading', {
    title: 'Custom Heading',
    icon: 'heading',
    category: 'design',
    attributes: {
        content: {
            type: 'string',
            source: 'html',
            selector: 'h1,h2,h3,h4,h5,h6'
        },
        level: {
            type: 'number',
            default: 2
        },
        alignment: {
            type: 'string'
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const { content, level, alignment } = attributes;

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Heading Settings">
                        <SelectControl
                            label="Level"
                            value={level}
                            options={[
                                { label: 'H1', value: 1 },
                                { label: 'H2', value: 2 },
                                { label: 'H3', value: 3 },
                                { label: 'H4', value: 4 },
                                { label: 'H5', value: 5 },
                                { label: 'H6', value: 6 }
                            ]}
                            onChange={level => setAttributes({ level: parseInt(level) })}
                        />
                    </PanelBody>
                </InspectorControls>
                <BlockControls>
                    <AlignmentToolbar
                        value={alignment}
                        onChange={alignment => setAttributes({ alignment })}
                    />
                </BlockControls>
                <RichText
                    tagName={`h${level}`}
                    value={content}
                    onChange={content => setAttributes({ content })}
                    style={{ textAlign: alignment }}
                    placeholder="Enter heading text..."
                />
            </>
        );
    },
    save: ({ attributes }) => {
        const { content, level, alignment } = attributes;
        return (
            <RichText.Content
                tagName={`h${level}`}
                value={content}
                style={{ textAlign: alignment }}
            />
        );
    }
});
