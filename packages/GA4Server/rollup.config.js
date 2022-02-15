const input = 'src/GoogleAnalytics4EventForwarderServerSide.js';

const outputOptions = {
    exports: 'named',
    strict: false,
};

const builds = {
    // for dynamic script tag loading of adobe server side kit
    server_iife: {
        input,
        output: {
            ...outputOptions,
            name: 'mParticleAdobe',
            file: 'dist/GoogleAnalytics4EventForwarderServerSide-Kit.iife.js',
            format: 'iife',
        },
    },
    // creates npm module for adobe server side kit
    server_cjs: {
        input,
        output: {
            ...outputOptions,
            name: 'mParticleAdobe',
            file: 'dist/GoogleAnalytics4EventForwarderServerSide-Kit.common.js',
            format: 'cjs',
        },
    },
};

export default [builds.server_iife, builds.server_cjs];
