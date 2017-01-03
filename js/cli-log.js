
function printLog(method, marker, origin, args) {
  var logHeadingElements = [
    '[', marker, '] ', new Date().toISOString(), ' ', origin, '  - '
  ];

  var logHeading = logHeadingElements.join('');
  var a = [logHeading].concat(args);
  return console[method].apply(console, a);
}

function getLog(logConfig) {
  logConfig = logConfig || {};
  var origin = logConfig.origin || "App";

  var result = {
    trace: function trace() {
      return null;
    },

    info: function info() {
      return printLog("log", "I", origin, Array.prototype.slice.call(arguments));
    },

    warn: function warn() {
      return printLog("warn", "W", origin, Array.prototype.slice.call(arguments));
    },

    error: function error() {
      return printLog("error", "E", origin, Array.prototype.slice.call(arguments));
    }
  };

  if (logConfig.traceEnabled) {
    result.trace = function trace() {
      return printLog("log", "V", origin, Array.prototype.slice.call(arguments));
    };
  }

  return result;
}

//
// Exports
//

exports.getLog = getLog;
