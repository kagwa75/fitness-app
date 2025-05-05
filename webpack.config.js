const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync({
        ...env,
        // Add customizations here
        node: {
            __dirname: true,
            __filename: true,
            global: true
        }
    }, argv);

    // Remove problematic node polyfills
    config.node = {
        ...config.node,
        dgram: false,
        dns: false,
        fs: false,
        http2: false,
        net: false,
        tls: false,
        child_process: false
    };

    return config;
};