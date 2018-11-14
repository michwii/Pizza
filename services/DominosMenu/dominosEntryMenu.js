var {Product, Ingredient} = require("./dominosMenu");

var bbqSauceForEntry = new Ingredient("Option.EABBQ");
var caesarSauceForEntry = new Ingredient("Option.EACAE");

class Entry extends Product {

  static get BBQ_SAUCE(){
    return bbqSauceForEntry;
  }

  static get CAESAR_SAUCE(){
    return caesarSauceForEntry;
  }

  constructor(productCode, sauce){
    var portions ={
      Sauces : null,
      options : [sauce],
      productCode : null,
      toppings : []
    }

    super(portions, null, productCode, null);
    this.primaryProduct.crusts = [];
  }
}

class ChickenWingsEntry extends Entry {
  constructor(){
    super("ECBFW", Entry.BBQ_SAUCE);
  }
}

class PotatosEntry extends Entry {
  constructor(){
    super("EOPOT", Entry.BBQ_SAUCE);
  }
}

class SaladeEntry extends Entry {
  constructor(){
    super("ESCAE", Entry.CAESAR_SAUCE);
  }
}

exports.Entry = Entry;
exports.ChickenWingsEntry = ChickenWingsEntry;
exports.PotatosEntry = PotatosEntry;
exports.SaladeEntry = SaladeEntry;
