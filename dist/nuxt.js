import {
  unplugin_default
} from "./chunk-7UQ4SB6F.js";
import "./chunk-HYCABCKK.js";

// src/nuxt.ts
import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
var nuxt_default = defineNuxtModule({
  setup(options) {
    options.exclude = options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/];
    addWebpackPlugin(unplugin_default.webpack(options));
    addVitePlugin(unplugin_default.vite(options));
  }
});
export {
  nuxt_default as default
};
