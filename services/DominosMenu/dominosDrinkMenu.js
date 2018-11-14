var {Product} = require("./dominosMenu");

class Drink extends Product {

  static get BOTTLE_SIZE(){
    return "BOTTLE_SIZE";
  }

  static get CAN_SIZE(){
    return "CAN_SIZE";
  }

  appliCustomizations(customizations){
    if(customizations[this.productCode]){
      //We test if we have selected a bottle. In the majority of the cases, the bootle has a customization property.
      if(this.primaryProduct.productSizeCode === "Drink.Soft.1500ML"){
        for(var size of customizations[this.productCode].Sizes){
          if(size.Name !== "33cl"){
            this.primaryProduct.productSizeCode = size.Code;
          }
        }
      }
    }
  }

  constructor(productCode, size){
    var portions ={
      Sauces : null,
      options : [],
      productCode : null,
      toppings : []
    }
    super(portions, null, productCode, size);
    this.primaryProduct.crusts = [];
  }
}

class CocaColaDrink extends Drink {
  constructor(size){
    if(size === "BOTTLE_SIZE"){
      size = "Drink.Soft.1500ML";
    }else if(size === "CAN_SIZE"){
      size = "Drink.Soft.330ML";
    }else{
      throw new TypeError("Unknow type of size");
    }
    super("DCOK", size);
  }
}

class CocaColaZeroDrink extends Drink {
  constructor(size){
    if(size === "BOTTLE_SIZE"){
      size = "Drink.Soft.1500ML";
    }else if(size === "CAN_SIZE"){
      size = "Drink.Soft.330ML";
    }else{
      throw new TypeError("Unknow type of size");
    }
    super("DCOZ", size);
  }
}

class FantaDrink extends Drink {
  constructor(size){
    if(size === "BOTTLE_SIZE"){
      size = "Drink.Soft.1500ML";
    }else if(size === "CAN_SIZE"){
      size = "Drink.Soft.330ML";
    }else{
      throw new TypeError("Unknow type of size");
    }
    super("DFAN", size);
  }
}

class OasisDrink extends Drink {
  constructor(size){
    if(size === "BOTTLE_SIZE"){
      size = "Drink.Soft.2000ML";
    }else if(size === "CAN_SIZE"){
      size = "Drink.Soft.330ML";
    }else{
      throw new TypeError("Unknow type of size");
    }
    super("DOTR", size);
  }
}

class EvianDrink extends Drink {
  constructor(){
    super("DEVI0500", null);
  }
}

exports.Drink = Drink;
exports.CocaColaDrink = CocaColaDrink;
exports.CocaColaZeroDrink = CocaColaZeroDrink;
exports.OasisDrink = OasisDrink;
exports.FantaDrink = FantaDrink;
exports.EvianDrink = EvianDrink;
