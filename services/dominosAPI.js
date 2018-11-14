var async = require("async");
var {Product, Ingredient} = require('./DominosMenu/dominosMenu');
var {Pizza, PepperoniPizza, ReinePizza, OrientalePizza, BarbecuePizza, FourCheesePizza, SalmonPizza} = require('./DominosMenu/dominosPizzaMenu');
var {Entry, ChickenWingsEntry, PotatosEntry, SaladeEntry} = require('./DominosMenu/dominosEntryMenu');
var {Drink, CocaColaDrink, CocaColaZeroDrink, FantaDrink, OasisDrink, EvianDrink} = require('./DominosMenu/dominosDrinkMenu');

class DominosAPI {
  constructor(){
    this.clearCookies();
  }

  initPage(callback){
    async.series([
      this.baseRequest.get.bind(null,'https://www.dominos.fr/'),
      this.baseRequest.get.bind(null,'https://commande.dominos.fr/eStore/fr/OrderTimeNowOrLater/Delivery')
    ], (err, httpRequest, body) => {
      if(err || this.getErrorCookie()) return callback(err);
      return callback(err, body);
    });
  }

  getAvailableCities(userInput, callback){
    this.baseRequest.get('https://commande.dominos.fr/eStore/fr/DominosApi/GetSuburbs?name=' +encodeURIComponent(userInput), (err, httpResponse, body) => {
      if(err || this.getErrorCookie()) return callback(err);
      return callback(err, JSON.parse(body));
    });
  }

  getStreetName(userInput, cityName, postalCode, callback){
    this.baseRequest.get('https://commande.dominos.fr/eStore/fr/DominosApi/FindStreets?suburb='+encodeURIComponent(cityName)+'&postCode='+encodeURIComponent(postalCode)+'&name='+encodeURIComponent(userInput)+'&hasPostCodeBeenSelected=true', (err, httpResponse, body) => {
      if(err || this.getErrorCookie()) return callback(err);
      return callback(err, JSON.parse(body));
    });
  }

  isAddressEligible(streetNumber, streetName, postalCode, cityName, callback){
    //Replacing all accents in street name and city name
    //Removing also white space at the beginnig and at the end of the streetName / CityName
    streetName = streetName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    streetName = streetName.trim();
    cityName = cityName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    cityName = cityName.trim();

    this.getAvailableCities(postalCode, (err, availableCities) => {
      if(err || this.getErrorCookie()){
        throw err;
      }
      var cityFound = null;
      for(var availableCity of availableCities){
        if((postalCode) === parseInt(availableCity.PostCode) && cityName.toUpperCase() === availableCity.Name){
          cityFound = availableCity;
          break;
        }
      }
      if(cityFound){
        this.getStreetName(streetName, cityFound.Name, cityFound.PostCode, (err, availableStreets) => {
          if(err || this.getErrorCookie()){
            throw err;
          }
          var streetNameFound = null;
          for(var availableStreet of availableStreets){
            if(availableStreet.Name === streetName.toUpperCase()){
              streetNameFound = availableStreet;
              break;
            }
          }
          if(streetNameFound){
            //Now we should verify that the store is open.
            this.selectDeliveryNow((err, result) => {
              if (err || this.getErrorCookie()) throw err;
              //Let's send back a normalized address
              return callback(err, true, {
                streetNumber : streetNumber,
                streetName : streetName.toUpperCase(),
                postalCode : postalCode,
                cityName : cityName.toUpperCase()
              });
            })
          }else{
            return callback(err, false);
          }
        });
      }else{
        return callback(err, false);
      }
    });
  }

  selectDeliveryNow(callback) {
    this.baseRequest.post("https://commande.dominos.fr/eStore/fr/OrderTimeNowOrLater/ToggleNowLater", {form : {orderNow: true}}, (err, httpResponse, body) => {
      if(err || body !== "true" || this.getErrorCookie()) return callback(new Error("Cannot select delivery now"));
      this.setCookies("deliveryTime=asap", "http://commande.dominos.fr");
      return callback(err, true);
    });
  }

  selectDeliverAfter(callback) {
    this.baseRequest.post("https://commande.dominos.fr/eStore/fr/OrderTimeNowOrLater/ToggleNowLater", {form : {orderNow: false}}, (err, httpResponse, body) => {
      if(err || body !== "false" || this.getErrorCookie()) return callback(new Error("Cannot select delivery after"));
      this.setCookies("deliveryTime=after", "http://commande.dominos.fr");
      return callback(err, true);
    });
  }

  /**
    @requirements : Need to first select a delivery address using isDeliveryPossible
  */
  getOrderTimes(storeId, date, callback) {
    if(!(date instanceof Date)){
      return callback(new TypeError("Should have an instance of Date in parameter"));
    }
    if(!storeId || !Number.isInteger(storeId)){
      return callback(new TypeError("StoreId should be an integer"));
    }
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() -1 );
    yesterday.setHours(23,59,59);
    if(date < yesterday){
      return callback(new Error("Date cannot be anterior"));
    }
    var orderDate;

    orderDate = this.generateOrderDate(date);
    this.baseRequest.post("https://commande.dominos.fr/eStore/fr/OrderTime/GetOrderTimes?storeId=" + storeId + "&orderDate=" + orderDate, {json : true}, (err, httpResponse, body) => {
      if(err || this.getErrorCookie()) return callback(new Error("Cannot get OrderTimes"));
      var orderTimes = body;
      orderTimes.times.shift();
      return callback(err, orderTimes);
    });
  }

  getMyStoreId(){
    var cookies = this.getCookie();
    if(cookies && cookies["commande.dominos.fr"] && cookies["commande.dominos.fr"]["/"] && cookies["commande.dominos.fr"]["/"]["StoreNumber"]) {
      return parseInt(cookies["commande.dominos.fr"]["/"]["StoreNumber"].value);
    }else{
      return null;
    }
  }

  selectDeliveryTime(storeId, deliveryTime, callback) {
    if(!(deliveryTime instanceof Date)){
      return callback(new TypeError("Should have an instance of Date in parameter"));
    }else{
      this.getOrderTimes(storeId, deliveryTime, (err, orderTimes) => {
        if(err || this.getErrorCookie()) return callback(err);
        var storeOpeningTime = new Date(orderTimes.times[0].value + "Z");
        var storeClosingTime = new Date(orderTimes.times[orderTimes.times.length -1].value+ "Z");
        if(deliveryTime < storeOpeningTime || deliveryTime > storeClosingTime){
          return callback(new Error("Time selected out of store opening hours"));
        }else{
          var selectedHour = storeOpeningTime;
          var selectedHourOnlyString = orderTimes.times[0].value;
          for(var orderTime of orderTimes.times){
            if(Math.abs(deliveryTime - new Date(orderTime.value+ "Z")) < Math.abs(deliveryTime - selectedHour)){
              selectedHour = new Date(orderTime.value+ "Z");
              selectedHourOnlyString = orderTime.value;
            }
          }
          var orderDate = this.generateOrderDate(selectedHour);

          this.baseRequest.post("https://commande.dominos.fr/eStore/fr/OrderTime/Submit", {form : {orderDate: orderDate, orderTime : selectedHourOnlyString}},  (err, httpResponse, body) => {
            if(err || this.getErrorCookie()) throw err;
            if(httpResponse.request.uri.path === "/eStore/fr/ProductMenu"){
              return callback(err, selectedHour);
            }else{
              return callback(new Error("Unknow error trying to select delivery time"))
            }
          });

        }
      });
    }
  }

  generateOrderDate(date){
    return "" + ((date.getDate() > 9) ? (date.getDate()) : '0' + date.getDate()) + "" + (((date.getMonth()+1) > 9) ? (date.getMonth()+1) : '0' + (date.getMonth()+1)) + "" + date.getFullYear();
  }

  /**
    @requirements :
    Make sure you send correct address in parameters.
    The addresses should be verified by isAddressEligible first.
  */
  isDominoStoreOpen(streetNumber, streetName, postalCode, cityName, callback) {

    var specialRequest = this.baseRequest.defaults({
      form: {
        "Customer.SuburbSearchString" : postalCode + " " + cityName.toUpperCase(),
        "Customer.StreetNo": streetNumber,
        "Customer.StreetSearchString": streetName.toUpperCase(),
        "Customer.Suburb": cityName.toUpperCase(),
        "Customer.PostCode": postalCode,
        "Customer.Street": streetName.toUpperCase(),
        "Customer.State": "FR"
      }
    });

    specialRequest.post("https://commande.dominos.fr/eStore/fr/CustomerDetails/SpecifyDeliveryAddressWithCustomerDetails", (err, httpResponse, body) => {
      if(err) throw err;
      if(httpResponse.request.uri.path === "/eStore/fr/ProductMenu?serviceMethod=Delivery"){
        //Pizza shop open
        return callback(err, true);
      }else if(httpResponse.request.uri.path === "/eStore/fr/OrderTime?serviceMethod=Delivery"){
        //Pizza shop is closed right now
        return callback(err, false, "SHOP CLOSE");
      }else if (httpResponse.request.uri.path === "/eStore/fr/CustomerDetails/Delivery"){
        //Out of range delivery
        return callback(err, false, "OUT OF RANGE DELIVERY");
      }else{
        throw new Error('Unknow Error');
      }
    });
  }

  isDeliveryPossible(streetNumber, streetName, postalCode, cityName, callback){
    this.isAddressEligible(streetNumber, streetName, postalCode, cityName, (err, addressEligible) => {
      if(err){
        return callback(new Error("Unknow error in isDeliveryPossible"));
      }
      if(addressEligible){
        //Since the adress has been selected, we can now retrieve possible customizations in the menu and store the customizations in the cookies
        this.isDominoStoreOpen(streetNumber, streetName, postalCode, cityName, (err, storeOpen, details) => {
          if(err) return callback(new Error("Unknow error will trying to know if the dominos store was open"));
          async.parallel([
            //this.getPizzaCustomizations.bind(this),
            //this.getEntryCustomizations.bind(this),
            this.getDrinkCustomizations.bind(this)
          ], (err, customizations) => {
            if(err) return callback(new Error("Unknow error will trying to retrieve menu customizations"));
            //var pizzaCustomizations = customizations[0];
            //var entryCustomizations = customizations[1];
            var drinkCustomizations = customizations[0];
            //this.setCookies("pizzaCustomizations=" + Buffer.from(JSON.stringify(pizzaCustomizations)).toString('base64'), "http://commande.dominos.fr");
            //this.setCookies("entryCustomizations=" + encodeURI(JSON.stringify(entryCustomizations)), "http://commande.dominos.fr");
            this.setCookies("drinkCustomizations=" + encodeURI(JSON.stringify(drinkCustomizations)), "http://commande.dominos.fr");

            if(storeOpen){
              return callback(err, true);
            }else{
              return callback(err, false, details);
            }
          }) ;
        });
      }else{
        return callback(err, false);
      }
    });
  }

  getDrinkCustomizations(callback){
    this.getCustomizations("https://commande.dominos.fr/eStore/fr/ProductMenu?menuCode=Menu.Drink", (err, drinkCustomizations) => {
      if(err) throw err;
      var lightDrinkCustomizations = {};
      for(var type in drinkCustomizations){
        lightDrinkCustomizations[type] = {};
        lightDrinkCustomizations[type].Sizes = new Array();
        for(var sizeDetails of drinkCustomizations[type].Sizes){
          lightDrinkCustomizations[type].Sizes.push({Name : sizeDetails.Name, Code : sizeDetails.Code});
        }
      }
      callback(err, lightDrinkCustomizations);
    });
  }

  getEntryCustomizations(callback){
    this.getCustomizations("https://commande.dominos.fr/eStore/fr/ProductMenu?menuCode=Menu.Side", callback);
  }

  getPizzaCustomizations(callback){
    this.getCustomizations("https://commande.dominos.fr/eStore/fr/ProductMenu?menuCode=Menu.Pizza", callback);
  }

  getCustomizations(url, callback){
    this.baseRequest.get(url, (err, httpResponse, body) => {

      if(err) throw err;

      var startingIndex = body.indexOf('define("inMenuCustomizationViewModel",');
      var endingIndex = body.indexOf(');', startingIndex);

      if(startingIndex !== -1 && endingIndex !== -1){
        var customizations = body.substring(startingIndex + 38, endingIndex);
        return callback(err, JSON.parse(customizations));
      }else{
        return callback(new Error("Unknow Error getting the drink customizations"));
      }

    });
  }

  addToOrder(product, quantity, callback){
    if(product instanceof Product && quantity > 0){
      var timestamp = new Date().getTime();
      product.primaryProduct.quantity = quantity;
      if(product instanceof Drink && this.getCookieByName("drinkCustomizations")){
        //As the customizations have been encoded in the cookies, we need to decode then first.
        product.appliCustomizations(JSON.parse(decodeURI(this.getCookieByName("drinkCustomizations"))));
      }
      this.baseRequest.post("https://commande.dominos.fr/eStore/fr/Product/AddToOrder?timestamp="+ timestamp, {body : product, json : true}, (err, httpRequest, body) => {
        if(err || this.getErrorCookie()) throw err;
        this.getBascket(callback);
      });
    }else{
      throw new TypeError("Wrong parameter inputs in AddProduct.");
    }
  }

  getBascket(callback){
    var timestamp = new Date().getTime();
    this.baseRequest.get("https://commande.dominos.fr/eStore/fr/Basket/GetBasketView?timestamp="+timestamp+"&_="+(timestamp+1), (err, httpRequest, body) => {
      if(err || this.getErrorCookie()) throw err;
      var startingIndex = body.indexOf('    <script type="text/javascript">');
      var endingIndex = body.indexOf('    </script>', startingIndex);
      if(startingIndex !== -1 && endingIndex !== -1){
        var bascket = body.substring(startingIndex + 61, endingIndex-131);
        return callback(err, JSON.parse(bascket)[0]);
      }else{
        return callback(new Error("Unknow Error getting the bascket"));
      }
    });
  }

  removeProductFromBascket(productToRemove, callback){
    if(productToRemove instanceof Product){
      var timestamp = new Date().getTime();
      this.baseRequest.get("https://commande.dominos.fr/eStore/fr/Basket/GetBasketView?timestamp="+timestamp+"&_="+(timestamp+1), (err, httpRequest, body) => {
        if(err || this.getErrorCookie()) throw err;
        var endingIndex = body.indexOf('" data-product-code="' + productToRemove.primaryProduct.productCode +'" data-product-quantity');
        var startingIndex = body.lastIndexOf('<div id="basket-', endingIndex);

        if(startingIndex === -1 || endingIndex === -1){
          return callback(new Error("Product you want to delete not found in the bascket."));
        }
        var idProductToDelete = body.substring(startingIndex+16, endingIndex);
        var timestamp = new Date().getTime();
        this.baseRequest.post("https://commande.dominos.fr/estore/fr/Basket/RemoveProductAndGetBasket?orderItemId="+idProductToDelete+" &timestamp="+timestamp, (err, httpResponse, body) => {
          if(err || this.getErrorCookie()) throw err;
          return this.getBascket(callback);
        });
      });
    }else{
      throw new TypeError("Wrong parameter inputs in removeProductFromBascket.");
    }
  }

  getBacketTotalAmount(callback){
    this.getBascket((err, bascket) => {
      if(err || this.getErrorCookie()) throw err;
      var priceNotFormatted = bascket.cart.cartTotal;
      var price = priceNotFormatted.replace(",", ".");
      price = price.replace("€", "");
      price = parseFloat(price);
      callback(err, price);
    });
  }

  checkout(name, phone, email, instructions, paymentMethod, callback) {
    var form = {
      "Customer.Name": name,
      "Customer.Phone": phone,
      "Customer.Email": email,
      "Customer.DeliveryInstructions": instructions,
      "Customer.DontWantToReciveOffers": true,
      "Customer.AcceptedTsAndCs": true,
      //"Customer.AcceptedTsAndCs": false,
      "Customer.State": "FR"
    }

    //Verifying the input parameters
    if((paymentMethod !== "CreditCardLater" && paymentMethod !== "Cash")){
      return callback(new TypeError("Wrong payment method provided during Checkout"));
    }
    if(!validateEmail(email)){
      return callback(new TypeError("Wrong email provided during Checkout"));
    }
    if(!validateFrenchPhone(phone)){
      return callback(new TypeError("Wrong phone provided during Checkout"));
    }
    if(!name){
      return callback(new TypeError("Name is empty during Checkout"));
    }
    if(instructions.length > 250){
      instructions = instructions.substring(0, 250);
    }

    this.getBacketTotalAmount((err, cartTotal) => {
      if(err || this.getErrorCookie()){
        throw err;
      }
      if(cartTotal  < 15){
        return callback(new Error("Order minimum amount should be 15€"));
      }
      this.baseRequest.get("https://commande.dominos.fr/eStore/fr/Checkout", (err, httpResponse, body) => {
        if(err || this.getErrorCookie()){
          if(this.getErrorCookie() === '["Votre commande doit contenir au moins une pizza pour bénéficier de la livraison"]'){
            return callback(new Error("You should have at least one pizza in your bascket"));
          }else{
            throw err;
          }
        }
        var headers = {"accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"};
        this.baseRequest.post("https://commande.dominos.fr/eStore/fr/Checkout/Submit", {form : form, headers : headers}, (err, httpResponse, body) => {
          if(err || this.getErrorCookie()){
            throw err;
          }
          if(httpResponse.request.uri.path === "/eStore/fr/PaymentMethodLookup"){
            this.baseRequest.get("https://commande.dominos.fr/eStore/fr/PaymentMethodLookup/Select?code="+ paymentMethod, (err, httpRequest, body) => {
              if(err || this.getErrorCookie()){
                throw err;
              }
              var stringToFound = '<input name="__RequestVerificationToken" type="hidden" value="';
              var startingIndex = body.indexOf(stringToFound);
              var endingIndex = body.indexOf('" />', startingIndex);
              var verificationToken = body.substring(startingIndex + stringToFound.length, endingIndex);
              return callback(err, verificationToken);
            });
          }else{
            return callback(new Error("Error in the check out process"));
          }
        });
      });
    });
  }

  checkoutConfirmation(orderDateTime, verificationToken, sandbox, callback){

    if(!(orderDateTime instanceof Date) && orderDateTime !== null){
      return callback(new TypeError("checkoutConfirmation needs a proper date in parameter"));
    }
    //13:15, mercredi 11 juillet 2018
    //10:27, mercredi 11 juillet 2018
    var months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "novembre", "decembre"];
    var jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

    var formattedOrderDateTime = (orderDateTime) ? (orderDateTime.getHours() + ":" + orderDateTime.getMinutes() + ", " + jours[orderDateTime.getDay()] + " " + orderDateTime.getDate() + " " + months[orderDateTime.getMonth()] + " " + orderDateTime.getFullYear()) : "Dès que possible";

    var form = {
      orderDateTime : formattedOrderDateTime,
      __RequestVerificationToken : verificationToken
    }

    if(!sandbox){
      this.baseRequest.post("https://commande.dominos.fr/eStore/fr/PaymentConfirmation/DoPayment", {form : form}, (err, httpResponse, body) => {
        if(err || this.getErrorCookie())  throw err;
        console.log("------------");
        console.log(httpResponse.request.uri.path);
        console.log("------------");
        return callback(err, body);
      });
    }else{
      return callback(null, "Everything is fine");
    }
  }

  clearCookies(){
    this.request = require("request");
    this.cookieJar = this.request.jar();
    this.customHeaders = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36',
      'accept': '*/*',
      "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,it-IT;q=0.6,it;q=0.5,es;q=0.4",
      "cache-control": "no-cache",
      "upgrade-insecure-requests": 1,
      "pragma": "no-cache"
    };
    this.requestOptions = {
      headers: this.customHeaders,
      jar : this.cookieJar,
      followAllRedirects : true
    };
    this.baseRequest = this.request.defaults(this.requestOptions);
  }

  getCookie(){
    return this.cookieJar._jar.store.idx;
  }

  getErrorCookie(){
    return this.getCookieByName("ErrorMessages");
  }

  getDeliveryTimeSaved(){
    return (this.getCookieByName("deliveryTime") === "after") ? new date(this.getCookieByName("DruOrderTime") + "Z") : null;
  }

  getCookieByName(name){
    var myCookies = this.getCookie();
    if(myCookies && myCookies["commande.dominos.fr"] && myCookies["commande.dominos.fr"] && myCookies["commande.dominos.fr"]["/"] && myCookies["commande.dominos.fr"]["/"][name])
      return decodeURI(myCookies["commande.dominos.fr"]["/"][name].value);
    else
      return null;
  }

  setCookies(cookieString, uri){
    this.cookieJar.setCookie(cookieString, uri);
  }

  setCookieJar(cookieJarToSet){
    this.cookieJar = cookieJarToSet;
  }

  getCookieJar(){
    return this.cookieJar;
  }

}//End class definition

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateFrenchPhone(phone) {
    var re = /^((\+)33|0)[1-9](\d{2}){4}$/;
    return re.test(String(phone).toLowerCase());
}


exports.DominosAPI = DominosAPI;
exports.validateFrenchPhone = validateFrenchPhone;
