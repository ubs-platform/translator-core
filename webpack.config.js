const path = require("path");

module.exports = {
  //devtools ile debuglayabilmek için
  devtool: "source-map",
  //production için gereksiz kodları kaldırıyor
  mode: "development",
  //ana ts dosyası, projenin src klasörü içindeki "index.ts".
  //Burada import ettiğiniz modüller index.js içinde ekleniyor olacak.
  entry: "./src/index.ts",
  //hangi dosyalar dönüştürülecek
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  //dosya uzantısına göre dönüştürücüler içeriyor,
  //burada ts dosyalarının javascripte dönüştürülmesi yer almakta.
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  // bulunduğu path'te compile edilmiş
  //hali olan "index.js" kaydediliyor
  output: {
    path: path.resolve(__dirname),
    filename: "index.js",
  },

  //sadece web sayfası için compile etmeyecekseniz, bunu node, node-webkit, electron için farklı build almak için ekstra
  // işlem yapmakta, (bkz: https://webpack.js.org/configuration/target/)
 // target: "node",
};