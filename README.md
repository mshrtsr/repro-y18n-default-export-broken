# repro-y18n-default-export-broken

minimal reproduction of \_ .

## Summary

In the [`package.json`](https://github.com/yargs/y18n/blob/ad1a31b730a5034218b546e8542bb691b84992b2/package.json), the files specified in `module` and `exports` are mismatched.

- Referring `exports`, `import("y18n")` refers `./index.mjs` of y18n.
- Referring `module`, `import("y18n")` refers `./build/lib/index.js` of y18n.

```json
{
  "exports": {
    ".": [
      {
        "import": "./index.mjs",
        "require": "./build/index.cjs"
      },
      "./build/index.cjs"
    ]
  },
  "type": "module",
  "module": "./build/lib/index.js"
}
```

As a result, some bundler which doesn't support the `exports` field fails to build with yargs as a dependency.

That's because yargs uses the default export of y18n on [`lib/platform-shims/esm.mjs`](https://github.com/yargs/yargs/blob/f37ee6f7da386a1244bf0a0c21b9572f2bb3131b/lib/platform-shims/esm.mjs),
and [`./build/lib/index.js`](https://github.com/yargs/y18n/blob/ad1a31b730a5034218b546e8542bb691b84992b2/lib/index.ts) on y18n doesn't provide the default export.

## Reproduction

I created the minimum reproduction in https://github.com/tasshi-playground/repro-y18n-default-export-broken .

```shell
$ git clone git@github.com:tasshi-playground/repro-y18n-default-export-broken
$ cd repro-y18n-default-export-broken
$ npm install
$ npm run build
```

I examined rollup.js and Vite.
rollup supports `exports` of package.json, and Vite doesn't support due to the bug of https://github.com/vitejs/vite/issues/11676 .

- rollup refers `node_modules/y18n/index.mjs` via `exports`.
- vite refers `node_modules/y18n/build/lib/index.js` via `module`.

<details>
<summary>Log (click to expand)</summary>

### rollup.js tried to build the code `import y18n from "y18n"` (succeeded)

```shell
$ npm run build:rollup:import-default-export-of-y18n

> repro-y18n-default-export-broken@1.0.0 build:rollup:import-default-export-of-y18n
> rollup --config ./rollup.config.default-export.mjs


src/importing-default-export.mjs → dist...
created dist in 49ms

```

### rollup.js tried to build the code `import { y18n } from "y18n"` (failed)

```shell
$ npm run build:rollup:import-named-export-of-y18n

> repro-y18n-default-export-broken@1.0.0 build:rollup:import-named-export-of-y18n
> rollup --config ./rollup.config.named-export.mjs


src/importing-named-export.mjs → dist...
[!] RollupError: "y18n" is not exported by "node_modules/y18n/index.mjs", imported by "src/importing-named-export.mjs".
https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module
src/importing-named-export.mjs (1:9)
1: import { y18n } from "y18n";
            ^
2:
3: console.log(y18n);
    at error (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:210:30)
    at Module.error (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:13578:16)
    at Module.traceVariable (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:13961:29)
    at ModuleScope.findVariable (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:12442:39)
    at Identifier.bind (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:8371:40)
    at CallExpression.bind (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:6165:28)
    at CallExpression.bind (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:9888:15)
    at ExpressionStatement.bind (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:6169:23)
    at Program.bind (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:6165:28)
    at Module.bindReferences (/Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/shared/rollup.js:13574:18)
```

### Vite tried to build the code `import y18n from "y18n"` (failed)

```shell
$ npm run build:vite:import-default-export-of-y18n

> repro-y18n-default-export-broken@1.0.0 build:vite:import-default-export-of-y18n
> vite build --config ./vite.config.default-export.mjs

vite v4.0.4 building for production...
✓ 2 modules transformed.
"default" is not exported by "node_modules/y18n/build/lib/index.js", imported by "src/importing-default-export.mjs".
file: /Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/src/importing-default-export.mjs:1:7
1: import y18n from "y18n";
          ^
2:
3: console.log(y18n);
error during build:
RollupError: "default" is not exported by "node_modules/y18n/build/lib/index.js", imported by "src/importing-default-export.mjs".
    at error (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:2041:30)
    at Module.error (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:13062:16)
    at Module.traceVariable (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:13445:29)
    at ModuleScope.findVariable (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:11926:39)
    at Identifier.bind (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:7855:40)
    at CallExpression.bind (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:5649:28)
    at CallExpression.bind (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:9372:15)
    at ExpressionStatement.bind (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:5653:23)
    at Program.bind (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:5649:28)
    at Module.bindReferences (file:///Users/tasshi/git/mshrtsr/repro-y18n-default-export-broken/node_modules/rollup/dist/es/shared/rollup.js:13058:18)
```

### Vite tried to build the code `import { y18n } from "y18n"` (succeeded)

```shell
$ npm run build:vite:import-named-export-of-y18n

> repro-y18n-default-export-broken@1.0.0 build:vite:import-named-export-of-y18n
> vite build --config ./vite.config.named-export.mjs

vite v4.0.4 building for production...
✓ 2 modules transformed.
dist/importing-named-export.vite.cjs  2.84 kB │ gzip: 1.10 kB
```

</details>

## Idea

The file specified in the `module` field should be the same as `exports`.

```diff
{
  "exports": {
    ".": [
      {
        "import": "./index.mjs",
        "require": "./build/index.cjs"
      },
      "./build/index.cjs"
    ]
  },
  "type": "module",
-   "module": "./build/lib/index.js",
+   "module": "./index.mjs",
}
```

## Lisence

This project is licensed under the [MIT license.](./LICENSE)
