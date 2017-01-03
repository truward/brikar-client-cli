
var c = require('./client-config');
var l = require('./cli-log');
var bc = require('./brikar-client');

//
// Exports
//

exports.BrikarClient = bc.BrikarClient;
exports.LAST_RESPONSES = bc.LAST_RESPONSES;
exports.getLog = l.getLog;
exports.readConfigOrMakeDefault = c.readConfigOrMakeDefault;
