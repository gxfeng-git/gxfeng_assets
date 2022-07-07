'use strict'
const { resolve, join, exitsFile } = require('path')
const glob = require('glob')

const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const favicon = './src/static/favicon.ico'

const setMPA = () => {
  const entry = {}
  const htmlWebpackPlugins = []
  //同步读取src目录下符合条件的文件路径
  const entryFiles = glob.sync(join(__dirname, './src/pages/*/index.js'))

  Object.keys(entryFiles).map(index => {
    const entryFile = entryFiles[index]

    const match = entryFile.match(/src\/pages\/(.*)\/index\.js/)
    const pageName = match && match[1]

    entry[pageName] = entryFile
    // 动态生成HtmlWebpackPlugin对象
    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        inlineSource: '.css$',
        template: join(__dirname, `src/pages/${pageName}/index.html`),
        filename: `${pageName}.html`,
        favicon: favicon ? favicon : null,
        chunks: ['vendors', pageName],
        inject: 'body',
        minify: {
          html5: true,
          removeRedundantAttributes: true, // 删除多余的属性
          collapseWhitespace: true, // 折叠空白区域
          removeAttributeQuotes: true, // 移除属性的引号
          removeComments: true, // 移除注释
          collapseBooleanAttributes: true // 省略只有 boolean 值的属性值 例如：readonly checked
        }
      })
    )
  })

  return {
    entry,
    htmlWebpackPlugins
  }
}

const { entry, htmlWebpackPlugins } = setMPA()

module.exports = {
  resolve: {
    alias: {
      '@': resolve('src')
    }
  },
  entry: entry,
  output: {
    path: resolve(__dirname, 'dist'), // html, css, js 图片等资源文件的输出路径，将所有资源文件放在 dist 目录
    filename: 'js/[name].js' // 每个入口 js 文件的生成配置
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(sass|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.js$/,
        // 使用 es6 开发，这个加载器帮我们处理
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        //文件加载器，处理文件静态资源
        test: /\.(woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 0,
            name: 'img/[name].[ext]',
            esModule: false
          }
        }
      },
      {
        test: /\.html$/,
        use: ['html-withimg-loader']
      }
    ]
  },
  plugins: [
    new Webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    ...htmlWebpackPlugins,
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/static/'
        }
      ]
    }),
    new CleanWebpackPlugin()
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          // name: 'commons', // 提取出来的文件命名
          name: 'common/common', //  即先生成common文件夹
          chunks: 'initial', // initial表示提取入口文件的公共css及
          // js部分
          // chunks: 'all', // 提取所有文件的公共部分
          test: '/.css$/', // 只提取公共css ，命名可改styles
          minChunks: 2, // 表示提取公共部分最少的文件数
          minSize: 0 // 表示提取公共部分最小的大小
          // 如果发现页面中未引用公共文件，加上enforce: true
        }
      }
    },
    minimize: true,
    minimizer: [
      // css压缩
      new CSSMinimizerPlugin(),
      new TerserPlugin({
        extractComments: false //不将注释提取到单独的文件中
      })
    ]
  }
}
