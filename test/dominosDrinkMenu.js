require('newrelic');
var assert = require('assert');
var {Drink, CocaColaDrink, CocaColaZeroDrink, OasisDrink, FantaDrink, EvianDrink} = require('./../services/DominosMenu/dominosDrinkMenu');
var {DominosAPI} = new require('./../services/dominosAPI');
var dominosAPI = new DominosAPI();
var async = require("async");

describe("DominosDrinkMenu", () => {
  describe("#Drink", () => {

  });

  describe("#CocaColaDrink", () => {
    it("Should throw an error when putting an unknow or undefined size ", () => {
      assert.throws(() => {new CocaColaDrink(null);});
      assert.throws(() => {new CocaColaDrink("Fake size");});
      assert.throws(() => {new CocaColaDrink(undefined);});
    });
    it("Should have the same output as the internet page for 33CL format", () => {
      var drink = new CocaColaDrink(Drink.CAN_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DCOK","productSizeCode":"Drink.Soft.330ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
    it("Should have the same output as the internet page for 1,5L format", () => {
      var drink = new CocaColaDrink(Drink.BOTTLE_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DCOK","productSizeCode":"Drink.Soft.1500ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
  });

  describe("#CocaColaZeroDrink", () => {
    it("Should throw an error when putting an unknow or undefined size ", () => {
      assert.throws(() => {new CocaColaZeroDrink(null);});
      assert.throws(() => {new CocaColaZeroDrink("Fake size");});
      assert.throws(() => {new CocaColaZeroDrink(undefined);});
    });
    it("Should have the same output as the internet page for 33CL format", () => {
      var drink = new CocaColaZeroDrink(Drink.CAN_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DCOZ","productSizeCode":"Drink.Soft.330ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
    it("Should have the same output as the internet page for 1,5L format", () => {
      var drink = new CocaColaZeroDrink(Drink.BOTTLE_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DCOZ","productSizeCode":"Drink.Soft.1500ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
  });

  describe("#OasisDrink", () => {
    it("Should throw an error when putting an unknow or undefined size ", () => {
      assert.throws(() => {new OasisDrink(null);});
      assert.throws(() => {new OasisDrink("Fake size");});
      assert.throws(() => {new OasisDrink(undefined);});
    });
    it("Should have the same output as the internet page for 33CL format", () => {
      var drink = new OasisDrink(Drink.CAN_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DOTR","productSizeCode":"Drink.Soft.330ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
    it("Should have the same output as the internet page for 1,5L format", () => {
      var drink = new OasisDrink(Drink.BOTTLE_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DOTR","productSizeCode":"Drink.Soft.2000ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
  });

  describe("#FantaDrink", () => {
    it("Should throw an error when putting an unknow or undefined size ", () => {
      assert.throws(() => {new FantaDrink(null);});
      assert.throws(() => {new FantaDrink("Fake size");});
      assert.throws(() => {new FantaDrink(undefined);});
    });
    it("Should have the same output as the internet page for 33CL format", () => {
      var drink = new FantaDrink(Drink.CAN_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DFAN","productSizeCode":"Drink.Soft.330ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
    it("Should have the same output as the internet page for 1,5L format", () => {
      var drink = new FantaDrink(Drink.BOTTLE_SIZE);
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DFAN","productSizeCode":"Drink.Soft.1500ML","quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
  });

  describe("#EvianDrink", () => {
    it("Should have the same output as the internet page", () => {
      var drink = new EvianDrink();
      var internetOutput = {"primaryProduct":{"Portions":[{"Sauces":null,"options":[],"productCode":null,"toppings":[]}],"crusts":[],"productCode":"DEVI0500","productSizeCode":null,"quantity":1},"secondaryProduct":null};
      assert.equal(JSON.stringify(drink), JSON.stringify(internetOutput));
    });
  });


  describe("#getDrinkCustomizations", () => {
    it("should return proper DRINK customizations for VALENCE store", (done) => {
      tempDominosAPI = new DominosAPI();
      async.series([
        tempDominosAPI.initPage.bind(tempDominosAPI),
        tempDominosAPI.isDeliveryPossible.bind(tempDominosAPI, 10, "AVENUE DE VERDUN", 26000, "VALENCE"),
        tempDominosAPI.getDrinkCustomizations.bind(tempDominosAPI)
      ], (err, results) => {
        if(err) done(err);

        //The following drink customization has been manually created from a big JSON.
        var drinkCustomizations = JSON.parse('{"DCOK":{"Sizes":[{"Name":"1,25L","Code":"Drink.Soft.1250ML"},{"Name":"33cl","Code":"Drink.Soft.330ML"}]},"DCOZ":{"Sizes":[{"Name":"1,25L","Code":"Drink.Soft.1250ML"},{"Name":"33cl","Code":"Drink.Soft.330ML"}]},"DCOC":{"Sizes":[{"Name":"33cl","Code":"Drink.Soft.330ML"}]},"DSPR":{"Sizes":[{"Name":"1,25L","Code":"Drink.Soft.1250ML"},{"Name":"33cl","Code":"Drink.Soft.330ML"}]},"DFAN":{"Sizes":[{"Name":"1,5L","Code":"Drink.Soft.1500ML"},{"Name":"33cl","Code":"Drink.Soft.330ML"}]},"DFUP":{"Sizes":[{"Name":"1,25L","Code":"Drink.Soft.1250ML"},{"Name":"33cl","Code":"Drink.Soft.330ML"}]},"DOTR":{"Sizes":[{"Name":"2L","Code":"Drink.Soft.2000ML"},{"Name":"33cl","Code":"Drink.Soft.330ML"}]},"DEVI0500":{"Sizes":[{"Name":null,"Code":"N/A"}]},"DHEI0330":{"Sizes":[{"Name":null,"Code":"N/A"}]},"DVRS0750":{"Sizes":[{"Name":null,"Code":"N/A"}]}}');
        assert.equal(JSON.stringify(drinkCustomizations), JSON.stringify(results[2]));
        done();
      });
    })
  });

  describe("#Add and remove all the drinks", () => {
    it("Should add cocacola (33cl) and have a bascket of xxEuros", (done) => {
      var drink = new CocaColaDrink(Drink.CAN_SIZE);
      async.series([
        dominosAPI.initPage.bind(dominosAPI),
        dominosAPI.isDeliveryPossible.bind(dominosAPI, 10, "RUE GOYA", 67200, "STRASBOURG"),
        dominosAPI.addToOrder.bind(dominosAPI, drink, 1)
      ], (err, results) => {
        if(err) done(err);
        var bascket = results[2];
        assert.equal(bascket.cart.cartTotal, "1,80€");
        done();
      });
    });

    it("Should add cocacola (1.5L) and have a bascket of xxEuros", (done) => {
      var drink = new CocaColaDrink(Drink.BOTTLE_SIZE);
      async.series([
        //dominosAPI.initPage.bind(dominosAPI),
        //dominosAPI.isDeliveryPossible.bind(dominosAPI, 10, "RUE GOYA", 67200, "STRASBOURG"),
        dominosAPI.addToOrder.bind(dominosAPI, drink, 1)
      ], (err, results) => {
        if(err) done(err);
        var bascket = results[0];
        assert.equal(bascket.cart.cartTotal, "5,10€");
        done();
      });
    });
  });

});
