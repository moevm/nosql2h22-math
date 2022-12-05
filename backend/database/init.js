const schema    = require('./schema'); 
const fs        = require("fs");
const nodeEval  = require('node-eval');
const { faker } = require('@faker-js/faker');
const mongoose  = require("mongoose");
const { exec }  = require("child_process");

const tasks     = new schema.tasks()
const logs      = new schema.logs()
const users     = new schema.users()
const classes   = new schema.classes()
const homeworks = new schema.homeworks()
const attempts  = new schema.attempts()
const histories = new schema.histories()
const hour = 60 * 60 * 1000;

function getOneUseProbability(map){     
    let randomProbability =  getRandomInt(100);    /* math.Random approximately uniform distribution */
    let cumulative_probability = 0;
    for (key in map) {
        cumulative_probability += map[key];
        if (cumulative_probability > randomProbability){
            ///console.log("key = %s, rand = %s", key, randomProbability)
            return key;
        }
    }
    return "Error function getOneUseProbability"
}

function initUser(){
        let role_and_probability = {"pupil"        :50,
                                    "teacher"      :25,
                                    "administrator":25,}    
        let max_len_password  = 20;
        const sex         = faker.name.sexType();
        users._id         = mongoose.Types.ObjectId();    
        users.password    = faker.internet.password(getRandomInt(max_len_password))
        users.first_name  = faker.name.firstName(sex);
        users.last_name   = faker.name.lastName();
        users.role        = getOneUseProbability(role_and_probability);
        users.email       = faker.helpers.unique(faker.internet.email, [
            users.firstName,
            users.lastName,
          ]);
        users.tasks = [];
        let count_tasks = getRandomInt(15, 1);
        for (let i = 0; i <count_tasks; i++) {
            users.tasks.push(initTask()._id)
        }
        users.history = [];
        let count_history = getRandomInt(10);
        for (let i = 0; i <count_history; i++) {
            users.history.push(initHistory())
        }
        return users;
}

function initHistory(){
    let content_probability = {"something"               :50,
                               "i am glad"               :10,
                               "you are awesome"         :10,
                               "i know the word awesome" :30,};
    let action_probability  = {"click"       :50,
                               "send_answer" :10,
                               "registration":10,
                               null          :30,};
    let local_date = new Date();
    histories.timestamp = local_date.setMilliseconds(hour * getRandomInt(1000) * Math.random());
    histories._id       = mongoose.Types.ObjectId();  
    histories.action    = getOneUseProbability(action_probability);
    histories.content   = getOneUseProbability(content_probability);
    return histories;
}

function getRandomInt(max, min = 0){
    return Math.floor(Math.random() * max) + min;      
}
  
function createMathExpression(){
    const max_int_for_expression  = 1000
    const all_types_of_operation  = ["subtracting", "adding", "multiplication","division"]
    let count_of_type             = getRandomInt(all_types_of_operation.length, 1);
    let content                   = "" + getRandomInt(max_int_for_expression);
    let categories                = []

    for (let i = 0; i < count_of_type; i++ ) {
        let current_categories = getRandomInt(all_types_of_operation.length);
        categories.push(all_types_of_operation[current_categories]);
        all_types_of_operation.splice(current_categories, 1);                        
        switch (categories[i]) {
            case "subtracting":
                content += " - ";
                break;
            case "adding":
                content += " + ";
                break;
            case "multiplication":
                content += " * ";
                break;
            case "division":
                content += " / ";
                break;
            }
        content += getRandomInt(max_int_for_expression);
    }
    let correct_answer = nodeEval(content);
    if (categories.includes("division")) {
        correct_answer = correct_answer.toFixed(2)
    }
    return {
        correct_answer : correct_answer, 
        categories     : categories,
        content        : content,
    };
}

async function creatTask(){
    console.log(createMathExpression())
}

function initTask(){
    let local_date          = new Date();
    let math_expression     = createMathExpression();
    tasks._id               = mongoose.Types.ObjectId();    
    tasks.content           = math_expression.content;
    tasks.correct_answer    = math_expression.correct_answer;
    tasks.categories        = math_expression.categories;
    tasks.created_timestamp = local_date.setMilliseconds(local_date.getDate() + hour * getRandomInt(100)* Math.random());
    tasks.attempts          = []
    let status_and_probability = {"not correct" :60,
                                  "correct"     :20,
                                  "in progress" :20,}
    let count_try_attempts  = getRandomInt(10, 3);
    for(let i = 0; i  < count_try_attempts; i++) {
        attempts.start_timestamp =  local_date.setMilliseconds(local_date.getDate() + hour * getRandomInt(1000) * Math.random()); 
        attempts.end_timestamp   =  local_date.setMilliseconds(local_date.getDate() + hour * getRandomInt(10)   * Math.random()); 
        attempts.status = getOneUseProbability(status_and_probability);
        if ( attempts.status === "correct") {
            attempts.user_answer = tasks.correct_answer;
            tasks.attempts.push(attempts);
            break;
        } else 
        if ( attempts.status === "in progress") {
            attempts.user_answer = null;
            tasks.attempts.push(attempts);
            break;
        } else {
            attempts.user_answer = tasks.correct_answer + getRandomInt(1000);
        }
        tasks.attempts.push(attempts);
    }
    //console.log(tasks)    
    //tasks.save();
    let json = JSON.stringify(tasks, null, 2);
    fs.appendFileSync("tasks.json", `\n${json} `,)
    return tasks;
}

async function initDb(){
    let count_users = getRandomInt(1,20);
    for (let i = 0; i < 2; i++ ) {
        let current_user = initUser();
        let json = JSON.stringify(current_user, null, 2);
        fs.appendFileSync("users.json", `\n${json} `,)
    }
}

exports.initDb = initDb;
initDb();