require('newrelic');
var assert = require('assert');
var {DominosAPI} = new require('./../services/dominosAPI');
var dominosAPI = new DominosAPI();
var {Pizza, PepperoniPizza, ReinePizza, OrientalePizza, BarbecuePizza, FourCheesePizza, SalmonPizza} = require('./../services/DominosMenu/dominosPizzaMenu');
var streets = require("./streets/78.json");
var async = require("async");

/*
describe("#TestingAllCitiesInThe78", () => {
  it("SHOULD run all tests", async function() {
    var streetMap = new Map();
    for(street of streets){
      if(street.type === "street"){
        if(streetMap.get(street.city)){
          var arrayToUpdate = streetMap.get(street.city);
          arrayToUpdate.push(street);
          streetMap.set(street.type, arrayToUpdate);
        }else{
          streetMap.set(street.city, [street])
        }
      }
    }

    for (var key of streetMap.keys()) {
      var entry1 = streetMap.get(key)[0];
      var entry2 = streetMap.get(key)[1];
      var entry3 = streetMap.get(key)[2];

      //var result = await testBattery(Object.keys(entry1.housenumbers)[0], entry1.name, entry1.city, entry1.postcode);
      //console.log("city = " + entry1.city + ", streetNumber = " + Object.keys(entry1.housenumbers)[0] + ", street name = " + entry1.name + ", result = " + result);

    }
  });
});

var testBattery = async function(streetNumber, streetName, cityName, postalCode) {
  return new Promise((resolved, rejected) => {
    var dominosAPI = new DominosAPI();
    streetName = streetName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    streetName = streetName.trim().toUpperCase();
    cityName = cityName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    cityName = cityName.trim().toUpperCase();

    async.series([
      dominosAPI.initPage.bind(dominosAPI),
      dominosAPI.isDeliveryPossible.bind(dominosAPI, streetNumber, streetName, postalCode, cityName),
    ], (err, results) => {
      if(err) {
        console.log("Erreur");
        rejected(err);
      }
      resolved(results[1]);
    });
  });
}
*/
