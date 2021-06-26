/**
 * Server for Serving the Build Folder
 * - enabling BrowserRouter with HsitoryFallback (all non existing routing to `/index.html`
 * - beautify URL for `/` instead of `/index.html`
 */
const path = require('path')
const fs = require('fs')
const express = require('express')

const app = express()

const publicDir = path.resolve(__dirname, 'build')
// const historyFallback = 'index.html'
const historyFallback = false

app.use(function(req, res, next) {
    if(req.path.indexOf('.') === -1) {
        const file = publicDir + req.path + '.html'
        fs.access(file, function(err) {
            if(!err) {
                req.url += '.html'
                console.log(req.url, req.path)
            }
            next()
        })
    } else {
        next()
    }
})
app.use(express.static(publicDir))
/*
app.get('/*', (req, res) => {
    if(historyFallback) {
        res.sendFile(path.join(publicDir, 'index.html'))
    } else {
        // this is for react static 4040er
        res.sendFile(path.join(publicDir, '404.html'))
    }
})*/

app.listen(3030, () => {
    console.log('Server started on port http://localhost:3030')
})
