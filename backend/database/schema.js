const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const User = new Schema ({
    email     : {type: String},
    password  : {type: String},
    first_name: {type: String},
    last_name : {type: String},
    role      : {type: String},
    class     : {type: Schema.Types.ObjectId, ref: 'Class'},
    tasks     : {type: [{
        content         : {type: String},
        create_timestamp: {type: Date, default: Date.now},
        categories      : {type: [String]},
        correct_answer  : {type: Number},
        attempts        : {type: [{
            start_timestamp: {type: Date, default: Date.now},
            end_timestamp  : {type: Date},
            user_answer    : {type: Number},
            status         : {type: String}
        }]}
    }]},
    logs      : {type: [Schema.Types.ObjectId], ref: 'Log'}
});

const Class = new Schema ({
    title    : {type: String},
    teacher  : {type: Schema.Types.ObjectId, ref: 'User'},
    pupils   : {type: [Schema.Types.ObjectId], ref: 'User'},
    url      : {type: String},  
    homeworks: {type: [{
        created_timestamp : {type: Date, default: Date.now},
        deadline_timestamp: {type: Date},
        tasks             : {type: [{
            categories: {type: [String]},
            count     : {type: Number}
        }]}
    }]}  
});

const Log = new Schema ({
    user_id  : {type: Schema.Types.ObjectId, ref: 'User'},
    timestamp: {type: Date, default: Date.now},
    level    : {type: String},
    content  : {type: String}
})



module.exports.users   = mongoose.model('Users', User)
module.exports.classes = mongoose.model('Classes', Class)
module.exports.logs    = mongoose.model('Logs', Log)
 
