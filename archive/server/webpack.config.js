const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { Server } = require('http');
// const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {

  if (argv.mode === 'development') {
    return {
      ...baseConfig,
      mode: 'development',
      // source-map allows developers to see which file in code base
      // correspond to logs in the console
      devtool: 'source-map',
      // devServer configures yarn start - webpack serve
      devServer: {
        compress: true,
        port: 3000,
        contentBase: path.resolve(__dirname, 'src'),
        historyApiFallback: true,
        // Proxy to port on which the server is running
        proxy: {
          '/': {
            target: 'http://localhost:8000',
            headers: {
              "X-Forwarded-Email": "test-user@localdev"
            }
          }
        },
      },
    };
  }

  if (argv.mode === 'production') {
    return {
      ...baseConfig,
      mode: 'production',
      // extractComments: false, prevents the creation of the
      // bundle.js.license.txt file in the build/ directory
      /*
      optimization: {
        minimizer: [new TerserPlugin({
          extractComments: false,
        })],
      },
      */
    };
  }

  return baseConfig;
};

const baseConfig = {
  name: 'server',
  target: 'node',
  output: {
    // Configures where build directory is created
    path: path.join(__dirname, '../server/build'),
    // Configures what the minified build file is called
    filename: 'bundle.js',
    publicPath: "/",
  },

  // Specifies the entrypoint of the application
  entry: {
    index: "./index.js",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },

      {
        test: [/\.scss$/, /\.css$/],
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(ttf|png|jpe?g|svg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/, // eslint-disable-line security/detect-unsafe-regex
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }]
      },

      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/'
            }
          },
        ],
      },

      // Add additional rules to load addition file types into the bundle
    ],
  },

  plugins: [
    new HtmlWebPackPlugin({
      template: path.join(__dirname, '/index.html'),
    //   favicon: "./src/images/sheep-icon.svg",
    }),
    new NodePolyfillPlugin(),

    new Dotenv({
      path: path.resolve(__dirname, '..', '.env'),
  }),
  ],
};