const { registerBlockType } = wp.blocks;
const { InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl, RangeControl, ColorPicker } = wp.components;

registerBlockType('knokspack/container', {
    title: 'Custom Container',
    icon: 'layout',
    category: 'design',
    attributes: {
        width: {
            type: 'string',
            default: 'wide'
        },
        padding: {
            type: 'object',
            default: {
                top: '1rem',
                right: '1rem',
                bottom: '1rem',
                left: '1rem'
            }
        },
        margin: {
            type: 'object',
            default: {
                top: '0',
                right: 'auto',
                bottom: '0',
                left: 'auto'
            }
        },
        background: {
            type: 'object',
            default: {
                color: '',
                image: ''
            }
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const { width, padding, margin, background } = attributes;

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Container Settings">
                        <SelectControl
                            label="Width"
                            value={width}
                            options={[
                                { label: 'Wide', value: 'wide' },
                                { label: 'Narrow', value: 'narrow' },
                                { label: 'Full', value: 'full' }
                            ]}
                            onChange={width => setAttributes({ width })}
                        />
                        {/* Add controls for padding, margin, and background */}
                    </PanelBody>
                </InspectorControls>
                <div className={`knokspack-container knokspack-container-${width}`}>
                    <InnerBlocks />
                </div>
            </>
        );
    },
    save: ({ attributes }) => {
        const { width } = attributes;
        return (
            <div className={`knokspack-container knokspack-container-${width}`}>
                <InnerBlocks.Content />
            </div>
        );
    }
});
