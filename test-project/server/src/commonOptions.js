export const commonOptions = {
  entryPoints: ["src/server.ts"],
  bundle: true,
  platform: "node",
  packages: "external",
  outfile: "build/server.js",
  format: "esm",
}
