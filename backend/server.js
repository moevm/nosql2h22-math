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


//mongoose.connect('mongodb://mongo:27017/test', {})
mongoose.connect('mongodb://127.0.0.1:27017/test', {})
const db = mongoose.connection

db.on('error', err => {
  console.log('error', err)
})

db.once('open', () => {
  console.log('we are connected')
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

// Add headers before the routes are defined
/*app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.setHeader('Content-Security-Policy', "default-src 'self'")
  
    // Pass to next layer of middleware
    next();
}); */

app.use("/", routes);


/*
This post is a just simple method for test the db request
curl -X POST http://localhost:8000/test
result:
{"mail":"test@test","class":[],"task":[],"_id":"63799eeb8e79c64d7ab53d4f","__v":0}
*/
app.post('/test',  async function (req, res) {

  //await test_st.save();
  //test_st.mail = "second";
  //let response = await test_st.save();
  //res.send(response)
  /*
  //example how find all task => all try_solve by student
  schema.student.findById("6378693246bc1ac83ec78321").populate("task").exec(function (err, docs) {
    console.log(docs.task[0].attempt);
    res.send(docs.task[0].attempt);

  });
  */
  const user = new schema.users({
    email: 'mahalichev.n@gmail.com',
    password: 'mahalichev321',
    first_name: 'Никита',
    last_name: 'Махаличев',
    role: 'pupil',
    tasks  : [{
      content: '3*12-10',
      create_timestamp: Date.parse('2022-11-21T17:24:52.748Z'),
      categories: ['subtraction', 'multiplication'],
      correct_answer: 26,
      attempts: [{
        start_timestamp: Date.parse('2022-11-21T17:24:52.748Z'),
        end_timestamp: Date.parse('2022-11-21T17:25:00.748Z'),
        user_answer: 36,
        status: 'not correct'
      },
      {
        start_timestamp: Date.parse('2022-11-21T17:25:00.748Z'),
        end_timestamp: Date.parse('2022-11-21T17:25:51.748Z'),
        user_answer: 26,
        status: 'correct'
      }]
    },
    {
      content: '5+15/3',
      create_timestamp: Date.parse('2022-11-21T17:25:51.748Z'),
      categories: ['addition', 'division'],
      correct_answer: 10,
      attempts: [{
        start_timestamp: Date.parse('2022-11-21T17:25:51.748Z'),
        status: 'in progress'
      }]
    }],
  })
  //let x = await user.save()
  const new_attempt = new schema.attempts({
    user_answer    : "lol",
    status         : "good"
  })

  //!SECTIONlet rest = await schema.users.find({_id :ObjectId("637db962d148dc940f3bab4b"),tasks:{$in : {$mathes: {status :"in progress"}}}})
  
  console.log(rest)
  
  res.send(x)

});

app.listen(port, function () {
    console.log('API app started');
})
