const functions = require('firebase-functions');
var dialogflowFulfillment = require("./dialogflow/fulfillment");
var bst = require('bespoken-tools');

var loggerRequest = require('logzio-nodejs').createLogger({
    token: 'MlQcfsjUYHgnWjteBLTxaQNEyqugIzUq',
    host: 'listener.logz.io',
    type: 'request'     // OPTIONAL (If none is set, it will be 'nodejs')
});
var loggerResponse = require('logzio-nodejs').createLogger({
    token: 'MlQcfsjUYHgnWjteBLTxaQNEyqugIzUq',
    host: 'listener.logz.io',
    type: 'response'     // OPTIONAL (If none is set, it will be 'nodejs')
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  dialogflowFulfillment(request, response);
  loggerRequest.log(request.body);
  loggerResponse.log(response.body);
});

// The secret key is provided when you create a new source in the Logless dashboard
/*
exports.function = bst.Logless.capture("9af3a92b-d5e4-41a1-a1a2-3ac3a735ebe0", function (request, response) {
  dialogflowFulfillment(request, response);
});
*/
