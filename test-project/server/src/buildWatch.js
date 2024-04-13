import * as esbuild from "esbuild"
import start from "@es-exec/esbuild-plugin-start"
import { commonOptions } from "./commonOptions.js"

const context = await esbuild.context({
  ...commonOptions,
  plugins: [
    start({
      script: "node --enable-source-maps build/server.js",
    }),
  ],
  sourcemap: true,
})

await context.watch()
