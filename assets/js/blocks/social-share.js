const { registerBlockType } = wp.blocks;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;

registerBlockType('knokspack/social-share', {
    title: 'Social Share',
    icon: 'share',
    category: 'common',
    attributes: {
        platforms: {
            type: 'array',
            default: ['facebook', 'twitter', 'linkedin']
        },
        style: {
            type: 'string',
            default: 'default'
        },
        alignment: {
            type: 'string',
            default: 'left'
        }
    },
    edit: function(props) {
        const { attributes, setAttributes } = props;
        const { platforms, style, alignment } = attributes;

        return [
            <InspectorControls>
                <PanelBody title="Social Share Settings">
                    <SelectControl
                        multiple
                        label="Social Platforms"
                        value={platforms}
                        options={[
                            { label: 'Facebook', value: 'facebook' },
                            { label: 'Twitter', value: 'twitter' },
                            { label: 'LinkedIn', value: 'linkedin' },
                            { label: 'Pinterest', value: 'pinterest' }
                        ]}
                        onChange={(value) => setAttributes({ platforms: value })}
                    />
                    <SelectControl
                        label="Style"
                        value={style}
                        options={[
                            { label: 'Default', value: 'default' },
                            { label: 'Buttons', value: 'buttons' },
                            { label: 'Icons', value: 'icons' }
                        ]}
                        onChange={(value) => setAttributes({ style: value })}
                    />
                    <SelectControl
                        label="Alignment"
                        value={alignment}
                        options={[
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ]}
                        onChange={(value) => setAttributes({ alignment: value })}
                    />
                </PanelBody>
            </InspectorControls>,
            <div className={`knokspack-social-share align-${alignment}`}>
                {platforms.map(platform => (
                    <div className={`knokspack-share-${platform}`} key={platform}>
                        Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </div>
                ))}
            </div>
        ];
    },
    save: function() {
        return null; // Use PHP render callback
    }
});
