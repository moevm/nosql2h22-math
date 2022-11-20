const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Student = new Schema ({
    mail      : {type: String},
    password  : {type: String},                 
    first_name: {type: String},             
    last_name : {type: String},           
    class     : [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    task      : [{ type: Schema.Types.ObjectId, ref: 'Task' }],  
});

const Task = new Schema ({
    info          : {type: String},
    solution      : {type: String},
    type          : [{type: String}],
    current_status: {type: String},
    attempt       : {type: [{
      status       :{type: String},
      try_solution :{type: String}
    }]},
});

const Teacher = new Schema ({
    mail      : {type: String},
    password  : {type: String},                 
    first_name: {type: String},             
    last_name : {type: String},           
    class     : [{type: String}],
});

const Class = new Schema ({
    title      : {type: String},
    students  : [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    homeworks : [{ type: Schema.Types.ObjectId, ref: 'Task' }],  
    teachers  : [{ type: Schema.Types.ObjectId, ref: 'Teacher'}],  
});

const Log = new Schema ({
    role     : {type: String},
    role_id  : {type: Schema.Types.ObjectId},
    action   : {type: String},
    log_level: {type: String},
})



module.exports.student = mongoose.model('student', Student)
module.exports.task    = mongoose.model('task', Task)
 
