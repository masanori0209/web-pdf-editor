const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const webpack = require("webpack");
const path = require("path");
module.exports = {
  chainWebpack: config => {
    config
      .plugin("wasm-pack")
      .use(WasmPackPlugin)
      .init(
        Plugin =>
          new Plugin({
            crateDirectory: path.resolve(__dirname, "../pkg")
          })
      )
      .end()
      .plugin("text-encoder")
      .use(webpack.ProvidePlugin)
      .init(
        Plugin =>
          new Plugin({
            TextDecoder: ["text-encoding", "TextDecoder"],
            TextEncoder: ["text-encoding", "TextEncoder"]
          })
      )
      .end();
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/pdf-editor/' : '/',
  pages: {
    index: {
      entry: "src/main.js",
      title: "P-EDIT | PDF編集サービス"
    }
  }
}