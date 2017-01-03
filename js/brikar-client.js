//
// Common HTTP service base class for brikar
//

var http = require('http');
var Buffer = require('buffer').Buffer;
var getLog = require('./cli-log').getLog;

var LAST_RESPONSES = [];

function BrikarClient(config, log) {
  if (!(typeof(config) === "object")) {
    throw new Error("serviceConfig is missing");
  }

  this.config = config;
  this.log = log || getLog({origin: 'brikar-client'});
}

BrikarClient.prototype.request = function BrikarClient_request(method, relativeUrl, body, contentType) {
  var log = this.log;
  log.trace('About to make request; method:', method, 'relativeUrl:', relativeUrl, 'body:', body);

  contentType = contentType || "application/json";

  var c = this.config;
  var path = c.baseUrl + relativeUrl;
  var headers = {
    'Accept': contentType,
    'User-Agent': 'NodeJS-BrikarClient-V1'
  };

  var postData = null;
  if (body != null) {
    if (contentType == "application/json") {
      postData = Buffer.from(JSON.stringify(body));
    } else if (contentType == "text/plain") {
      postData = Buffer.from(body.toString());
    } else {
      throw new Error("Unknown contentType: " + contentType);
    }

    headers['Content-Type'] = contentType;
    headers['Content-Length'] = postData.length;
  }

  if (c.authType === 'NONE') {
    // do nothing
  } else if (c.authType === 'BASIC') {
    headers['Authorization'] = 'Basic ' + (new Buffer(c.username + ':' + c.password).toString('base64'));
  } else {
    throw new Error("Unknown authType: " + c.authType);
  }

  var options = {
    hostname: c.hostname,
    port: c.port,
    path: path,
    method: method,
    headers: headers
  };

  log.trace('Options prepared, now making request...');

  return new Promise((resolve, reject) => {
    var request = http.request(options, (response) => {
      response.setEncoding('utf8');

      var responseDataArray = [];
      var responseDataLength = 0;
      response.on('data', (chunk) => {
        responseDataArray.push(chunk);
      });
      response.on('end', () => {
        var responseObject = null;
        var responseContentType = response.headers['content-type'];

        if (responseContentType === "application/json") {
          responseObject = JSON.parse(responseDataArray.join(''));
        } else if (responseContentType === "text/plain") {
          responseObject = responseDataArray.join('');
        } else if (responseContentType === null) {
          log.trace("No content");
        } else {
          return reject({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            errorMessage: 'Unknown content type',
            headers: response.headers,
            type: 'ResponseError'
          });
        }

        var result = {
          response: responseObject,
          headers: response.headers,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage
        };
        LAST_RESPONSES.push(result);

        return resolve(result);
      });
    });

    request.on('error', (e) => {
      return reject({
        errorObject: e,
        type: 'RequestError'
      });
    });

    if (postData != null) {
      request.write(postData);
    }
    request.end();
  });
}

//
// Exports
//

exports.BrikarClient = BrikarClient;
exports.LAST_RESPONSES = LAST_RESPONSES;
