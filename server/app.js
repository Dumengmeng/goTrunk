import express from 'express'
import path from 'path'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import { Nuxt, Builder } from 'nuxt'

import api from './api'

const app = express()
const router = express.Router()
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

// 连接数据库
mongoose.connect('mongodb://localhost:27017/log');
const db = mongoose.connection;
db.on('error', function(error) {
    console.log('数据库连接失败' + error)
});

// 设置模板根目录
// A directory or an array of directories for the application's views. If an array, the views are looked up in the order they occur in the array.
app.set("views", "../pages");
// 静态资源
app.use(express.static(path.join(__dirname, "assets")));

// 对request 提交的body UTF-8的编码的数据进行处理
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', port)

// Import API Routes
app.use('/api', api)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
    const builder = new Builder(nuxt)
    builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console