"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkVL6W44BBcjs = require('./chunk-VL6W44BB.cjs');
require('./chunk-KYJK6LVW.cjs');
require('./chunk-I7OK7DX6.cjs');

// src/astro.ts
function astro_default(options) {
  return {
    name: "unplugin-auto-import",
    hooks: {
      "astro:config:setup": async (astro) => {
        var _a;
        (_a = astro.config.vite).plugins || (_a.plugins = []);
        astro.config.vite.plugins.push(_chunkVL6W44BBcjs.unplugin_default.vite(options));
      }
    }
  };
}


module.exports = astro_default;
exports.default = module.exports;