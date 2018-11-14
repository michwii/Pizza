class Product {
  constructor(portions, crust, productCode, size){
    this.primaryProduct = {
      Portions : [portions],
      crusts : [crust],
      productCode : productCode,
      productSizeCode : size,
      quantity : 1
    }
    this.secondaryProduct = null;
  }

  get productCode(){
    return this.primaryProduct.productCode;
  }
}

class Ingredient {
  constructor(componentCode){
    this.componentCode = componentCode;
    this.quantity = 1;
  }
}

exports.Product = Product;
exports.Ingredient = Ingredient;
