import { override, addBabelPlugin } from 'customize-cra'

export default override(
    addBabelPlugin('@babel/plugin-proposal-class-properties')
);