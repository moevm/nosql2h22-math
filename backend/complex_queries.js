const schema = require('./database/schema');

function isSubset(elementsArray, requirementsArray) {
    return requirementsArray.every(e => elementsArray.includes(e));
}

async function lastPublishedHW(classDocument) {
    return schema.homeworks.find({_id: {$in: classDocument.homeworks}})
        .sort({"created_timestamp": -1})
        .limit(1);
}

async function lastPublishedHWData(classDocument) {
    const homework = (await lastPublishedHW(classDocument))[0];
    console.debug(homework);
    if(!homework) {
        return {
            deadline: null,
            tasks: null,
            doneCount: null,
            answersCount: null,
            correctAnswersCount: null
        }
    }
    const data = {};
    data.deadline = homework.deadline_timestamp;
    data.tasks = homework.tasks;
    data.tasks.sort();
    data.doneCount = 0;
    data.answersCount = 0;
    data.correctAnswersCount = 0;
    return data;
}

module.exports.lastPublishedHWData = lastPublishedHWData;