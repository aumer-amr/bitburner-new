import { context } from 'esbuild';
import { BitburnerPlugin } from 'esbuild-bitburner-plugin';
import fs from 'fs/promises';
import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';

const ReactFixer = {
  name: 'ReactFixer',
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /\.[jt]sx?$/ }, async opts => {

      let contents = await fs.readFile(opts.path, "utf8");

      contents = contents
        .replace(/(import \* as React from "react")/g, `import React from "@react"`)
        .replace(/(import React from 'react')/g, `import React from '@react'`)

      return {
        contents,
        loader: "tsx",
      };
    });
  }
}

const CSSSpoofPlugin = {
  name: 'CSSSpoofPlugin',
  async setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /.*?\.css$/ }, async opts => {
      let file = await fs.readFile(opts.path, { encoding: 'utf8' });

      file = (await postcss([tailwindcss]).process(file, {
        from: opts.path,
      })).toString();

      return {
        loader: 'jsx',
        contents: `\
        import React from 'react';

        export default function () {
          return <style>{\`${file}\`}</style>;
        }\
        `
      };
    });
  }
};

const createContext = async () => await context({
  entryPoints: [
    'servers/**/*.js',
    'servers/**/*.jsx',
    'servers/**/*.ts',
    'servers/**/*.tsx',
  ],
  outbase: "./servers",
  outdir: "./build",
  plugins: [
    ReactFixer,
    CSSSpoofPlugin,
    BitburnerPlugin({
      port: 12525,
      types: 'NetscriptDefinitions.d.ts',
      remoteDebugging: true
    })
  ],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  keepNames: true,
  logLevel: 'debug',
});

const ctx = await createContext();
ctx.watch();