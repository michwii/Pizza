var {Product, Ingredient} = require("./dominosMenu");

class Pizza extends Product {

  static get SIZE_MEDIUM(){
    return "Pizza.Medium";
  }

  static get SIZE_LARGE(){
    return "Pizza.Large";
  }

  static get TOMATO_SAUCE(){
    return tomatoSauce;
  }

  static get BBQ_SAUCE(){
    return bbqSauce;
  }

  static get FINE_CRUST(){
    return fineCrust;
  }

  static get CLASSIQUE_CRUST(){
    return classiqueCrust
  }

  static get NO_CRUST(){
    return null;
  }

  constructor(productCode, size, sauce, ingredients, crust){

    if((size !== Pizza.SIZE_MEDIUM && size !== Pizza.SIZE_LARGE) || (crust !== Pizza.FINE_CRUST && crust !== Pizza.CLASSIQUE_CRUST && crust !== Pizza.NO_CRUST)){
      throw new Error("Wrong input parameters");
    }

    var portions ={
      Sauces : [sauce],
      options : [],
      productCode : null,
      toppings : ingredients
    }

    super(portions, crust, productCode, size);

  }
}

var tomatoSauce = new Ingredient("Sauce.TOMSC");
var bbqSauce = new Ingredient("Sauce.BBQSC");
var fineCrust = new Ingredient("Crust.T");
var classiqueCrust = new Ingredient("Crust.H");

class PepperoniPizza extends Pizza {
  constructor(size, crust){
    var ingredients = [];
    ingredients.push(new Ingredient("Topping.MOZZA"));
    ingredients.push(new Ingredient("Topping.PEPPR"));
    super("PCHP", size, Pizza.TOMATO_SAUCE, ingredients, crust);
  }
}

class ReinePizza extends Pizza {
  constructor(size, crust){
    var ingredients = [];
    ingredients.push(new Ingredient("Topping.CHAMP"));
    ingredients.push(new Ingredient("Topping.JAMBN"));
    ingredients.push(new Ingredient("Topping.MOZZA"));
    super("PREI", size, Pizza.TOMATO_SAUCE, ingredients, crust);
  }
}

class OrientalePizza extends Pizza {
  constructor(size, crust){
    var ingredients = [];
    ingredients.push(new Ingredient("Topping.MERGZ"));
    ingredients.push(new Ingredient("Topping.MOZZA"));
    ingredients.push(new Ingredient("Topping.OIGNO"));
    ingredients.push(new Ingredient("Topping.PME"));
    super("PORI", size, Pizza.TOMATO_SAUCE, ingredients, crust);
  }
}

class BarbecuePizza extends Pizza {
  constructor(size, crust){
    var ingredients = [];
    ingredients.push(new Ingredient("Topping.BŒUF"));
    ingredients.push(new Ingredient("Topping.H-CHI"));
    ingredients.push(new Ingredient("Topping.MERGZ"));
    ingredients.push(new Ingredient("Topping.MOZZA"));
    //ingredients.push(new Ingredient("Topping.TOMSE"));
    super("PCAN", size, Pizza.BBQ_SAUCE, ingredients, crust);
  }
}

class FourCheesePizza extends Pizza {
  constructor(size, crust){
    var ingredients = [];
    ingredients.push(new Ingredient("Topping.CHEVR"));
    ingredients.push(new Ingredient("Topping.EMMEN"));
    ingredients.push(new Ingredient("Topping.FOURM"));
    ingredients.push(new Ingredient("Topping.MOZZA"));
    super("P4FR", size, Pizza.TOMATO_SAUCE, ingredients, crust);
  }
}

class SalmonPizza extends Pizza {
  constructor(){
    var ingredients = [];
    super("PSSE", Pizza.SIZE_MEDIUM, null, [], Pizza.NO_CRUST);
    this.primaryProduct.Portions[0].Sauces = null;
    this.primaryProduct.crusts = [];
  }
}

exports.Pizza = Pizza;
exports.PepperoniPizza = PepperoniPizza;
exports.ReinePizza = ReinePizza;
exports.OrientalePizza = OrientalePizza;
exports.BarbecuePizza = BarbecuePizza;
exports.FourCheesePizza = FourCheesePizza;
exports.SalmonPizza = SalmonPizza;
