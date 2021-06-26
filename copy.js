/**
 * Server for Serving the Build Folder
 * - enabling BrowserRouter with HsitoryFallback (all non existing routing to `/index.html`
 * - beautify URL for `/` instead of `/index.html`
 */
const path = require('path')
const fs = require('fs')
const anymatch = require('anymatch')
const gulpRename = require('gulp-rename')
const {parallel, series, ...gulp} = require('gulp')
const {ampOptimizer} = require('create-amp-page/htmlTask/ampOptimizer')
const {cleanHtmlCss} = require('create-amp-page/htmlTask/cleanHtmlCss')
const del = require('del')

const walk = function(dir, done) {
    let results = []
    fs.readdir(dir, function(err, list) {
        if(err) return done(err)
        let i = 0;
        (function next() {
            let file = list[i++]
            if(!file) return done(null, results)
            file = path.resolve(dir, file)
            fs.stat(file, function(err, stat) {
                if(stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res)
                        next()
                    })
                } else {
                    results.push(file)
                    next()
                }
            })
        })()
    })
}

const handleFileCopyMangle = (src, dist, distName, cleanInlineCSSWhitelist, resolve, reject) => {
    const startHtmlSize = Buffer.byteLength(fs.readFileSync(src).toString(), 'utf8')
    gulp.src(src)
        .on('error', err => {
            if(process.env.NODE_ENV !== 'production') {
                console.warn(err)
                resolve()
            } else {
                reject(err)
            }
        })
        // // middlewares after CSS injection
        .pipe(cleanHtmlCss({
            minifyHtml: true,
            cleanInlineCSS: true,
            cleanInlineCSSWhitelist,
        }))
        .pipe(ampOptimizer(true))
        .pipe(gulpRename(distName))
        .pipe(gulp.dest(dist))
        .on('end', () => {
            // todo: add image resizing to react backend rendering, and what for frontend?
            const cleanedHtmlSize = Buffer.byteLength(fs.readFileSync(path.join(dist, distName)).toString(), 'utf8')
            del(src).then(() => {
                console.log('Cleaned React Static HTML + CSS Size: ' + cleanedHtmlSize + ' bytes, saved ' + (startHtmlSize - cleanedHtmlSize) + ' bytes @' + distName)
                resolve()
            })
        })
}


const srcDir = path.resolve('build')
walk(srcDir, (err, results) => {
    // first match all`*.html` files as DB what exists
    const matchers1 = ['**/**.html']
    const allHtmlFiles = results.filter(anymatch(matchers1))
    // second match all`/index.html` files, as these must maybe copied one level upwards
    const matchers2 = ['**/*/index.html']
    const indexHtmlFiles = allHtmlFiles.filter(anymatch(matchers2))
    const fileHandler = []
    const testForEmptyFolders = []
    let fileHandlerI = 0
    indexHtmlFiles.forEach(src => {
        const relative = src.substr(srcDir.length + 1)
        const folders = path.dirname(relative).replace(/\\/, '/').split('/')
        const directParent = folders.pop()
        const relativeFolders = [...folders] // breaking reference
        folders.push(directParent + '.html')
        const preSnapHtml = path.resolve(srcDir, ...folders)
        // only `index.html` files at this position, deeper then main root, as these must maybe copied one level upwards
        // and only when there is a file which `react-snap` may have used to generate the current `index.html`, e.g. in `/blog/index.html` a `/blog.html` is required
        if(path.dirname(relative) !== '.' && allHtmlFiles.indexOf(preSnapHtml) !== -1) {
            console.log('Pre-Snap exist: ', preSnapHtml)
            fileHandlerI++
            fileHandler.push(new Promise((resolve, reject) => {
                fs.unlink(preSnapHtml, err1 => {
                    if(err1) {
                        if(process.env.NODE_ENV !== 'production') {
                            console.warn(err1)
                            resolve()
                            return
                        } else {
                            reject(err1)
                            return
                        }
                    }
                    console.log('Pre-Snap, deleted: ', preSnapHtml)
                    testForEmptyFolders.push([...relativeFolders, directParent])
                    // todo: `cleanInlineCSSWhitelist` should not be configured at two positions
                    handleFileCopyMangle(src, srcDir, path.join(...relativeFolders, directParent + '.html'), ['#anc-*', '#fn*', '#root-pwa'], () => {
                        console.log('Snap React renamed: ', relative)
                        resolve()
                    }, reject)
                })
            }))
        }
    })
    Promise.all(fileHandler).then(res => {
        if(res.length === fileHandlerI) {
            console.log('Done moving static react `' + fileHandlerI + '` pages, total html: `' + allHtmlFiles.length + '`')
            testForEmptyFolders
                .sort((a, b) => b.length - a.length)
                .forEach((maybeEmptyFolder) => {
                    const currentFolder = path.join(srcDir, ...maybeEmptyFolder)
                    fs.existsSync(currentFolder) &&
                    fs.readdir(currentFolder, function(err, files) {
                        if(err) {
                            if(process.env.NODE_ENV === 'production') {
                                console.error(err)
                                throw new Error('Error accessing folder: ' + maybeEmptyFolder)
                            } else {
                                console.error('Error accessing folder: ' + maybeEmptyFolder, err)
                                return
                            }
                        }
                        if(!files.length) {
                            // todo: rmDirSync returns void, add other check of correct deletion
                            fs.rmdirSync(currentFolder)
                            console.log('Deleted folder: ' + maybeEmptyFolder)
                        }
                    })
                })
        }
    })
})
