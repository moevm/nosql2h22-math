const express = require('express')
const mongoose = require('mongoose')
const router = require('./routers/router')

const path = require('path')

const PORT = 8000

const app = express()
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(router)

async function start() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/nosql',{})
        app.listen(PORT, () => {
            console.log('Server has been started...')
        })
    } catch (e) {
        console.log(e)
    }
}

start()