import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'js/index.js',
    output: {
        file: 'tests/bundle.js',
        name: 'Neutral',
        format: 'iife',
        interop: true,
        exports: 'named'
    },
    plugins: [
        resolve({
            module: true,
            main: true,
            browser: true
        })
    ]
};
