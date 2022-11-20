const port       = 8000;
const express    = require("express");
const app        = express();
const bodyParser = require('body-parser');
const students   = require("./routers/students");
const mongoose   = require('mongoose');
const schema     = require('./database/schema'); 


mongoose.connect('mongodb://mongo:27017/test', {})

const db = mongoose.connection


db.on('error', err => {
  console.log('error', err)
})

db.once('open', () => {
  console.log('we are connected')
})




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
});


app.use("/students", students);


/*

This post is a just simple method for test the db request
curl -X POST http://localhost:8000/test
result:
{"mail":"test@test","class":[],"task":[],"_id":"63799eeb8e79c64d7ab53d4f","__v":0}
*/
app.post('/test',  async function (req, res) {
  let test_st = new schema.student(
    { "mail":"test@test"},
  );
  //await test_st.save();
  //test_st.mail = "second";
  let response = await test_st.save();
  res.send(response)
  /*
  //example how find all task => all try_solve by student
  schema.student.findById("6378693246bc1ac83ec78321").populate("task").exec(function (err, docs) {
    console.log(docs.task[0].attempt);
    res.send(docs.task[0].attempt);

  });
  */
});
app.get('/',  async function (req, res) {
res.send("hI")
});


app.listen(port, function () {
    console.log('API app started');
})
