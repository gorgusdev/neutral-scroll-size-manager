import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'esm/index.js',
    output: {
        file: 'tests/bundle.js',
        name: 'Neutral',
        format: 'iife',
        interop: true,
        exports: 'named'
    },
    plugins: [
        resolve({
            mainFields: ['module', 'main'],
            browser: true
        })
    ]
};
