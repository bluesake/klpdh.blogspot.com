const path = require('path')
const {series, parallel, ...gulp} = require('gulp')
const webpack = require('webpack-stream')
const isWsl = require('is-wsl')
const TerserPlugin = require('terser-webpack-plugin')

//
// Full webpack config for:
// - ESNext compiling configured by e.g. `babel.config.json`/`babel.config.js`
// - Asset importing like webfonts, css, scss, json, svg (SVG with components `import * as Icon form './Icon`
// - Importing css from node_modules as lazysingleton to be able to unmount them again!
// - Linting with `eslint` and when used `react` and `tsconfig`!
// - Typescript compilation and checks, simply use `file.ts` as entry instead of `file.js`
// - React compilation and code splitting, just install & register e.g. `react-component` preset/plugin
// - minimizing and bundling
// - when routing / loadables only `react-component` works when using `react-snap` for static site generation
//
//
// Files:
// - .eslintignore -> what linting should ignore
// - .eslintrc -> linting rules
// - babel.config.json -> babel presets and plugins
// - Gulpfile.exnext.js -> all webpack rules
// - Gulpfile.js -> import exnext rules and uses `wrap` on `ampCreator`
//                  here entry points are configured!
// - tsconfig.json -> Compiler settings for Typescript
// - src/html/_head_end.twig -> embedding / linking of build JS
// - src/js/main.js -> default source entrypoint
//

const isProd = process.env.NODE_ENV === 'production'

function webpackTask(src, dist, browsersync, watch) {
    return function webpacker() {
        return gulp.src(src)
            .pipe(webpack({
                watch,
                mode: isProd ? 'production' : 'development',
                output: {
                    //filename: 'js/[name].[hash:8].js',
                    filename: 'js/[name].js',
                    chunkFilename: 'js/[name].chunk.js',
                    //chunkFilename: 'js/[name].chunk.[hash:8].js',
                    futureEmitAssets: true,
                },
                performance: {
                    // hints: false,
                },
                resolve: {
                    modules: [
                        'node_modules',
                    ],
                },
                module: {
                    rules: [{
                        enforce: 'pre',
                        test: /\.(js|jsx|ts|tsx)$/,
                        include: [
                            path.resolve(path.dirname(src)),
                            //path.join(context, 'src'),
                        ],
                        options: {
                            cache: true,
                            formatter: require.resolve('react-dev-utils/eslintFormatter'),
                            eslintPath: require.resolve('eslint'),
                            emitWarning: !isProd,
                            //failOnError: true,
                            //failOnWarning: true,
                        },
                        loader: require.resolve('eslint-loader'),
                    }, {
                        test: /\.(js|jsx|ts|tsx)$/,
                        include: [
                            path.resolve(path.dirname(src)),
                            //path.join(context, 'src'),
                        ],
                        use: [{
                            loader: 'babel-loader',
                            options: {
                                // This is a feature of `babel-loader` for webpack (not Babel itself).
                                // It enables caching results in ./node_modules/.cache/babel-loader/
                                // directory for faster rebuilds.
                                cacheDirectory: true,
                                // See #6846 for context on why cacheCompression is disabled
                                cacheCompression: false,
                                compact: isProd,
                            },
                        }],
                    }, {
                        // Process any JS outside of the app with Babel.
                        // Unlike the application JS, we only compile the standard ES features.
                        test: /\.(js|mjs)$/,
                        exclude: [
                            /@babel(?:\/|\\{1,2})runtime/,
                            path.resolve(path.dirname(src)),
                            //path.join(context, 'src'),
                        ],
                        loaders: 'babel-loader',
                        options: {
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            presets: [
                                [
                                    require.resolve('babel-preset-react-app/dependencies'),
                                    {helpers: true},
                                ],
                            ],
                            cacheDirectory: true,
                            cacheCompression: false,

                            // If an error happens in a package, it's possible to be
                            // because it was compiled. Thus, we don't want the browser
                            // debugger to show the original code. Instead, the code
                            // being evaluated would be much more helpful.
                            sourceMaps: false,
                        },
                    }, {
                        test: /\.html$/i,
                        // exclude: [/node_modules/],
                        use: [{
                            loader: 'ejs-loader',
                        }, {
                            loader: 'extract-loader',
                        }, {
                            loader: 'html-loader',
                            options: {
                                minimize: isProd,
                                interpolate: false,
                            },
                        }],
                    }, {
                        test: /\.css$/i,
                        exclude: [/node_modules/],
                        loader: 'style-loader!css-loader',
                    }, {
                        test: /\.css$/i,
                        include: [/node_modules/],
                        use: [
                            {loader: 'style-loader', options: {injectType: 'lazySingletonStyleTag'}},
                            'css-loader',
                        ],
                    }, {
                        test: /\.s[ac]ss$/i,
                        exclude: [/node_modules/],
                        use: [
                            'style-loader',
                            'css-loader',
                            'sass-loader',
                        ],
                    }, {
                        // the following 3 rules handle font extraction
                        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
                    }, {
                        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                        loader: 'file-loader',
                    }, {
                        test: /\.otf(\?.*)?$/,
                        use: 'file-loader?name=/fonts/[name].[ext]&mimetype=application/font-otf',
                    }, {
                        loader: 'file-loader',
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise be processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|css|s[ac]ss|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'js/assets/[name].[hash:8].[ext]',
                        },
                    }],
                },
                optimization: {
                    runtimeChunk: false,
                    splitChunks: false,
                    /*splitChunks: {
                        chunks: 'all',
                        name: false,
                        cacheGroups: {
                            default: false,
                            vendors: false,
                            vendor: {
                                chunks: 'all',
                                test: /node_modules/,
                            },
                        },
                    },*/
                    minimize: isProd,
                    minimizer: [new TerserPlugin({
                        terserOptions: {
                            parse: {
                                // We want terser to parse ecma 8 code. However, we don't want it
                                // to apply any minification steps that turns valid ecma 5 code
                                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                                // sections only apply transformations that are ecma 5 safe
                                // https://github.com/facebook/create-react-app/pull/4234
                                ecma: 8,
                            },
                            compress: {
                                ecma: 5,
                                warnings: false,
                                // Disabled because of an issue with Uglify breaking seemingly valid code:
                                // https://github.com/facebook/create-react-app/issues/2376
                                // Pending further investigation:
                                // https://github.com/mishoo/UglifyJS2/issues/2011
                                comparisons: false,
                                // Disabled because of an issue with Terser breaking valid code:
                                // https://github.com/facebook/create-react-app/issues/5250
                                // Pending further investigation:
                                // https://github.com/terser-js/terser/issues/120
                                inline: 2,
                            },
                            mangle: {
                                safari10: true,
                            },
                            // Added for profiling in devtools
                            keep_classnames: false,
                            keep_fnames: false,
                            /*keep_classnames: isEnvProductionProfile,
                            keep_fnames: isEnvProductionProfile,*/
                            output: {
                                ecma: 5,
                                comments: false,
                                // Turned on because emoji and regex is not minified properly using default
                                // https://github.com/facebook/create-react-app/issues/2488
                                ascii_only: true,
                            },
                        },
                        // Use multi-process parallel running to improve the build speed
                        // Default number of concurrent runs: os.cpus().length - 1
                        // Disabled on WSL (Windows Subsystem for Linux) due to an issue with Terser
                        // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
                        parallel: !isWsl,
                        // Enable file caching
                        cache: true,
                        sourceMap: true,
                    })],
                },
                plugins: [
                    // todo: mock inject `runtimeChunk` with twig / gulp tass
                ],
            }))
            .pipe(gulp.dest(dist))
            .pipe(browsersync.stream())
    }
}

module.exports = webpackTask
