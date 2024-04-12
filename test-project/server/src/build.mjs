import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["src/server.mts"],
  bundle: true,
  platform: "node",
  outfile: "build/server.js",
  format: "esm",
})
