import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import type { Options } from './types'
import unplugin from '.'

export default defineNuxtModule({
  setup(options: Options) {
    options.exclude = options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/]
    addWebpackPlugin(unplugin.webpack(options))
    addVitePlugin(unplugin.vite(options))
  },
})
