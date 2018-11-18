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
  loggerRequest.log(flattenObject(request.body));
  console.log('---------------------');
  loggerResponse.log(flattenObject(dialogflowFulfillment.responseJson_));
  console.log(dialogflowFulfillment.responseJson_);
  console.log('---------------------');
});

var flattenObject = function(ob) {
	var toReturn = {};

	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;

		if ((typeof ob[i]) == 'object') {
			var flatObject = flattenObject(ob[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;

				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
};

// The secret key is provided when you create a new source in the Logless dashboard
/*
exports.function = bst.Logless.capture("9af3a92b-d5e4-41a1-a1a2-3ac3a735ebe0", function (request, response) {
  dialogflowFulfillment(request, response);
});
*/
