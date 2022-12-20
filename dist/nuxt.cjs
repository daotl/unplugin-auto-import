"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkVL6W44BBcjs = require('./chunk-VL6W44BB.cjs');
require('./chunk-KYJK6LVW.cjs');

// src/nuxt.ts
var _kit = require('@nuxt/kit');
var nuxt_default = _kit.defineNuxtModule.call(void 0, {
  setup(options) {
    options.exclude = options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/];
    _kit.addWebpackPlugin.call(void 0, _chunkVL6W44BBcjs.unplugin_default.webpack(options));
    _kit.addVitePlugin.call(void 0, _chunkVL6W44BBcjs.unplugin_default.vite(options));
  }
});


module.exports = nuxt_default;
exports.default = module.exports;