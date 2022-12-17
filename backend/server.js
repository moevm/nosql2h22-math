const port       = 8000;
const express    = require("express");
const app        = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const routes = require("./routers/router");
const mongoose   = require('mongoose');
const schema     = require('./database/schema');
const {users} = require("./database/schema");
const cors = require("cors");
const initTestUsers = require("./database/test_user_init");


mongoose.connect('mongodb://mongo:27017/test', {})
//mongoose.connect('mongodb://127.0.0.1:27017/test', {})
const db = mongoose.connection

db.on('error', err => {
  console.log('error', err)
})

db.once('open', () => {
  console.log('we are connected')
  initTestUsers()
})

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("secret00"));
app.use(session({secret: "secret00"}));
app.use(cors(corsOptions));

app.use("/", routes);



app.listen(port, function () {
    console.log('API app started');
})
