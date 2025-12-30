const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'LVGL Font Converter'
    }
  },
  configureWebpack: {
    resolve: {
      fallback: {
        'util': require.resolve('util/'),
        'path': require.resolve('path-browserify'),
        'stream': require.resolve('stream-browserify'),
        'buffer': require.resolve('buffer/'),
        'zlib': require.resolve('browserify-zlib'),
        'assert': require.resolve('assert/'),
        'fs': false,
        'process': false
      }
    }
  }
});