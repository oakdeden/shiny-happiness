'use strict'

const fs = require('fs')
const path = require('path')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Every .html file directly in src/ becomes a page — drop a file in and it builds
const pages = fs
  .readdirSync(path.resolve(__dirname, 'src'))
  .filter(file => file.endsWith('.html'))
  .map(file => path.basename(file, '.html'))

module.exports = {
  mode: 'development',
  entry: './src/js/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'assets/[name][ext]',
    clean: true
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8080,
    hot: true
  },
  plugins: pages.map(
    page =>
      new HtmlWebpackPlugin({
        template: `./src/${page}.html`,
        filename: `${page}.html`
      })
  ),
  module: {
    rules: [
      {
        // Rewrites `src`/`href` in the page templates so images are emitted to dist/
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: 'style-loader'
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader'
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [autoprefixer]
              }
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader',
            options: {
              sassOptions: {
                // Bootstrap 5 still uses the old `@import` API internally,
                // so silence deprecation warnings coming from node_modules.
                quietDeps: true,
                silenceDeprecations: ['import']
              }
            }
          }
        ]
      }
    ]
  }
}
