import * as esbuild from "esbuild"
import { commonOptions } from "./commonOptions.js"

await esbuild.build({
  ...commonOptions,
})
