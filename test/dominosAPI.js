require('newrelic');
var assert = require('assert');
var {Product, Ingredient} = require('./../services/DominosMenu/dominosMenu');
var {Pizza, PepperoniPizza, ReinePizza, OrientalePizza, BarbecuePizza, FourCheesePizza, SalmonPizza} = require('./../services/DominosMenu/dominosPizzaMenu');
var {Entry, ChickenWingsEntry, PotatosEntry, SaladeEntry} = require('./../services/DominosMenu/dominosEntryMenu');
var {Drink, CocaColaDrink, CocaColaZeroDrink, FantaDrink, OasisDrink, EvianDrink} = require('./../services/DominosMenu/dominosDrinkMenu');

var {DominosAPI} = new require('./../services/dominosAPI');
var dominosAPI = new DominosAPI();
var async = require("async");

describe('dominosAPI', () => {
  describe('#getCookie', () => {
    it('should set and after get cookie', (done) => {
      done();
    });
  });
  describe('#Init', () => {
    it('should return the .NET session cookie when calling the home page', (done) => {
      dominosAPI.clearCookies();
      dominosAPI.initPage((err, result) => {
        if (err) done(err);
        var cookies = dominosAPI.getCookie();
        done();
      });
    });
  });
  describe('#verifyCityName', () => {
    it('should return Houilles when user write Houil', (done) => {
      dominosAPI.getAvailableCities("Houil", (err, result) => {
        if (err) done(err);
        assert.equal(Array.isArray(result), true);
        assert.equal(result.length, 1);
        assert.equal(result[0].Name, "HOUILLES");
        assert.equal(result[0].PostCode, "78800");
        done();
      });
    });
    it('should return 2 results when user write Poissy', (done) => {
      dominosAPI.getAvailableCities("Poissy", (err, result) => {
        if (err) done(err);
        assert.equal(Array.isArray(result), true);
        assert.equal(result.length, 2);
        assert.equal(result[0].Name, "POISSY");
        assert.equal(result[0].PostCode, "78300");
        done();
      });
    });
    it('should return 0 results when user write strange caracteres', (done) => {
      dominosAPI.getAvailableCities("???", (err, result) => {
        if (err) done(err);
        assert.equal(Array.isArray(result), true);
        assert.equal(result.length, 0);
        done();
      });
    });
  });

  describe('#verifyStreetName', () => {
    it('should return "RUE DE VERDUN" when user send "rue de ver"', (done) => {
      dominosAPI.getAvailableCities("Houil", (err, result) => {
        if (err) done(err);
        assert.equal(Array.isArray(result), true);
        assert.equal(result.length, 1);
        assert.equal(result[0].Name, "HOUILLES");
        assert.equal(result[0].PostCode, "78800");
        done();
      });
    });
    it('should return 2 results when user write Poissy', (done) => {
      dominosAPI.getAvailableCities("Poissy", (err, result) => {
        if (err) done(err);
        assert.equal(Array.isArray(result), true);
        assert.equal(result.length, 2);
        assert.equal(result[0].Name, "POISSY");
        assert.equal(result[0].PostCode, "78300");
        done();
      });
    });
    it('should return 0 results when user write strange caracteres', (done) => {
      dominosAPI.getAvailableCities("???", (err, result) => {
        if (err) done(err);
        assert.equal(Array.isArray(result), true);
        assert.equal(result.length, 0);
        done();
      });
    });
  });

  describe('#isAddressEligible', () => {
    it('should return true when sending 10 rue de verdun POISSY', (done) => {
      dominosAPI.isAddressEligible(10, "rue de verdun", 78300, "Poissy", (err, result) => {
        if(err) done(err);
        assert.equal(result, true);
        done();
      });
    });

    it('should return false when sending a cityName that does not exist', (done) => {
      dominosAPI.isAddressEligible(10, "rue de verdun", 78300, "POIUUU", (err, result) => {
        if(err) done(err);
        assert.equal(result, false);
        done();
      });
    });
    it('should return false when sending a postal code that does not exist', (done) => {
      dominosAPI.isAddressEligible(10, "rue de verdun", 7830098899, "POISSY", (err, result) => {
        if(err) done(err);
        assert.equal(result, false);
        done();
      });
    });
    it('should return true when alternating uppercase and lower case', (done) => {
      dominosAPI.isAddressEligible(10, "Rue De Verdun", 78300, "poissy", (err, result) => {
        if(err) done(err);
        assert.equal(result, true);
        done();
      });
    });
    it('should return true even when adding fake blank space at the beginnig or at the end of the address', (done) => {
      dominosAPI.isAddressEligible(10, "   Rue De Verdun   ", 78300, "   poissy   ", (err, result) => {
        if(err) done(err);
        assert.equal(result, true);
        done();
      });
    });
    it('should return false when sending a good data but in a region where there isn\'t a Dominos Pizza', (done) => {
      dominosAPI.isAddressEligible(10, "rue de verdun", 21200, "Beaune", (err, result) => {
        if(err) done(err);
        assert.equal(result, false);
        done();
      });
    });
    it('should return false when sending a good data but in a street not listed by the Domino DB', (done) => {
      dominosAPI.isAddressEligible(6, "place de l'église", 78800, "HOUILLES", (err, result) => {
        if(err) done(err);
        assert.equal(result, false);
        done();
      })
    });
    it('should return true when sending street name with accent', (done) => {
      dominosAPI.isAddressEligible(5, "avenue de l'opéra", 75001, "Paris", (err, result) => {
        if(err) done(err);
        assert.equal(result, true);
        done();
      });
    });
    it('should return true when sending 10 RUE DE VERDUN POISSY (all in capital letters) and starting from zero', (done) => {
      dominosAPI.clearCookies();
      dominosAPI.initPage((err) => {
        if(err) done(err);
        dominosAPI.isAddressEligible(10, "RUE DE VERDUN", 78300, "POISSY", (err, result) => {
          if(err) done(err);
          assert.equal(result, true);
          done();
        });
      })
    });
    it('should return true when sending 10 RUE LEBON CERGY (all in capital letters) and starting from zero', (done) => {
      dominosAPI.clearCookies();
      dominosAPI.initPage((err) => {
        if(err) done(err);
        dominosAPI.isAddressEligible(10, "RUE LEBON", 95000, "CERGY", (err, result) => {
          if(err) done(err);
          assert.equal(result, true);
          done();
        });
      })
    });
    it('should return false when sending 10 RUE DU REAL CERGY (all in capital letters) and starting from zero', (done) => {
      dominosAPI.clearCookies();
      dominosAPI.initPage((err) => {
        if(err) done(err);
        dominosAPI.isAddressEligible(10, "RUE DU REAL", 95800, "CERGY", (err, result) => {
          if(err) done(err);
          assert.equal(result, false);
          done();
        });
      })
    });
  });

  describe("#isDominoStoreOpen", () => {
    it('For Poissy Store, it should be open between 11:30am to 2:30pm and between 6pm to 11pm', (done) => {
      dominosAPI = new DominosAPI();
      async.series([
        dominosAPI.initPage.bind(dominosAPI),
        dominosAPI.isAddressEligible.bind(dominosAPI, 10, "RUE DE VERDUN", 78300, "POISSY"),
        dominosAPI.isDominoStoreOpen.bind(dominosAPI, 10, "RUE DE VERDUN", 78300, "POISSY")
      ], (err, results) => {
        if(err) done(err);
        var currentDate = new Date();
        var openingTimeMorning = new Date();
        openingTimeMorning.setHours(11,30,0);
        var closingTimeMorning = new Date();
        closingTimeMorning.setHours(14,30,0);
        var openingTimeAfternoon = new Date();
        openingTimeAfternoon.setHours(18,0,0);
        var closingTimeAfternoon = new Date();
        closingTimeAfternoon.setHours(23,0,0);

        if((currentDate >= openingTimeMorning && currentDate <= closingTimeMorning) || (currentDate >= openingTimeAfternoon && currentDate <= closingTimeAfternoon)){
          assert.equal(results[2], true);
        }else{
          assert.equal(results[2][0], false);
        }
        done();
      });

    });
    it('For Paris 5 Store, it should be open between 11:00am to 2:30pm and between 6pm to 11pm', (done) => {
      dominosAPI.isDominoStoreOpen("3BIS", "RUE DOMAT", 75005, "PARIS", (err, result) => {
        if(err) done(err);
        var currentDate = new Date();
        var openingTimeMorning = new Date();
        openingTimeMorning.setHours(11,0,0);
        var closingTimeMorning = new Date();
        closingTimeMorning.setHours(14,30,0);
        var openingTimeAfternoon = new Date();
        openingTimeAfternoon.setHours(18,0,0);
        var closingTimeAfternoon = new Date();
        closingTimeAfternoon.setHours(23,0,0);

        if((currentDate >= openingTimeMorning && currentDate <= closingTimeMorning) || (currentDate >= openingTimeAfternoon && currentDate <= closingTimeAfternoon)){
          assert.equal(result, true);
        }else{
          assert.equal(result, false);
        }
        done();
      })
    });
    it('For Paris 13, it should be open between 11:00am to 2:30pm and between 6pm to 11pm', (done) => {
      dominosAPI.isDominoStoreOpen("2", "RUE MICHAL", 75013, "PARIS", (err, result) => {
        if(err) done(err);
        var currentDate = new Date();
        var openingTimeMorning = new Date();
        openingTimeMorning.setHours(11,0,0);
        var closingTimeMorning = new Date();
        closingTimeMorning.setHours(14,30,0);
        var openingTimeAfternoon = new Date();
        openingTimeAfternoon.setHours(18,0,0);
        var closingTimeAfternoon = new Date();
        closingTimeAfternoon.setHours(23,0,0);

        if((currentDate >= openingTimeMorning && currentDate <= closingTimeMorning) || (currentDate >= openingTimeAfternoon && currentDate <= closingTimeAfternoon)){
          assert.equal(result, true);
        }else{
          assert.equal(result, false);
        }
        done();
      })
    });
  });

  describe("#isDeliveryPossible", () => {
    it('should return false and "out of delivery range" for 10 place de la gare 78800 HOUILLES', (done) => {
      dominosAPI.isDeliveryPossible(10, 'place de la gare', 78800, "Houilles", (err, delivryPossible, details) =>{
        if(err) done(err);
        assert.equal(delivryPossible, false);
        assert.equal(details, "OUT OF RANGE DELIVERY");
        done();
      });
    });

    it('For Poissy Store, it should be open between 11:30am to 2:30pm and between 6pm to 11pm', (done) => {
      dominosAPI.clearCookies();
      async.series([
        dominosAPI.initPage.bind(dominosAPI),
        dominosAPI.isDeliveryPossible.bind(dominosAPI, 10, "RUE DE VERDUN", 78300, "POISSY"),
      ], (err, results) => {
        if(err) {
          done(err);
        }
        var isDeliveryPossible = results[1];
        var currentDate = new Date();
        var openingTimeMorning = new Date();
        openingTimeMorning.setHours(11,30,0);
        var closingTimeMorning = new Date();
        closingTimeMorning.setHours(14,30,0);
        var openingTimeAfternoon = new Date();
        openingTimeAfternoon.setHours(18,0,0);
        var closingTimeAfternoon = new Date();
        closingTimeAfternoon.setHours(23,0,0);

        if((currentDate >= openingTimeMorning && currentDate <= closingTimeMorning) || (currentDate >= openingTimeAfternoon && currentDate <= closingTimeAfternoon)){
          assert.equal(isDeliveryPossible, true);
        }else{
          isDeliveryPossible = results[1][0];
          assert.equal(isDeliveryPossible, false, "SHOP CLOSE");
        }
        done();
      });
    });
  });



  describe("#getOrderTimes", () => {
    it("Should return an array of time proposition", (done) => {
      dominosAPI = new DominosAPI();
      async.series([
        dominosAPI.initPage.bind(dominosAPI),
        dominosAPI.isDeliveryPossible.bind(dominosAPI, 10, "RUE LULLI", 13001, "MARSEILLE"),
        dominosAPI.selectDeliverAfter.bind(dominosAPI),
        dominosAPI.getOrderTimes.bind(dominosAPI, 31982, new Date())
      ], (err, results) => {
        if(err) done(err);
        assert.equal(Array.isArray(results[3].times), true);
        done();
      });
    });

    it("Should return an error if address has not been verified first", (done) => {
      tempDominoAPI = new DominosAPI();
      async.series([
        tempDominoAPI.initPage.bind(tempDominoAPI),
        //tempDominoAPI.isDeliveryPossible.bind(dominosAPI, 10, "RUE LULLI", 13001, "MARSEILLE"),
        tempDominoAPI.selectDeliverAfter.bind(tempDominoAPI),
        tempDominoAPI.getOrderTimes.bind(tempDominoAPI, null, new Date()),
      ], (err, results) => {
        assert.equal(err.message, "StoreId should be an integer");
        done();
      });
    });

    it("Should open at 11am30 for Marseille shop", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.getOrderTimes(storeId, tomorrow, (err, orderTimes) => {
        if(err) done (err);
        var firstOpeningHour = new Date(orderTimes.times[0].value);
        assert.equal(firstOpeningHour.getHours(), 11);
        assert.equal(firstOpeningHour.getMinutes(), 30);
        done();
      });
    });

    it("Should close at 11pm for Marseille shop", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.getOrderTimes(storeId, tomorrow, (err, orderTimes) => {
        if(err) done (err);
        var firstOpeningHour = new Date(orderTimes.times[orderTimes.times.length-1].value);
        assert.equal(firstOpeningHour.getHours(), 23);
        assert.equal(firstOpeningHour.getMinutes(), 0);
        done();
      });
    });

    it("Should return an error when sending a wrong date", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      dominosAPI.getOrderTimes(31982, "Wrong date format", (err, orderTimes) => {
        assert.equal(err.message, "Should have an instance of Date in parameter");
        done();
      });
    });

    it("Should return an error when sending a date from yesterday", (done) => {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() -1);
      dominosAPI.getOrderTimes(31982, yesterday, (err, orderTimes) => {
        assert.equal(err.message, "Date cannot be anterior");
        done();
      });
    });
  });

  describe("#selectDeliveryTime", () => {
    it("Should return an error when sending a date before today", (done) => {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() -1);
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.selectDeliveryTime(storeId, yesterday, (err, result) => {
        assert.equal(err.message, "Date cannot be anterior");
        done();
      });
    });

    it("Should return an error when sending a date after the closing hour", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      tomorrow.setUTCHours(23,59,0)
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.selectDeliveryTime(storeId, tomorrow, (err, result) => {
        assert.equal(err.message, "Time selected out of store opening hours");
        done();
      });
    });

    it("Should return an error when sending a date before the opening hour", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      tomorrow.setUTCHours(0,0,0)
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.selectDeliveryTime(storeId, tomorrow, (err, result) => {
        assert.equal(err.message, "Time selected out of store opening hours");
        done();
      });
    });

    it("Should return an error when not sending a proper date in parameter", (done) => {
      dominosAPI.selectDeliveryTime(31982, "Wrong time", (err, result) => {
        assert.equal(err.message, "Should have an instance of Date in parameter");
        done();
      });
    });

    it("Should return 12pm when selecting 12pm for tomorrow", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      tomorrow.setUTCHours(12,0,0);
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.selectDeliveryTime(31982, tomorrow, (err, result) => {
        if(err) done(err);
        assert.equal(result.getHours(), tomorrow.getHours());
        assert.equal(result.getMinutes(), tomorrow.getMinutes());
        done();
      });
    });

    it("Should return 6:30pm when selecting 5pm for tomorrow", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      tomorrow.setUTCHours(17,0,0);
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.selectDeliveryTime(31982, tomorrow, (err, result) => {
        if(err) done(err);
        if(tomorrow.getDay() === 0){
          assert.equal(result.getHours(), tomorrow.getHours());
          assert.equal(result.getMinutes(), tomorrow.getMinutes());
        }else{
          assert.equal(result.getHours(), tomorrow.getHours()+1);
          assert.equal(result.getMinutes(), tomorrow.getMinutes()+30);
        }
        done();
      });
    });

    it("Should return 8pm when selecting 8:05pm for tomorrow", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      tomorrow.setUTCHours(20,5,0);
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.selectDeliveryTime(31982, tomorrow, (err, result) => {
        if(err) done(err);
        assert.equal(result.getHours(), tomorrow.getHours());
        assert.equal(result.getMinutes(), tomorrow.getMinutes()-5);
        done();
      });
    });

    it("Should return 8:45pm when selecting 8:45pm for tomorrow", (done) => {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() +1);
      tomorrow.setUTCHours(20,45,0);
      var storeId = dominosAPI.getMyStoreId();
      dominosAPI.selectDeliveryTime(31982, tomorrow, (err, result) => {
        if(err) done(err);
        assert.equal(result.getHours(), tomorrow.getHours());
        assert.equal(result.getMinutes(), tomorrow.getMinutes());
        done();
      });
    });
  });

  describe("#addToOrder", () => {
    it("Should throw an error when sending negative quantity", (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.throws(() => dominosAPI.addToOrder(pizza, -10, () => {if(err) throw err}));
      done();
    });
    it("Should throw an error when sending an unknow product", (done) => {
      assert.throws(() => dominosAPI.addToOrder("false product", 1, () => {if(err) throw err}));
      done();
    });
    it("Should update the cart when adding a PepperoniPizza", (done) => {
      dominosAPI.clearCookies();
      dominosAPI.initPage((err, body) => {
        if(err) done(err);
        dominosAPI.isDeliveryPossible(10, "RUE DE VERDUN", 78300, "POISSY", (err, response) => {
          if(err) done(err);
          var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);

          dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
            if(err) done(err);
            //console.log(bascket);
            assert.equal(bascket.cart.products.length, 1);
            assert.equal(bascket.cart.products[0].id, pizza.primaryProduct.productCode);
            assert.equal(bascket.cart.products[0].modifications.length, 0);
            assert.equal(bascket.cart.cartTotal, "8,99€");
            done();
          });
        });
      });
    });

    it("Should not mix two differents basckets when instanciating 2 dominosAPIs", (done) => {
      var api1 = new DominosAPI();
      var api2 = new DominosAPI();
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);

      var instructionsToFollow = [
        api1.initPage.bind(api1),
        api2.initPage.bind(api2),
        api1.isDeliveryPossible.bind(api1, 10, "RUE DE VERDUN", 78300, "POISSY"),
        api2.isDeliveryPossible.bind(api2, 10, "RUE DE VERDUN", 78300, "POISSY"),
        api1.addToOrder.bind(api1, pizza, 1),
        api2.addToOrder.bind(api2, pizza, 1)
      ];

      async.series(instructionsToFollow, (err, results) => {
        if(err) done (err);

        var bascket1 = results[4];
        var bascket2 = results[5];

        assert.equal(bascket1.cart.products.length, 1);
        assert.equal(bascket1.cart.products[0].id, pizza.primaryProduct.productCode);
        assert.equal(bascket1.cart.products[0].modifications.length, 0);
        assert.equal(bascket1.cart.cartTotal, "8,99€");

        assert.equal(bascket2.cart.products.length, 1);
        assert.equal(bascket2.cart.products[0].id, pizza.primaryProduct.productCode);
        assert.equal(bascket2.cart.products[0].modifications.length, 0);
        assert.equal(bascket2.cart.cartTotal, "8,99€");
        done();
      })
    });
  });

  describe("#removeProductFromBascket", () => {
    it("Should throw an error when trying to remove a product not present in the bascket", (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      pizza.primaryProduct.productCode = "Product code that does not exist";
      dominosAPI.removeProductFromBascket(pizza, (err, result) => {
        assert.equal(err, "Error: Product you want to delete not found in the bascket.");
        done();
      });
    });
    it("Should remove a PepperoniPizza from the bascket 123", (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.removeProductFromBascket(pizza, (err, bascket) => {
        if(err) done(err);
        assert.equal(bascket.cart.products.length, 0);
        assert.equal(bascket.cart.cartTotal, "0,00€");
        done();
      })
    });
  });

  describe("#checkout", () => {
    it("Should return and error when adding in the bascket only entries or drink", (done) => {
      var tempDominoAPI = new DominosAPI();
      var chickenWings = new ChickenWingsEntry();
      var oasisDrink = new OasisDrink(Drink.CAN_SIZE);
      async.series([
        tempDominoAPI.initPage.bind(tempDominoAPI),
        tempDominoAPI.isDeliveryPossible.bind(tempDominoAPI, 10, "BOULEVARD ROSE", 78300, "POISSY"),
        tempDominoAPI.addToOrder.bind(tempDominoAPI, chickenWings, 10),
        tempDominoAPI.addToOrder.bind(tempDominoAPI, oasisDrink, 3),
        tempDominoAPI.checkout.bind(tempDominoAPI, "Nicolas Sarkozy", "0626770748", "nicolas.sarkozy@gmail.com", "", "Cash")
      ], (err, results) => {
        assert.equal(err, "Error: You should have at least one pizza in your bascket");
        done();
      });
    });

    it("Should return and error when sending an order less than 15€", (done) => {
      dominosAPI.clearCookies();
      dominosAPI.initPage((err, body) => {
        if(err) done(err);
        dominosAPI.isDeliveryPossible(10, "RUE DE VERDUN", 78300, "POISSY", (err, response) => {
          if(err) done(err);
          var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
          dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
            if(err) done(err);
            dominosAPI.checkout("Elyes Hachem", "0626770744", "elyeshm@gmail.com", "instructions", "Cash", (err, success) => {
              assert.equal(err, "Error: Order minimum amount should be 15€");
              done();
            });
          });
        });
      });
    });
    it("Should return and error when sending empty name", (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
        if(err) done(err);
        dominosAPI.checkout(null, "0626770744", "elyeshm@gmail.com", "instructions", "Cash", (err, success) => {
          assert.equal(err, "TypeError: Name is empty during Checkout");
          done();
        });
      });
    });

    it("Should return and error when sending false number", (done) => {
      dominosAPI.checkout("Elyes Hachem", "false number", "elyeshm@gmail.com", "instructions", "Cash", (err, success) => {
        assert.equal(err, "TypeError: Wrong phone provided during Checkout");
        done();
      });
    });

    it("Should return and error when sending false email", (done) => {
      dominosAPI.checkout("Elyes Hachem", "0130743583", "fake email@gmail", "instructions", "Cash", (err, success) => {
        assert.equal(err, "TypeError: Wrong email provided during Checkout");
        done();
      });
    });

    it("Should return and error when sending false payment method", (done) => {
      dominosAPI.checkout("Elyes Hachem", "0130743583", "elyeshm@gmail.com", "instructions", "WrongPaymentMethod", (err, success) => {
        assert.equal(err, "TypeError: Wrong payment method provided during Checkout");
        done();
      });
    });

    it("Should works when sending empty instructions", (done) => {
      dominosAPI.checkout("Elyes Hachem", "0130743583", "elyeshm@gmail.com", "", "Cash", (err, response) => {
        assert.equal(err, null);
        assert.equal(typeof response, "string");
        assert.equal(response.length, 92);
        done();
      });
    });

    it("Checkout Final", (done) => {
      dominosAPI.clearCookies();
      dominosAPI.initPage((err, body) => {
        if(err) done(err);
        dominosAPI.isDeliveryPossible(10, "RUE DE VERDUN", 78300, "POISSY", (err, response) => {
          if(err) done(err);
          var pizza = new OrientalePizza(Pizza.SIZE_LARGE, Pizza.CLASSIQUE_CRUST);
          var entry = new ChickenWingsEntry(Entry.BBQ_SAUCE);

          dominosAPI.addToOrder(entry, 1, (err, bascket) => {
            if(err) done(err);
            dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
              if(err) done(err);
              dominosAPI.checkout("Elyes HACHEM", "0626770744", "freezerhm@yahoo.fr", "Sonner à l'interphone une fois arrivé", "Cash", (err, verificationToken) => {
                if(err) done(err);
                //Cookie="ErrorMessages=%5b%22Sorry%2c+the+payment+details+were+not+valid.+Please+try+again.%22%5d;
                dominosAPI.checkoutConfirmation(dominosAPI.getDeliveryTimeSaved(), verificationToken, true, (err, body) => {
                  if(err) done(err);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
