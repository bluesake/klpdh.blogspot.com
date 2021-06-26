# Create AMP Page Starter ⚡

[![Netlify Status](https://api.netlify.com/api/v1/badges/c2214cb4-af67-4525-a4ce-a4c68d3fa70d/deploy-status)](https://app.netlify.com/sites/create-amp-page/deploys)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

Starting point for [AMP](https://amp.dev) pages generated with [create-amp-page](https://github.com/bemit/create-amp-page) and using [@formanta/sass](https://formanta.bemit.codes) for styling.
Directly deploy with [netlify cms](https://www.netlifycms.org/) as git managed static site generator!

[![Deploy to Netlify](https://img.shields.io/badge/Deploy%20to%20netlify-success?style=for-the-badge&logo=netlify&labelColor=0e1e25&color=00C7B7)](https://app.netlify.com/start/deploy?repository=https://github.com/bemit/create-amp-page-starter) [![Run on CodeSandbox](https://img.shields.io/badge/run%20on%20CodeSandbox-blue?labelColor=fff&logoColor=505050&style=for-the-badge&logo=codesandbox)](https://codesandbox.io/s/github/bemit/create-amp-page-starter)

    npm i
    npm start

    # or
    npm run build

    npm run tasks
    npm run clean

    # serve `build` with `server.js`
    # for checking build version at port :3030
    npm run serve

Open [localhost:4488](http://localhost:4488) for your local page preview and change something in `src/*`!

[![Features](https://img.shields.io/badge/Features-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#features)

[![File Structure](https://img.shields.io/badge/File%20Structure-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#default-file-structure)

[![Netlify CMS](https://img.shields.io/badge/Netlify%20CMS-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#netlify-cms)

[![Component Library](https://img.shields.io/badge/Component%20Library-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#amp-component-library)

[![License](https://img.shields.io/badge/License-blue?labelColor=333&style=for-the-badge&logo=vercel&logoColor=333&color=f4f4f4)](#license)

## Features

Provides a basic file structure and uses the gulp build tasks of create-amp-page, with additionally: markdown and netlify cms.

- uses `.scss` files
- page data as `.json` and `.md` with frontmatter
- twig templates and pages
    - pages by template files in `src/html/pages`
    - pages with folders of frontmatter / collections
    - using page filename for
        - frontmatter files resolution
        - links generation (e.g. canonical)
    - use custom data, functions, filters and more
- media optimizing for png, jpg, gif, svg
- markdown to HTML generation, preinstalled markdown-it plugins for extended syntax
- basic Twig template for AMP or none AMP pages
    - `ampEnabled = true` as template variable enables the needed AMP parts
    - HTML for AMP scripts
    - inline CSS parts for AMP, also where the CSS is injected by gulp task
    - `amp` attribute at `html` tag
- AMP Optimizer and removing unused CSS for production
- Headless Netlify CMS for site generation supported
    - uses also frontmatter
    - git repository management and netlify CI/CD
    - identity management by netlify, github and more
    - **easily removable** when not wanted:
        - delete `public/admin` folder and remove the netlify cms part in `src/html/_base.twig` block `foot_js`
- supports easy addition of ESNext and React, see [feature/esnext](#featureesnext)

## Default File Structure

- `build` dist folder after running `npm run build` or while `npm run start`
- `public` with general files in root like `manifest.json`
- `public/admin` config and setup files for netlify cms
- `src/api` may be used as mock api
- `src/data` contains the page frontmatter and data
- `src/html` is the base for all twig templates
- `src/html/pages` will be build to individual HTML pages
- `src/media` may contain images
- `src/styles/main.scss` is the style sheet

## Netlify CMS

This starter repository supports one click deployment on netlify, in your netlify project the identity handling must be setup - and you are ready! The template files, scripts and content schemas are already configured.

Setup identity management and adjust the email templates:

1. Setup netlify project
    - In netlify project, under identity: click `enable identity`
    - Click on `Settings & Usage`
    - Scroll to `Registration preferences` and change to `Invite only`
    - Optional, recommended: add external providers with default config like GitHub
    - Scroll to `Git Gateway` and enable it
    - Now the general **identity handling is working**
2. **Change email** template paths in netlify, read why below
    - `Invitation template` to: `/email/invitation.html`
    - `Confirmation template` to: `/email/confirmation.html`
    - `Recovery template` to: `/email/recovery.html`
    - `Email change template` to: `/email/email-change.html`
3. **Invite yourself** in the project's identity management
4. Ready to login under `https://<your-page-name>.netlify.app/admin/`, your page is published at `https://<your-page-name>.netlify.app/`
5. Check `netlify.toml` for deployment settings like basic auth, edit the CMS content schema in `public/admin/config.yml`

This is an AMP boilerplate and can't use netlifys custom JS login redirect-handling, the login would be buggy: after accepting the invite you will be directed to `/`, this triggers the login correctly (JWT exchange) when the identity widget is loaded, but you will not be redirected to `/admin/` again. To solve this, the email templates must be changed and `/admin/` added between domain and `#` before the tokens, the templates at `src/email/` are already adjusted. For `ampEnabled=false` the identity widget will be loaded by default in frontend, you may remove it in `src/html/_base.twig`. The email templates are copied to `build/email` as netlify needs normal HTTP access.

Take a look at the [authentication documentation for netlify cms](https://www.netlifycms.org/docs/add-to-your-site/#authentication), check how to [configure the cms](https://www.netlifycms.org/docs/configuration-options/) and checkout the [default widgets](https://www.netlifycms.org/docs/widgets/#default-widgets).


## AMP Component Library

This starter will contain more and more ready to use AMP components and their CMS definitions when needed.

**Universal Twig functions**, used within templates, are included in `create-amp-page`, check out the [function docs](https://github.com/bemit/create-amp-page#twig-functions)

### Twig Embed Image

Displays an `img` or `amp-img` tag using `ampEnabled`, `layout` defaults to 'responsive'. Set's width and height using `getImage` fn, adds sha1 cachebuster.

> todo: srcset and image resizing support

```twig
{% embed 'blocks/image.twig' with {
    src: '/media/img-01.png',
    alt: 'A blog hero image',
    classes: 'mb2',
    layout: 'responsive',
} %}
{% endembed %}
```

## Feature/ESNext

This is not really AMP compatible, or harder to develop e.g. SSL for local `amp-script` debugging, max 150KB of total script sizes. Suites non-AMP pages perfectly. Use with AMP when you know what you do!

### ESNext Client Side

> beta: webpack and babel config with `wrap` on `ampCreator`

In `feature/esnext` a modern webpack & babel buildsetup is preconfigured.

Start coding in ES6+, Typescript and React, use babel plugins and more.

Embed or reference (`src`) the produced asset files directly.

Check the file level [differences between feature/esnext and master](https://github.com/bemit/create-amp-page-starter/compare/feature/esnext) starter template. Will be documented here when finalized as easy reproducible steps.

### React Static

Render your React directly at the build process, clean and rich HTML for SEO and client side speedup!

> alpha: it works, but features need optimizing / coworking-with-twig, like resizing used images
>
> template structure must be adjusted before using snap, as every dynamic thing must be rendered with react and not through twig
> or react-snap uses a different twig template for each page (seems to be hard)

Enabled in the `feature/esnext` branch, using [react-snap](https://github.com/stereobooster/react-snap) for "server side react rendering" and fixing [react-snap#493](https://github.com/stereobooster/react-snap/issues/493) through the custom `/copy.js`, adding the HTML cleaning and optimizing tasks again.

Commands:

    # use `snap-build` now instead of `build`
    npm run snap-build

## License

This project is free software distributed under the **MIT License**.

See: [LICENSE](LICENSE).

### Contributors

By committing your code/creating a pull request to this repository you agree to release the code under the MIT License attached to the repository.

## Copyright

2020 | [Michael Becker](https://mlbr.xyz), [bemit UG (haftungsbeschränkt)](https://bemit.codes)

