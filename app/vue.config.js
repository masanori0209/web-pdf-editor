module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/pdf-editor/' : '/',
  pages: {
    index: {
      entry: "src/main.js",
      title: "P-EDIT | PDF編集サービス"
    }
  }
}