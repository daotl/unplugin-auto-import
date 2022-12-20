import {
  unplugin_default
} from "./chunk-7UQ4SB6F.js";
import "./chunk-HYCABCKK.js";

// src/astro.ts
function astro_default(options) {
  return {
    name: "unplugin-auto-import",
    hooks: {
      "astro:config:setup": async (astro) => {
        var _a;
        (_a = astro.config.vite).plugins || (_a.plugins = []);
        astro.config.vite.plugins.push(unplugin_default.vite(options));
      }
    }
  };
}
export {
  astro_default as default
};
