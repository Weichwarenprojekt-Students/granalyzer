module.exports = {
    pluginOptions: {
        i18n: {
            localeDir: "locales",
            enableLegacy: false,
            runtimeOnly: false,
            compositionOnly: false,
            fullInstall: true,
        },
    },
    devServer: {
        proxy: {
            "^/api": {
                target: "http://localhost:3000/api",
                changeOrigin: true,
                pathRewrite: { "^/api/": "/" },
                logLevel: "debug",
            },
        },
    },
};
