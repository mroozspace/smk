'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

const TerserPlugin = require("terser-webpack-plugin");

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.ts',
      contentScript: PATHS.src + '/contentScript.ts',
      background: PATHS.src + '/background.ts',
    },
    ...(argv.mode === 'production' ? {
      optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
      }
    } : {}),
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
