require('newrelic');
var assert = require("assert");

const projectId = 'pizza-de1c1'; //https://dialogflow.com/docs/agents#settings
const languageCode = 'fr-FR';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();
const randomNumber = Math.floor(Math.random() * 1000) + 1 ;

var generateRequest = (query, sessionId, eventName, parameters) => {
  if(eventName){
    return {
      session: sessionClient.sessionPath(projectId, sessionId),
      queryInput: {
        event: {
          name: eventName,
          parameters : parameters,
          languageCode: languageCode
        }
      }
    }
  }else{
    return {
      session: sessionClient.sessionPath(projectId, sessionId),
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        }
      }
    };
  }

}

describe("#Without authentication", () => {
  it("Should send to Welcome intent when saying Parler à Donatello Pizza", (done) => {
    // Send request and log result
    sessionClient
      .detectIntent(generateRequest("Parler à donatello pizza", "first_unit_test_"+randomNumber))
      .then(responses => {
        const result = responses[0].queryResult;
        assert.equal(result.intent.displayName, "Default Welcome Intent");
        return done();
      })
      .catch(err => {
        return done(err);
      });
  });

  it("Should send to an unknow intent when sending shiity commands", (done) => {
    // Send request and log result
    sessionClient
    .detectIntent(generateRequest("trululu", "first_unit_test_"+ randomNumber))
      .then(responses => {
        const result = responses[0].queryResult;
        assert.equal(result.intent.displayName, "Default Fallback Intent");
        return done();
      })
      .catch(err => {
        return done(err);
      });
  });

  it("Should ask a delivery address when saying Commande-moi une pizza", (done) => {
    // Send request and log result
    sessionClient
    .detectIntent(generateRequest("Commande-moi une pizza", "first_unit_test_"+randomNumber))
      .then(responses => {
        const result = responses[0].queryResult;
        assert.equal(result.intent.displayName, "ask_for_delivery_address");
        return done();
      })
      .catch(err => {
        return done(err);
      });
  });

  it("Should say SUPER when sending a correct address", (done) => {
    // Send request and log result

    var address = {
      userDecision : true
    }

    sessionClient
    .detectIntent(generateRequest("10 rue de verdun", "first_unit_test_"+randomNumber, "actions_intent_DELIVERY_ADDRESS"))
      .then(responses => {
        const result = responses[0].queryResult;
        assert.equal(result.intent.displayName, "ask_for_delivery_address_response");
        return done();
      })
      .catch(err => {
        return done(err);
      });
  });

});
