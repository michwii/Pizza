require('newrelic');
var assert = require("assert");
var {Entry, ChickenWingsEntry, PotatosEntry, SaladeEntry} = require('./../services/DominosMenu/dominosEntryMenu');

describe("#Chicken Wings", () => {
  it("Should have a productsizecode equal to null", (done) => {
    var entry = new ChickenWingsEntry();
    assert.equal(entry.primaryProduct.productSizeCode, null);
    done();
  });
  it("Should have a product code equal to ECBFW", (done) => {
    var entry = new ChickenWingsEntry();
    assert.equal(entry.primaryProduct.productCode, "ECBFW");
    done();
  });
  it("Should have an empty crust array", (done) => {
    var entry = new ChickenWingsEntry();
    assert.equal(entry.primaryProduct.crusts.length, 0);
    done();
  });
  it("Should have a sauce equals to null", (done) => {
    var entry = new ChickenWingsEntry();
    assert.equal(entry.primaryProduct.sauce, null);
    done();
  });
  it("Should have a product code equals to null", (done) => {
    var entry = new ChickenWingsEntry();
    assert.equal(entry.primaryProduct.Portions.productCode, null);
    done();
  });
  it("Should have an empty toppings array", (done) => {
    var entry = new ChickenWingsEntry();
    assert.equal(entry.primaryProduct.Portions[0].toppings.length, 0);
    done();
  });
  it("Should have a barbecue sauce", (done) => {
    var entry = new ChickenWingsEntry();
    assert.equal(typeof entry.primaryProduct.Portions[0].options, typeof Entry.BBQ_SAUCE);
    assert.equal(entry.primaryProduct.Portions[0].options[0].componentCode, Entry.BBQ_SAUCE.componentCode);
    done();
  });
});

describe("#PotatosEntry", () => {
  it("Should have a productsizecode equal to null", (done) => {
    var entry = new PotatosEntry();
    assert.equal(entry.primaryProduct.productSizeCode, null);
    done();
  });
  it("Should have a product code equal to ECBFW", (done) => {
    var entry = new PotatosEntry();
    assert.equal(entry.primaryProduct.productCode, "EOPOT");
    done();
  });
  it("Should have an empty crust array", (done) => {
    var entry = new PotatosEntry();
    assert.equal(entry.primaryProduct.crusts.length, 0);
    done();
  });
  it("Should have a sauce equals to null", (done) => {
    var entry = new PotatosEntry();
    assert.equal(entry.primaryProduct.sauce, null);
    done();
  });
  it("Should have a product code equals to null", (done) => {
    var entry = new PotatosEntry();
    assert.equal(entry.primaryProduct.Portions.productCode, null);
    done();
  });
  it("Should have an empty toppings array", (done) => {
    var entry = new PotatosEntry();
    assert.equal(entry.primaryProduct.Portions[0].toppings.length, 0);
    done();
  });
  it("Should have a barbecue sauce", (done) => {
    var entry = new PotatosEntry();
    assert.equal(typeof entry.primaryProduct.Portions[0].options, typeof Entry.BBQ_SAUCE);
    assert.equal(entry.primaryProduct.Portions[0].options[0].componentCode, Entry.BBQ_SAUCE.componentCode);
    done();
  });
});

describe("#SaladeEntry", () => {
  it("Should have a productsizecode equal to null", (done) => {
    var entry = new SaladeEntry();
    assert.equal(entry.primaryProduct.productSizeCode, null);
    done();
  });
  it("Should have a product code equal to ESCAE", (done) => {
    var entry = new SaladeEntry();
    assert.equal(entry.primaryProduct.productCode, "ESCAE");
    done();
  });
  it("Should have an empty crust array", (done) => {
    var entry = new SaladeEntry();
    assert.equal(entry.primaryProduct.crusts.length, 0);
    done();
  });
  it("Should have a sauce equals to null", (done) => {
    var entry = new SaladeEntry();
    assert.equal(entry.primaryProduct.sauce, null);
    done();
  });
  it("Should have a product code equals to null", (done) => {
    var entry = new SaladeEntry();
    assert.equal(entry.primaryProduct.Portions.productCode, null);
    done();
  });
  it("Should have an empty toppings array", (done) => {
    var entry = new SaladeEntry();
    assert.equal(entry.primaryProduct.Portions[0].toppings.length, 0);
    done();
  });
  it("Should have a caesar sauce", (done) => {
    var entry = new SaladeEntry();
    assert.equal(typeof entry.primaryProduct.Portions[0].options, typeof Entry.CAESAR_SAUCE);
    assert.equal(entry.primaryProduct.Portions[0].options[0].componentCode, Entry.CAESAR_SAUCE.componentCode);
    done();
  });
});
