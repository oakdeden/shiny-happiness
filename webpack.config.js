'use strict'

const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch {
    // ignore if .env is missing
  }
}

// Every .html file directly in src/ becomes a page — drop a file in and it builds.
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
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
    clean: true
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8080,
    hot: true,
    proxy: [{ context: ['/api'], target: 'http://localhost:3003', changeOrigin: true }]
  },
  plugins: [
    ...pages.map(
      page =>
        new HtmlWebpackPlugin({
          template: `./src/${page}.html`,
          filename: `${page}.html`,
          chunks: page === 'generator' ? [] : ['main']
        })
    ),
    new webpack.DefinePlugin({
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || '')
    })
  ],
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
        // Emit plain .css files (e.g. generator.css) referenced via <link> in HTML
        // html-loader rewrites the href to the hashed output path automatically
        test: /\.css$/i,
        resourceQuery: /asset/, // only match ?asset imports (html-loader uses this)
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
