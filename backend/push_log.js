const schema = require('./database/schema');

const LOG_LEVEL = {
    finest: "FINEST",
    debug: "DEBUG",
    info: "INFO",
    warning: "WARNING",
    error: "ERROR",
    critical: "CRITICAL"
};

async function pushLog(logLevel, message) {
    const logEntry = new schema.logs({
        level: logLevel,
        content: message
    });
    await logEntry.save();
}

module.exports.pushLog = pushLog;
module.exports.LOG_LEVEL = LOG_LEVEL;