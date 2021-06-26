'use strict'
const path = require('path')
const {ampCreator} = require('create-amp-page')
const markdownit = require('markdown-it')
const {adjustHeadingLevel} = require('./markdown-it-headline-adjust')

const liveUrl = 'https://create-amp-page.netlify.app/'

const makePathFromFile = file => path.basename(file).replace('.twig', '')

// for infos check `create-amp-page` docs or typings/inline-doc!
module.exports = ampCreator({
    port: 4488,
    paths: {
        styles: 'src/styles',
        stylesInject: 'main.css',
        html: 'src/html',
        htmlPages: 'src/html/pages',
        media: 'src/media',
        copy: [
            {src: ['src/api/*'], prefix: 1},
            {src: ['public/*'], prefix: 2},
            {src: ['src/email/*'], prefix: 1},
            {src: ['public/**/*'], prefix: 1},
        ],
        dist: 'build',
        distMedia: 'media',
        distStyles: 'styles',
    },
    ampOptimize: process.env.NODE_ENV === 'production',
    cleanInlineCSS: process.env.NODE_ENV === 'production',
    cleanInlineCSSWhitelist: [
        // headline anchors
        '#anc-*',
        // footsnotes
        '#fn*',
    ],
    collections: [{
        data: 'src/data/blog/*.md',
        tpl: 'src/html/blog.twig',
        base: 'blog/',
    }],
    twig: {
        data: {
            ampEnabled: true,
        },
        json: (file) => 'src/data/' + makePathFromFile(file) + '.json',
        fm: (file) => {
            return 'src/data/' + makePathFromFile(file) + '.md'
        },
        fmMap: (data, file) => ({
            head: {
                title: data.attributes.title,
                description: data.attributes.description,
                lang: data.attributes.lang,
            },
            links: {
                canonical: makePathFromFile(file.path) === 'index' ? liveUrl : liveUrl + makePathFromFile(file.path),
            },
            hero_image: data.attributes.hero_image,
            content: renderMd(data.body),
        }),
    },
    watchFolders: {
        twig: ['src/data/**/*.json', 'src/data/**/*.md'],
        sass: [],
        media: [],
    },
    prettyUrlExtensions: ['html'],
})

const slugify = s => 'anc-' + encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/&/g, ''))
const md = markdownit({
    // html: true,
    xhtmlOut: true,
    linkify: true,
    typographer: true,
})
    .use(adjustHeadingLevel, {firstLevel: 2})
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-abbr'))
    .use(require('markdown-it-anchor'), {
        permalink: true, permalinkBefore: true, permalinkSymbol: '#',
        level: 3,
        slugify,
    })
    .use(require('markdown-it-toc-done-right'), {
        slugify,
        level: 3,
    })
    .use(require('markdown-it-deflist'))
    .use(require('markdown-it-ins'))
    .use(require('markdown-it-mark'))


const defaultLinkRenderer = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const hrefRaw = tokens[idx].attrs && tokens[idx].attrs.reduce((v, prev) => prev || v[0] === 'href')
    const href = hrefRaw ? hrefRaw[1] : ''
    if(
        href.indexOf('http://') === 0 ||
        href.indexOf('https://') === 0 ||
        href.indexOf('ftp://') === 0 ||
        href.indexOf('ftps://') === 0
    ) {
        // add target blank and security attrs to any external/full url
        tokens[idx].attrPush(['target', '_blank'])
        tokens[idx].attrPush(['rel', 'noreferrer noopener'])
    }

    return defaultLinkRenderer(tokens, idx, options, env, self)
}

// plugin for advanced use cases:
// https://github.com/markdown-it/markdown-it-container

const renderMd = (text) => {
    return md.render(text)
}
const renderInlineMd = (text) => {
    return md.renderInline(text)
}
