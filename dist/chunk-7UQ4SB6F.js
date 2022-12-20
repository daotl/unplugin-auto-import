import {
  presets
} from "./chunk-HYCABCKK.js";

// src/core/unplugin.ts
import { createUnplugin } from "unplugin";

// src/core/ctx.ts
import { dirname, isAbsolute, relative, resolve } from "path";
import { promises as fs } from "fs";
import { slash, throttle, toArray as toArray2 } from "@antfu/utils";
import { createFilter } from "@rollup/pluginutils";
import { isPackageExists } from "local-pkg";
import { vueTemplateAddon } from "unimport/addons";
import { createUnimport, scanDirExports } from "unimport";
import MagicString from "magic-string";

// src/core/eslintrc.ts
function generateESLintConfigs(imports, eslintrc) {
  const eslintConfigs = { globals: {} };
  imports.map((i) => {
    var _a;
    return (_a = i.as) != null ? _a : i.name;
  }).filter(Boolean).sort().forEach((name) => {
    eslintConfigs.globals[name] = eslintrc.globalsPropValue || true;
  });
  const jsonBody = JSON.stringify(eslintConfigs, null, 2);
  return jsonBody;
}

// src/core/resolvers.ts
import { toArray } from "@antfu/utils";
function normalizeImport(info, name) {
  if (typeof info === "string") {
    return {
      name: "default",
      as: name,
      from: info
    };
  }
  if ("path" in info) {
    return {
      from: info.path,
      as: info.name,
      name: info.importName,
      sideEffects: info.sideEffects
    };
  }
  return {
    name,
    as: name,
    ...info
  };
}
async function firstMatchedResolver(resolvers, fullname) {
  let name = fullname;
  for (const resolver of resolvers) {
    if (typeof resolver === "object" && resolver.type === "directive") {
      if (name.startsWith("v"))
        name = name.slice(1);
      else
        continue;
    }
    const resolved = await (typeof resolver === "function" ? resolver(name) : resolver.resolve(name));
    if (resolved)
      return normalizeImport(resolved, fullname);
  }
}
function resolversAddon(resolvers) {
  return {
    async matchImports(names, matched) {
      if (!resolvers.length)
        return;
      const dynamic = [];
      const sideEffects = [];
      await Promise.all([...names].map(async (name) => {
        const matchedImport = matched.find((i) => i.as === name);
        if (matchedImport) {
          if ("sideEffects" in matchedImport)
            sideEffects.push(...toArray(matchedImport.sideEffects).map((i) => normalizeImport(i, "")));
          return;
        }
        const resolved = await firstMatchedResolver(resolvers, name);
        if (resolved)
          dynamic.push(resolved);
        if (resolved == null ? void 0 : resolved.sideEffects)
          sideEffects.push(...toArray(resolved == null ? void 0 : resolved.sideEffects).map((i) => normalizeImport(i, "")));
      }));
      if (dynamic.length) {
        this.dynamicImports.push(...dynamic);
        this.invalidate();
      }
      if (dynamic.length || sideEffects.length)
        return [...matched, ...dynamic, ...sideEffects];
    }
  };
}

// src/core/ctx.ts
function createContext(options = {}, root = process.cwd()) {
  var _a, _b;
  const imports = flattenImports(options.imports, options.presetOverriding);
  (_a = options.ignore) == null ? void 0 : _a.forEach((name) => {
    const i = imports.find((i2) => i2.as === name);
    if (i)
      i.disabled = true;
  });
  const {
    dts: preferDTS = isPackageExists("typescript")
  } = options;
  const dirs = (_b = options.dirs) == null ? void 0 : _b.map((dir) => resolve(root, dir));
  const eslintrc = options.eslintrc || {};
  eslintrc.enabled = eslintrc.enabled === void 0 ? false : eslintrc.enabled;
  eslintrc.filepath = eslintrc.filepath || "./.eslintrc-auto-import.json";
  eslintrc.globalsPropValue = eslintrc.globalsPropValue === void 0 ? true : eslintrc.globalsPropValue;
  const resolvers = options.resolvers ? [options.resolvers].flat(2) : [];
  const unimport = createUnimport({
    imports,
    presets: [],
    addons: [
      ...options.vueTemplate ? [vueTemplateAddon()] : [],
      resolversAddon(resolvers),
      {
        declaration(dts2) {
          if (!dts2.endsWith("\n"))
            dts2 += "\n";
          return `// Generated by 'unplugin-auto-import'
${dts2}`;
        }
      }
    ]
  });
  const filter = createFilter(
    options.include || [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/],
    options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]
  );
  const dts = preferDTS === false ? false : preferDTS === true ? resolve(root, "auto-imports.d.ts") : resolve(root, preferDTS);
  function generateDTS(file) {
    const dir = dirname(file);
    return unimport.generateTypeDeclarations({
      resolvePath: (i) => {
        if (i.from.startsWith(".") || isAbsolute(i.from)) {
          const related = slash(relative(dir, i.from).replace(/\.ts(x)?$/, ""));
          return !related.startsWith(".") ? `./${related}` : related;
        }
        return i.from;
      }
    });
  }
  async function generateESLint() {
    return generateESLintConfigs(await unimport.getImports(), eslintrc);
  }
  const writeConfigFilesThrottled = throttle(500, writeConfigFiles, { noLeading: false });
  let lastDTS;
  let lastESLint;
  async function writeConfigFiles() {
    const promises = [];
    if (dts) {
      promises.push(
        generateDTS(dts).then((content) => {
          if (content !== lastDTS) {
            lastDTS = content;
            return fs.writeFile(dts, content, "utf-8");
          }
        })
      );
    }
    if (eslintrc.enabled && eslintrc.filepath) {
      promises.push(
        generateESLint().then((content) => {
          if (content !== lastESLint) {
            lastESLint = content;
            return fs.writeFile(eslintrc.filepath, content, "utf-8");
          }
        })
      );
    }
    return Promise.all(promises);
  }
  async function scanDirs() {
    if (dirs == null ? void 0 : dirs.length) {
      await unimport.modifyDynamicImports(async (imports2) => {
        const exports = await scanDirExports(dirs, {
          filePatterns: ["*.{tsx,jsx,ts,js,mjs,cjs,mts,cts}"]
        });
        exports.forEach((i) => i.__source = "dir");
        return modifyDefaultExportsAlias([
          ...imports2.filter((i) => i.__source !== "dir"),
          ...exports
        ], options);
      });
    }
    writeConfigFilesThrottled();
  }
  async function transform(code, id) {
    const s = new MagicString(code);
    await unimport.injectImports(s, id);
    if (!s.hasChanged())
      return;
    writeConfigFilesThrottled();
    return {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true })
    };
  }
  if (!imports.length && !resolvers.length)
    console.warn("[auto-import] plugin installed but no imports has defined, see https://github.com/antfu/unplugin-auto-import#configurations for configurations");
  return {
    root,
    dirs,
    filter,
    scanDirs,
    writeConfigFiles,
    writeConfigFilesThrottled,
    transform,
    generateDTS,
    generateESLint
  };
}
function flattenImports(map, overriding = false) {
  const flat = {};
  toArray2(map).forEach((definition) => {
    if (typeof definition === "string") {
      if (!presets[definition])
        throw new Error(`[auto-import] preset ${definition} not found`);
      const preset = presets[definition];
      definition = typeof preset === "function" ? preset() : preset;
    }
    for (const mod of Object.keys(definition)) {
      for (const id of definition[mod]) {
        const meta = {
          from: mod
        };
        let name;
        if (Array.isArray(id)) {
          name = id[1];
          meta.name = id[0];
          meta.as = id[1];
        } else {
          name = id;
          meta.name = id;
          meta.as = id;
        }
        if (flat[name] && !overriding)
          throw new Error(`[auto-import] identifier ${name} already defined with ${flat[name].from}`);
        flat[name] = meta;
      }
    }
  });
  return Object.values(flat);
}
function modifyDefaultExportsAlias(imports, options) {
  if (options.defaultExportByFilename) {
    imports.forEach((i) => {
      var _a, _b, _c;
      if (i.name === "default")
        i.as = (_c = (_b = (_a = i.from.split("/").pop()) == null ? void 0 : _a.split(".")) == null ? void 0 : _b.shift()) != null ? _c : i.as;
    });
  }
  return imports;
}

// src/core/unplugin.ts
var unplugin_default = createUnplugin((options) => {
  let ctx = createContext(options);
  return {
    name: "unplugin-auto-import",
    enforce: "post",
    transformInclude(id) {
      return ctx.filter(id);
    },
    async transform(code, id) {
      return ctx.transform(code, id);
    },
    async buildStart() {
      await ctx.scanDirs();
    },
    async buildEnd() {
      await ctx.writeConfigFiles();
    },
    vite: {
      async handleHotUpdate({ file }) {
        var _a;
        if ((_a = ctx.dirs) == null ? void 0 : _a.some((dir) => file.startsWith(dir)))
          await ctx.scanDirs();
      },
      async configResolved(config) {
        if (ctx.root !== config.root) {
          ctx = createContext(options, config.root);
          await ctx.scanDirs();
        }
      }
    }
  };
});

export {
  unplugin_default
};
