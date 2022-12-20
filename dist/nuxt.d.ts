import { NuxtModule } from '@nuxt/schema';
import { Options } from './types.js';
import '@antfu/utils';
import '@rollup/pluginutils';
import 'unimport';

declare const _default: NuxtModule<Options>;

export { _default as default };
