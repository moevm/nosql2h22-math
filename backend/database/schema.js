const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Attempt = new Schema ({
    start_timestamp: {type: Date, default: Date.now},
    end_timestamp  : {type: Date},
    user_answer    : {type: Number},
    status         : {type: String}
}, {_id: false, versionKey: false})

const Task = new Schema ({
    content         : {type: String},
    create_timestamp: {type: Date, default: Date.now},
    categories      : {type: [String]},
    correct_answer  : {type: Number},
    attempts        : {type: [Attempt]}
}, {_id: false, versionKey: false})

const User = new Schema ({
    email     : {type: String},
    password  : {type: String},
    first_name: {type: String},
    last_name : {type: String},
    role      : {type: String},
    tasks     : {type: [Task]},
    logs      : {type: [Schema.Types.ObjectId], ref: 'Log'}
}, {versionKey: false});

const HomeworkTask = new Schema ({
    categories: {type: [String]},
    count     : {type: Number}
}, {_id: false, versionKey: false})

const Homework = new Schema ({
    created_timestamp : {type: Date, default: Date.now},
    deadline_timestamp: {type: Date},
    tasks             : {type: [HomeworkTask]}
}, {versionKey: false})

const Class = new Schema ({
    title    : {type: String},
    members   : {type: [Schema.Types.ObjectId], ref: 'User'},
    homeworks: {type: [Schema.Types.ObjectId], ref: 'Homework'}
}, {versionKey: false});

const Log = new Schema ({
    timestamp: {type: Date, default: Date.now},
    level    : {type: String},
    content  : {type: String}
}, {versionKey: false})


module.exports.users     = mongoose.model('Users', User)
module.exports.classes   = mongoose.model('Classes', Class)
module.exports.homeworks = mongoose.model('Homeworks', Homework)
module.exports.logs      = mongoose.model('Logs', Log)