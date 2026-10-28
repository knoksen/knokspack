<?php
// These must still fail: the compatibility contract is not an error suppression.
register_block_type('fixture/invalid', ['render_callback' => 42]);
register_block_type('fixture/invalid-handle', ['editor_script' => ['not-a-legacy-string']]);
echo KNOKSPACK_NONEXISTENT_CONSTANT;
