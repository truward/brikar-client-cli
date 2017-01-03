
var fs = require('fs');
var os = require('os');
var extend = require('util')._extend;

function makeServiceDir(serviceName) {
  var userHome = os.homedir();
  var brikarPath = userHome + '/.brikar';
  var serviceSettingsDir = brikarPath + '/' + serviceName;

  try {
    fs.accessSync(serviceSettingsDir, fs.W_OK | fs.R_OK);
    return serviceSettingsDir; // service path exists, return
  } catch (ignored) {
    // ok
  }

  // service path doesn't exist, create
  try {
    fs.accessSync(brikarPath, fs.W_OK | fs.R_OK);
    return serviceSettingsDir; // service path exists, return
  } catch (ignored) {
    // ok, create brikar path
    fs.mkdirSync(brikarPath);
  }

  fs.mkdirSync(serviceSettingsDir);

  return serviceSettingsDir;
}

var BRIKAR_CONFIG = {

  // default response timeout, in milliseconds
  defaultTimeoutMillis: 2000
}

function createDefaultConfig(serviceName) {
  return {
    "version": 1,

    "authType": "BASIC",
    "username": "testonly",
    "password": "test",

    "serviceName": serviceName,

    "hostname": "127.0.0.1",
    "port": 8080,
    "baseUrl": "/api"
  };
}

function readConfigOrMakeDefault(serviceName, log) {
  var serviceDir = makeServiceDir(serviceName);
  log.trace("Service dir for", serviceName, "is", serviceDir);

  var configFilePath = serviceDir + "/service.json";
  try {
    fs.accessSync(configFilePath, fs.R_OK); // file exists?
    log.trace("Service file config exists at", configFilePath);
  } catch (ignored) {
    // no - create one
    log.trace("No service file, creating one at", configFilePath);
    var defaultConfigStr = JSON.stringify(createDefaultConfig(serviceName), 0, 2);
    fs.writeFileSync(configFilePath, defaultConfigStr);
  }

  var configStr = fs.readFileSync(configFilePath);
  log.trace("Read service config file", configFilePath);

  var result = extend(createDefaultConfig(serviceName), JSON.parse(configStr));
  log.trace("Parsed service config file", configFilePath, "contents:", result);

  return result;
}

//
// Exports
//

exports.readConfigOrMakeDefault = readConfigOrMakeDefault;
