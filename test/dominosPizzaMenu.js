require('newrelic');
var assert = require('assert');
var {DominosAPI} = new require('./../services/dominosAPI');
var dominosAPI = new DominosAPI();
var {Pizza, PepperoniPizza, ReinePizza, OrientalePizza, BarbecuePizza, FourCheesePizza, SalmonPizza} = require('./../services/DominosMenu/dominosPizzaMenu');
var async = require("async");


describe('DominosMenu', () => {
  describe('#PepperoniPizza', () => {
    it('Should return 2 ingredients Mozza and pepperoni when instanciate a new Pizza', (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].toppings.length, 2);
      assert.equal(pizza.primaryProduct.Portions[0].toppings[0].componentCode, "Topping.MOZZA");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[1].componentCode, "Topping.PEPPR");
      done();
    });
    it('Should have a tomato sauce', (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces.length, 1);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces[0].componentCode, "Sauce.TOMSC");
      done();
    });
    it('Should have two kinds of size medium and large', (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Medium");
      pizza = new PepperoniPizza(Pizza.SIZE_LARGE, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Large");
      done();
    });
    it('Should have two kinds of crust', (done) => {
      var pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.T");
      pizza = new PepperoniPizza(Pizza.SIZE_MEDIUM, Pizza.CLASSIQUE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.H");
      done();
    });
    it('Should return an error when sending unknown size', (done) => {
      assert.throws(() => new PepperoniPizza("UNKNOWN PIZZA SIZE", Pizza.FINE_CRUST), Error);
      done();
    });
    it('Should return an error when sending unknown crust', (done) => {
      assert.throws(() => new PepperoniPizza(Pizza.SIZE_LARGE, "UNKNOWN CRUST"), Error);
      done();
    });
  });

  describe('#ReinePizza', () => {
    it('Should return 3 ingredients Mozza and Champ and ham when instanciate a new Pizza', (done) => {
      var pizza = new ReinePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].toppings.length, 3);
      assert.equal(pizza.primaryProduct.Portions[0].toppings[0].componentCode, "Topping.CHAMP");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[1].componentCode, "Topping.JAMBN");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[2].componentCode, "Topping.MOZZA");
      done();
    });
    it('Should have a tomato sauce', (done) => {
      var pizza = new ReinePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces.length, 1);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces[0].componentCode, "Sauce.TOMSC");
      done();
    });
    it('Should have two kinds of size medium and large', (done) => {
      var pizza = new ReinePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Medium");
      pizza = new ReinePizza(Pizza.SIZE_LARGE, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Large");
      done();
    });
    it('Should have two kinds of crust', (done) => {
      var pizza = new ReinePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.T");
      pizza = new ReinePizza(Pizza.SIZE_MEDIUM, Pizza.CLASSIQUE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.H");
      done();
    });
    it('Should return an error when sending unknown size', (done) => {
      assert.throws(() => new ReinePizza("UNKNOWN PIZZA SIZE", Pizza.FINE_CRUST), Error);
      done();
    });
    it('Should return an error when sending unknown crust', (done) => {
      assert.throws(() => new ReinePizza(Pizza.SIZE_LARGE, "UNKNOWN CRUST"), Error);
      done();
    });
  });

  describe('#OrientalePizza', () => {
    it('Should return 4 ingredients when instanciate a new Pizza', (done) => {
      var pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].toppings.length, 4);
      assert.equal(pizza.primaryProduct.Portions[0].toppings[0].componentCode, "Topping.MERGZ");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[1].componentCode, "Topping.MOZZA");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[2].componentCode, "Topping.OIGNO");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[3].componentCode, "Topping.PME");
      done();
    });
    it('Should have a tomato sauce', (done) => {
      var pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces.length, 1);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces[0].componentCode, "Sauce.TOMSC");
      done();
    });
    it('Should have two kinds of size medium and large', (done) => {
      var pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Medium");
      pizza = new OrientalePizza(Pizza.SIZE_LARGE, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Large");
      done();
    });
    it('Should have two kinds of crust', (done) => {
      var pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.T");
      pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.CLASSIQUE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.H");
      done();
    });
    it('Should return an error when sending unknown size', (done) => {
      assert.throws(() => new OrientalePizza("UNKNOWN PIZZA SIZE", Pizza.FINE_CRUST), Error);
      done();
    });
    it('Should return an error when sending unknown crust', (done) => {
      assert.throws(() => new OrientalePizza(Pizza.SIZE_LARGE, "UNKNOWN CRUST"), Error);
      done();
    });
    it('Should have the same JSON as the official page', (done) => {
      var officialJSON = {"primaryProduct":{"Portions":[{"Sauces":[{"componentCode":"Sauce.TOMSC","quantity":1}],"options":[],"productCode":null,"toppings":[{"componentCode":"Topping.MERGZ","quantity":1},{"componentCode":"Topping.MOZZA","quantity":1},{"componentCode":"Topping.OIGNO","quantity":1},{"componentCode":"Topping.PME","quantity":1}]}],"crusts":[{"componentCode":"Crust.T","quantity":1}],"productCode":"PORI","productSizeCode":"Pizza.Medium","quantity":1},"secondaryProduct":null};
      var pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);

      assert.equal(JSON.stringify(pizza), JSON.stringify(officialJSON));
      done();
    })
  });

  describe('#BarbecuePizza', () => {
    it('Should return 4 ingredients when instanciate a new Pizza', (done) => {
      var pizza = new BarbecuePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].toppings.length, 4);
      assert.equal(pizza.primaryProduct.Portions[0].toppings[0].componentCode, "Topping.BŒUF");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[1].componentCode, "Topping.H-CHI");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[2].componentCode, "Topping.MERGZ");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[3].componentCode, "Topping.MOZZA");
      //assert.equal(pizza.primaryProduct.Portions[0].toppings[4].componentCode, "Topping.TOMSE");
      done();
    });
    it('Should have a barbeque sauce', (done) => {
      var pizza = new BarbecuePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces.length, 1);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces[0].componentCode, "Sauce.BBQSC");
      done();
    });
    it('Should have two kinds of size medium and large', (done) => {
      var pizza = new BarbecuePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Medium");
      pizza = new BarbecuePizza(Pizza.SIZE_LARGE, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Large");
      done();
    });
    it('Should have two kinds of crust', (done) => {
      var pizza = new BarbecuePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.T");
      pizza = new BarbecuePizza(Pizza.SIZE_MEDIUM, Pizza.CLASSIQUE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.H");
      done();
    });
    it('Should return an error when sending unknown size', (done) => {
      assert.throws(() => new BarbecuePizza("UNKNOWN PIZZA SIZE", Pizza.FINE_CRUST), Error);
      done();
    });
    it('Should return an error when sending unknown crust', (done) => {
      assert.throws(() => new BarbecuePizza(Pizza.SIZE_LARGE, "UNKNOWN CRUST"), Error);
      done();
    });
  });

  describe('#FourCheesePizza', () => {
    it('Should return 4 ingredients when instanciate a new Pizza', (done) => {
      var pizza = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].toppings.length, 4);
      assert.equal(pizza.primaryProduct.Portions[0].toppings[0].componentCode, "Topping.CHEVR");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[1].componentCode, "Topping.EMMEN");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[2].componentCode, "Topping.FOURM");
      assert.equal(pizza.primaryProduct.Portions[0].toppings[3].componentCode, "Topping.MOZZA");
      done();
    });
    it('Should have a tomato sauce', (done) => {
      var pizza = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces.length, 1);
      assert.equal(pizza.primaryProduct.Portions[0].Sauces[0].componentCode, "Sauce.TOMSC");
      done();
    });
    it('Should have two kinds of size medium and large', (done) => {
      var pizza = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Medium");
      pizza = new FourCheesePizza(Pizza.SIZE_LARGE, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Large");
      done();
    });
    it('Should have two kinds of crust', (done) => {
      var pizza = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.T");
      pizza = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.CLASSIQUE_CRUST);
      assert.equal(pizza.primaryProduct.crusts[0].componentCode, "Crust.H");
      done();
    });
    it('Should return an error when sending unknown size', (done) => {
      assert.throws(() => new FourCheesePizza("UNKNOWN PIZZA SIZE", Pizza.FINE_CRUST), Error);
      done();
    });
    it('Should return an error when sending unknown crust', (done) => {
      assert.throws(() => new FourCheesePizza(Pizza.SIZE_LARGE, "UNKNOWN CRUST"), Error);
      done();
    });
  });

  describe('#SalmonPizza', () => {
    it('Should return 0 ingredients when instanciate a new Pizza', (done) => {
      var pizza = new SalmonPizza();
      assert.equal(pizza.primaryProduct.Portions[0].toppings.length, 0);
      done();
    });
    it('Should have a null sauce', (done) => {
      var pizza = new SalmonPizza();
      assert.equal(pizza.primaryProduct.Portions[0].Sauces, null);
      done();
    });
    it('Should have medium size in any case', (done) => {
      var pizza = new SalmonPizza();
      assert.equal(pizza.primaryProduct.productSizeCode, "Pizza.Medium");
      done();
    });
    it('Should have no crust', (done) => {
      var pizza = new SalmonPizza();
      assert.equal(pizza.primaryProduct.crusts.length, 0);
      done();
    });
  });

  describe("#Adding and removing all pizza catalog", () => {
    it("Should add correctly the ReinePizza in the bascket", (done) => {
      var pizza = new ReinePizza(Pizza.SIZE_MEDIUM, Pizza.CLASSIQUE_CRUST);
      async.series([
        dominosAPI.initPage.bind(dominosAPI),
        dominosAPI.isDeliveryPossible.bind(dominosAPI, 10, "RUE LULLI", 13001, "MARSEILLE"),
        dominosAPI.addToOrder.bind(dominosAPI, pizza, 1)
      ], (err, results) => {
        if(err) done(err);
        var finalBascket = results[2];
        assert.equal(finalBascket.cart.cartTotal, "12,00€");
        assert.equal(finalBascket.cart.products.length, 1);
        assert.equal(finalBascket.cart.products[0].id, pizza.primaryProduct.productCode);
        assert.equal(finalBascket.cart.products[0].modifications.length, 0);
        done();
      });
    });

    it("Should add correctly the BarbecuePizza in the bascket", (done) => {
      var pizza = new BarbecuePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
        if(err) done(err);
        assert.equal(bascket.cart.products.length, 2);
        assert.equal(bascket.cart.products[0].id, pizza.primaryProduct.productCode);
        assert.equal(bascket.cart.products[0].modifications.length, 0);
        assert.equal(bascket.cart.cartTotal, "25,00€");
        done();
      });
    });

    it("Should add correctly the OrientalePizza in the bascket", (done) => {
      var pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
        if(err) done(err);
        assert.equal(bascket.cart.products.length, 3);
        assert.equal(bascket.cart.products[1].id, pizza.primaryProduct.productCode);
        assert.equal(bascket.cart.products[1].modifications.length, 0);
        assert.equal(bascket.cart.cartTotal, "37,00€");
        done();
      });
    });

    it("Should add correctly the FourCheese in the bascket", (done) => {
      var pizza = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
        if(err) done(err);
        assert.equal(bascket.cart.products.length, 4);
        assert.equal(bascket.cart.products[0].id, pizza.primaryProduct.productCode);
        assert.equal(bascket.cart.products[0].modifications.length, 0);
        assert.equal(bascket.cart.cartTotal, "50,00€");
        done();
      });
    });

    it("Should add correctly the SalmonPizza in the bascket", (done) => {
      var pizza = new SalmonPizza();
      dominosAPI.addToOrder(pizza, 1, (err, bascket) => {
        if(err) done(err);
        assert.equal(bascket.cart.products.length, 5);
        assert.equal(bascket.cart.products[0].id, pizza.primaryProduct.productCode);
        assert.equal(bascket.cart.products[0].modifications.length, 0);
        assert.equal(bascket.cart.cartTotal, "64,00€");
        done();
      });
    });

    it("Should add correctly the 3 SalmonPizza in the bascket", (done) => {
      var pizza = new SalmonPizza();
      dominosAPI.addToOrder(pizza, 3, (err, bascket) => {
        if(err) done(err);
        assert.equal(bascket.cart.products.length, 5);
        assert.equal(bascket.cart.products[0].id, pizza.primaryProduct.productCode);
        assert.equal(bascket.cart.products[0].modifications.length, 0);
        assert.equal(bascket.cart.cartTotal, "106,00€");
        done();
      });
    });

    it("Should remove all the SalmonPizza in the bascket ", (done) => {
      var pizza = new SalmonPizza();
      dominosAPI.removeProductFromBascket(pizza, (err, bascket) => {
        if(err) done(err);
        assert.equal(bascket.cart.products.length, 4);
        assert.equal(bascket.cart.cartTotal, "50,00€");
        done();
      });
    });
    it("Should add one 4 cheese then add 3 Orientale and then be able to remove all the orientale pizza at one", (done) => {
      var tempDominoAPI = new DominosAPI();
      var pizzaFourCheese = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      var pizzaOrientale = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      async.series([
        tempDominoAPI.initPage.bind(tempDominoAPI),
        tempDominoAPI.isDeliveryPossible.bind(tempDominoAPI, 10, "BOULEVARD ROSE", 78300, "POISSY"),
        tempDominoAPI.addToOrder.bind(tempDominoAPI, pizzaFourCheese, 1),
        tempDominoAPI.addToOrder.bind(tempDominoAPI, pizzaOrientale, 3),
        tempDominoAPI.removeProductFromBascket.bind(tempDominoAPI, pizzaOrientale),
      ], (err, results) => {
        if(err) done(err);
        var finalBascket = results[4];
        assert.equal(finalBascket.cart.cartTotal, "12,00€");
        done();
      });
    });
  });

  describe("#getBacketTotalAmount", () => {
    it("Should return 50", (done) => {
      dominosAPI.getBacketTotalAmount((err, total) => {
        if(err) throw err;
        assert.equal(total, 50);
        done();
      });
    });
    it("Should return 37", (done) => {
      var pizza = new FourCheesePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.removeProductFromBascket(pizza, (err, bascket) => {
        if(err) throw err;
        dominosAPI.getBacketTotalAmount((err, total) => {
          if(err) throw err;
          assert.equal(total, 37);
          done();
        });
      });
    });
    it("Should return 24", (done) => {
      var pizza = new BarbecuePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.removeProductFromBascket(pizza, (err, bascket) => {
        if(err) throw err;
        dominosAPI.getBacketTotalAmount((err, total) => {
          if(err) throw err;
          assert.equal(total, 24);
          done();
        });
      });
    });
    it("Should return 12", (done) => {
      var pizza = new OrientalePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.removeProductFromBascket(pizza, (err, bascket) => {
        if(err) throw err;
        dominosAPI.getBacketTotalAmount((err, total) => {
          if(err) throw err;
          assert.equal(total, 12);
          done();
        });
      });
    });
    it("Should return 0", (done) => {
      var pizza = new ReinePizza(Pizza.SIZE_MEDIUM, Pizza.FINE_CRUST);
      dominosAPI.removeProductFromBascket(pizza, (err, bascket) => {
        if(err) throw err;
        dominosAPI.getBacketTotalAmount((err, total) => {
          if(err) throw err;
          assert.equal(total, 0);
          done();
        });
      });
    });
  });

});
