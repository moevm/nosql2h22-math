const MongoClient = require("mongodb").MongoClient;

    
const url = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(url);
let cool_boy  = [{name:"Max",age:25},{ name:"Nicita",age:42}, {name:"Micha", age:988}];


// Подключаемся к серверу
mongoClient.connect(function(err, client){
      
    const db = client.db("Hello");
    const collection = db.collection("hello_wrld");
     
    collection.insertMany(cool_boy, function(err, results){
              
        console.log(results);
        client.close();
    });
});
