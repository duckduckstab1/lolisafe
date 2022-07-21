# lolisafe, a small safe worth protecting

[![safe.fiery.me](https://i.fiery.me/upN1Q.png)](https://safe.fiery.me)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/WeebDev/lolisafe/master/LICENSE)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Features

* Powered by [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js/) & [HyperExpress](https://github.com/kartikk221/hyper-express) for a much more performant web server, due to being a Node.js binding of [uWebSockets](https://github.com/uNetworking/uWebSockets) written in C & C++.
* Powered by [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for performant SQLite3 database (using [Knex.js](https://knexjs.org/) for abstraction, thus support for other database engines *may* also come in the future).
* Faster file hashing for duplicates detection by using [BLAKE3](https://github.com/BLAKE3-team/BLAKE3) hash function, powered by [blake3](https://github.com/connor4312/blake3) Node.js library.
* ClamAV virus scanning support for Linux/OS X servers ([read more](#clamav-support)).
* Front-end pages templating with [Nunjucks](https://mozilla.github.io/nunjucks/).
* A more integrated Cloudflare support (automatically purge files remote cache upon deletion, and more).
* Chunked uploads to support 100MB+ files when hosted behind Cloudflare, or any other proxies with file upload size limits.
* Upload remote URLs (have the service download those remote files for you).
* Performant rate limits powered by [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible).
* Albums with shareable pretty public pages.
* User dashboard to manage own uploads and albums.
* Admin dashboard to manage all uploads, albums, and users.
* Robust files search/filters and sorting in the dashboard.
* Usergroups-based permissions.
* Configurable file retention periods per-usergroups.
* Strip images EXIF tags if required (can be set to be toggleable by users, and with experimental support for stripping videos tags as well).
* Various options configurable via header tags upon file uploads (selected file retention period, whether to strip EXIF tags, and more).
* ShareX support with config file builder in the homepage.
* Token-based authentication on all APIs, allowing you to easily integrate the service with anything.
* ... and more!

## Differences with Upstream/Chibisafe

This fork is the one being used at [https://safe.fiery.me](https://safe.fiery.me).

It was originally based on [WeebDev/lolisafe](https://github.com/WeebDev/lolisafe) v3, but later have been so heavily rewritten that it is now simply its own thing.

Chibisafe is an upstream rewrite & rebrand, and technically is lolisafe v4.

If you want to use an existing lolisafe v3 database with this fork, copy over `database/db` file from your previous installation, then run `yarn migrate` at least once to create the new database columns introduced in this fork (don't forget to make a backup).

> **Said migration script is NOT COMPATIBLE with Chibisafe's database.**

Configuration file of lolisafe v3 (`config.js`) is also NOT fully compatible with this fork. There are some options that had been renamed and/or restructured. Please make sure your config matches the sample in `config.sample.js` before starting and/or migrating your previous database.

## Running in production mode

1. Ensure you have at least Node v14 installed (fully compatible up to Node v16.x LTS, untested with v17 or later).
2. Clone this repo.
3. Copy `config.sample.js` as `config.js`.
4. Modify port, domain and privacy options if desired.
5. Run `yarn install --production` to install all production dependencies (Yes, use [yarn](https://yarnpkg.com)).
6. Run `yarn start` to start the service.

> Default admin account:  
> Username: `root`  
> Password: `changeme`

You can also start it with `yarn pm2` if you have [PM2](https://pm2.keymetrics.io/).

When running in production mode, the safe will use pre-built client-side CSS/JS files from `dist` directory, while the actual source codes are in `src` directory.

The pre-built files are processed with [postcss-preset-env](https://github.com/csstools/postcss-preset-env), [cssnano](https://github.com/cssnano/cssnano), [bublé](https://github.com/bublejs/buble), and [terser](https://github.com/terser/terser), and done automatically with [GitHub Actions](https://github.com/BobbyWibowo/lolisafe/blob/safe.fiery.me/.github/workflows/build.yml).

> If you want to use this on Docker, please check out [docker directory](https://github.com/BobbyWibowo/lolisafe/tree/safe.fiery.me/docker).

## Running in development mode

This fork has a separate development mode, with which client-side CSS/JS files in `src` directory will be automatically rebuilt using [Gulp](https://github.com/gulpjs/gulp#what-is-gulp) tasks.

1. Follow step 1 to 4 from the production instructions above.
2. Run `yarn install` to install all dependencies, including development ones.
3. Run `yarn develop` to start the service in development mode.

You can configure the Gulp tasks through `gulpfile.js` file.

During development, the rebuilt files will be saved in `dist-dev` directory instead of `dist` directory. The service will also automatically serve the files from `dist-dev` directory instead. This is to avoid your IDE's Git from unnecessarily rebuilding diff of the modified files.

Once you feel like your modifications are ready for production usage, you can then run `yarn build` to build production-ready files that will actually go to `dist` directory.

> If you are submitting a Pull Request, please do not stage any changes to files in `dist` directory.  
> GitHub Actions will automatically rebuild those assets if and when required.

## Updating when you have modified some files

Try to use [git stash](https://www.git-scm.com/docs/git-stash).

Basically you'll be doing this:

1. `git stash` to stash away your changes.
2. `git pull` to pull updates.
3. `yarn install` (or `yarn install --production`) to install dependencies matching the updated `yarn.lock` file.
4. `git stash pop` (or `git stash apply`) to restore your changes.

Be warned that some files may have been updated too heavily that they will require manual merging.

If you only do some small modifications such as editing `.njk` files and not much else, it's generally safe to do this even in a live production environment. But it's still best practice to at least review just what have been updated, and whether you will need to do some manual merging beforehand.

Still, I heavily recommend simply forking this repository and manually merging upstream changes whenever you feel like doing so. Read more about [syncing a fork](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork). Especially if you intend to modify client-side CSS/JS files in `src` directory, since you will then need to rebuild assets that go into `dist` directory, which are guaranteed to always conflict with every updates from this fork that modify them.

Afterwards, you can instead clone your fork into your production server and pull updates from there. You can then choose to only install production dependencies with `yarn install --production` there to save some disk space (hint: this is how I setup safe.fiery.me).

## ClamAV support

This fork has an optional virus scanning support using [ClamAV](https://www.clamav.net/), utilizing [clamscan](https://github.com/kylefarris/clamscan) library (Linux and OS X only).

It will scan new files right after they are uploaded, then alert the uploaders of the virus names in ClamAV's database if the files are dirty.

Unfortunately, this will slow down uploads processing as it has to wait for the scans before responding the uploaders. However, it's still highly recommended for public usage, or if you're like me who find the constant buzzing from Google Safe Search too annoying.

To enable this, make sure you have [ClamAV installed](https://github.com/kylefarris/clamscan#to-use-local-binary-method-of-scanning), or additionally have [ClamAV daemon running](https://github.com/kylefarris/clamscan#to-use-clamav-using-tcp-sockets) (using daemon is considerably faster). Afterwards configure `uploads.scan` options, and more importantly its sub-option `clamOptions`. Read more about it in the `config.sample.js` file.

Additionally, you can also configure usergroups bypass, extensions whitelist, and max file size, to lessen the burden on your server.
