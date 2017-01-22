const config = require('./config.js')
const api = require('./routes/api.js')
const express = require('express')
const bodyParser = require('body-parser')
const db = require('knex')(config.database)
const fs = require('fs')
const safe = express()

require('./database/db.js')(db, config)

fs.existsSync('./' + config.logsFolder) || fs.mkdirSync('./' + config.logsFolder)
fs.existsSync('./' + config.uploads.folder) || fs.mkdirSync('./' + config.uploads.folder)
fs.existsSync('./' + config.uploads.folder + '/thumbs') || fs.mkdirSync('./' + config.uploads.folder + '/thumbs')

safe.use(bodyParser.urlencoded({ extended: true }))
safe.use(bodyParser.json())

safe.enable('trust proxy')

safe.use('/', express.static('./uploads'))
safe.use('/', express.static('./public'))
safe.use('/api', api)

safe.get('/', (req, res, next) => res.sendFile('home.html', { root: './pages/' }))
safe.get('/panel', (req, res, next) => res.sendFile('panel.html', { root: './pages/' }))
safe.use((req, res, next) => res.status(404).sendFile('404.html', { root: './pages/error/' }))
safe.use((req, res, next) => res.status(500).sendFile('500.html', { root: './pages/error/' }))

safe.listen(config.port, () => console.log(`loli-safe started on port ${config.port}`))