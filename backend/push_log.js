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

async function logInEndpoint(logLevel, req, message) {
    await pushLog(logLevel, `${req.method} ${req.url}: ${message}`);
}

async function logEnterEndpoint(req) {
    await pushLog(LOG_LEVEL.debug, `${req.method} ${req.url} ` +
        `with query = ${JSON.stringify(req.query)}, body = ${JSON.stringify(req.body)}, cookies = ${JSON.stringify(req.cookies)}`);
}

module.exports.logSimple = pushLog;
module.exports.logPretty = logInEndpoint;
module.exports.logEnterEndpoint = logEnterEndpoint;
module.exports.LOG_LEVEL = LOG_LEVEL;