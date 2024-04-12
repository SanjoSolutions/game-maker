import * as esbuild from "esbuild"
import start from "@es-exec/esbuild-plugin-start"

const context = await esbuild.context({
  entryPoints: ["src/server.mts"],
  bundle: true,
  platform: "node",
  outfile: "build/server.js",
  format: "esm",
  plugins: [
    start({
      script: "node --enable-source-maps build/server.js",
    }),
  ],
  sourcemap: true,
})

await context.watch()
