// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const {dialogflow, DeliveryAddress, TransactionRequirements, TransactionDecision, Suggestions, OrderUpdate, DateTime} = require('actions-on-google');
const functions = require('firebase-functions');
var {DominosAPI, validateFrenchPhone} = new require('./../services/dominosAPI');
var dominosAPI = new DominosAPI();
var {Product, Ingredient} = require('./../services/DominosMenu/dominosMenu');
var {Pizza, PepperoniPizza, ReinePizza, OrientalePizza, BarbecuePizza, FourCheesePizza, SalmonPizza} = require('./../services/DominosMenu/dominosPizzaMenu');
var {Entry, ChickenWingsEntry, PotatosEntry, SaladeEntry} = require('./../services/DominosMenu/dominosEntryMenu');
var {Drink, CocaColaDrink, CocaColaZeroDrink, FantaDrink, OasisDrink, EvianDrink} = require('./../services/DominosMenu/dominosDrinkMenu');
var addressParser = require('parse-address');
var async = require('async');

const app = dialogflow({debug: true});

app.middleware((conv) => {
  //Restauring the cookies made by the users.
  dominosAPI.clearCookies();
  var userCookies = conv.data.userCookies;
  if(userCookies){
    Object.keys(userCookies).forEach(function(domain) {
      Object.keys(userCookies[domain]).forEach(function(path) {
        var cookiesToSet =  userCookies[domain][path];
        Object.keys(cookiesToSet).forEach(function(singleCookie) {
          var cookieToSave = cookiesToSet[singleCookie];
          dominosAPI.setCookies(cookieToSave.key + "=" + cookieToSave.value, "http://"+ domain);
        });
      });
    });
  }
});

/*
app.intent('verify_transaction_requirements', (conv) => {
  console.log("verify transaction requirements");
  conv.ask(new TransactionRequirements({
    orderOptions: {
      requestDeliveryAddress: true,
    },
    paymentOptions: {
      googleProvidedOptions: {
        prepaidCardDisallowed: false,
        supportedCardNetworks: ['VISA', 'AMEX'],
        tokenizationParameters: {
          parameters: {},               //Added these field which need to be edited for actual transaction
          tokenizationType: 'PAYMENT_GATEWAY'   //Added these field which need to be edited for actual transaction
        }
      }
    }
  }));
});

app.intent('verify_transaction_requirements_response', (conv) => {
  console.log("verify transaction requirements response");
  const arg = conv.arguments.get('TRANSACTION_REQUIREMENTS_CHECK_RESULT');
  if (arg && arg.resultType !=='OK') {
    // Normally take the user through cart building flow
    //conv.ask("Bienvenue dans l'application Donatello Pizza. Je vais vous accompagner à commander de bonnes pizzas. Pour commencer, il vous suffit de dire, commande-moi une pizza");
    conv.ask("Ah mince, votre compte ne dispose pas de carte bancaire enregistrée.");
    conv.ask("Sachez qu'à la dernière étape, vous serez bloqué. Continuons quand même !");
  }
  var options = {
    addressOptions: {
      reason: "Pour aider le livreur",
    }
  };
  conv.ask(new DeliveryAddress(options));
});
*/

app.intent('ask_for_delivery_address', (conv) => {
  const options = {
    addressOptions: {
      reason: "Pour aider le livreur",
    }
  };
  conv.ask(new DeliveryAddress(options));
});

app.intent('date_time_response', (conv, input, datetime) => {
  return new Promise((resolved, rejected) => {
    if(datetime) {
      //Happen if the user send to complex response like "ce soir"
      if(!datetime.date || !datetime.time){
        const options = {
          prompts: {
            initial: "Désolé mais je n'ai pas bien compris. Pourriez vous être plus précis ? Donnez moi une heure précise.",
            date: 'Quel jour voulez vous être livré ?',
            time: 'A quelle heure précisement ?',
          },
        };
        conv.ask(new DateTime(options));
        resolved();
      }else{
        var { year, month, day } = datetime.date;
        var { hours, minutes } = datetime.time;
        var today = new Date();
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() +1);
        var myStoreId = dominosAPI.getMyStoreId();
        async.parallel([
          dominosAPI.getOrderTimes.bind(dominosAPI, myStoreId, today),
          dominosAPI.getOrderTimes.bind(dominosAPI, myStoreId, tomorrow)
        ], (err, results) => {
          if(err) conv.close("Désolé une erreur s'est produite pendant la selection de votre horaire de livraison. Merci de retenter plus tard. A bientôt !")
          var availableTimesForDelivery ;
          if(results[0].Times.length === 0){
            availableTimesForDelivery = results[1].Times;
          }else{
            availableTimesForDelivery = results[0].Times;
          }

          minutes = (minutes) ? minutes : 0;
          var dateInStringFormat =  "2018-" + ((month > 9) ? month : ('0' + month)) + "-" + ((day > 9) ? day : ('0' + day)) + "T" + ((hours > 9) ? hours : ('0' + hours)) + ":" + ((minutes > 9) ? (minutes) : ('0' + minutes)) + ":00.000Z";
          var selectedDateForDelivery = new Date(dateInStringFormat);

          var openingHour = new Date(availableTimesForDelivery[0].Value + "Z");
          var closingHour = new Date(availableTimesForDelivery[availableTimesForDelivery.length -1].Value + "Z");

          if(selectedDateForDelivery < openingHour || selectedDateForDelivery > closingHour){
            const options = {
              prompts: {
                initial: "Désolé mais la date que vous avez selectionné ne me semble pas bonne. Pourriez-vous en choisir une autre ? En général les pizzerias sont ouvertes vers midi et vers 20h.",
                date: 'Quel jour voulez vous être livré ?',
                time: 'A quelle heure précisement ?',
              },
            };
            conv.ask(new DateTime(options));
            resolved();
          }else{
            dominosAPI.selectDeliveryTime(myStoreId, selectedDateForDelivery, (err, finalDeliveryTime) => {
              if(err) conv.close("Désolé une erreur c'est produite en tantant d'enregistrer votre horaire de livraison. Pourriez-vous réesayer plus tard ? A bientôt !");
              if(finalDeliveryTime.getHours() === selectedDateForDelivery.getHours() && finalDeliveryTime.getMinutes() === selectedDateForDelivery.getMinutes()){
                conv.ask("C'est bon c'est noté ! Vous serez livré vers les coups de " + finalDeliveryTime.getHours() + "h" + finalDeliveryTime.getMinutes() + ".");
              }else{
                conv.ask("C'est bon c'est noté ! Vous serez par contre livré vers les coups de " + finalDeliveryTime.getHours() + "h" + finalDeliveryTime.getMinutes() + ".");
              }
              conv.ask("Pour commencer, et voir le menu, il vous suffit de dire : Quel est le menu ?");
              addSuggestionsForPhones(conv);
              updateCookies(conv);
              resolved();
            });
          }
        });
      }
    } else {
      conv.ask("Ok, n'hésitez pas à revenir nous voir lorsque vous aurez changé d'avis. A bientôt !");
      resolved();
    }
  });
});


app.intent('ask_for_delivery_address_response', (conv, params, userResponse) => {

  return new Promise((resolved, rejected) => {
    if(userResponse.userDecision === "ACCEPTED"){
      let location = userResponse.location;
      // Example of response returned by Google
      //{"postalAddress":{"regionCode":"FR","recipients":["Hachem Elyes"],"postalCode":"78800","locality":"Houilles","addressLines":["6 Place de l'Église","734"]},"phoneNumber":"+33 6 26 77 07 44","notes":"12345"}
      addressParser.parseLocation(location.postalAddress.addressLines[0]);
      var streetNumber = parseInt(addressParser.parseLocation(location.postalAddress.addressLines[0]).number);
      var streetName = location.postalAddress.addressLines[0].replace(streetNumber, "");
      var postalCode = parseInt(location.postalAddress.postalCode);
      var cityName = location.postalAddress.locality;
      var phoneNumber = location.phoneNumber.replace("+33 ", "0").replace(/\s/g, "");
      if(validateFrenchPhone(phoneNumber)){
        async.series([
          dominosAPI.initPage.bind(dominosAPI),
          dominosAPI.isAddressEligible.bind(dominosAPI, streetNumber, streetName, postalCode, cityName)
        ], (err, results) => {
          if(err){
            conv.close("Une erreur c'est produite en essayant de récupérer votre adresse. Pourriez-vous vérifier que vous l'avez bien renseigné et revenir nous voir plus tard ? A bientot");
          }else{

            var deliveryPossible = results[1][0];
            var storeOpen = results[2];
            if(deliveryPossible){
              var normalizedAddress = results[1][1];
              streetNumber = normalizedAddress.streetNumber;
              streetName = normalizedAddress.streetName;
              postalCode = normalizedAddress.postalCode;
              cityName = normalizedAddress.cityName;

              //Saving the delivery address for later use.
              conv.data.address = {
                streetNumber : streetNumber,
                streetName : streetName,
                postalCode : postalCode,
                cityName : cityName,
                recipients : location.postalAddress.recipients.join(),
                phoneNumber : phoneNumber,
                instructions : "Mon adresse complète : " + location.postalAddress.addressLines.join("\n") + ".\n" + location.notes
              }

              dominosAPI.isDominoStoreOpen(streetNumber, streetName, postalCode, cityName, (err, storeOpen) => {
                if(err){
                  conv.close("Une erreur c'est produite en essayant de récupérer votre adresse. Pourriez-vous vérifier que vous l'avez bien renseigné et revenir nous voir plus tard ? A bientot");
                }
                if(storeOpen){
                  conv.ask("Super ! Je viens de trouver une très bonne pizzeria près de chez vous. Commençons ! Pour connaitre les pizzas disponibles, il vous suffit de dire : 'Quel est le menu ?'");
                }else{
                  //Mettre ici le code pour le delivery plus tard.
                  const options = {
                    prompts: {
                      initial: 'A cette heure ci, les pizzerias sont fermées. A quelle heure souhaitez-vous être livré ?',
                      date: 'Quel jour voulez vous être livré ?',
                      time: 'A quelle heure ?',
                    },
                  };
                  conv.ask(new DateTime(options));
                }
                addSuggestionsForPhones(conv);
                updateCookies(conv);
                resolved();
              });
            }else{
              conv.close("Malheureusement nous n'avons pas de pizzeria partenaire dans votre ville. Nous tentons d'elargir chaque jour notre réseau. Peut-être que si vous revenez dans quelques semaines ce sera bon. A bientot");
              resolved();
            }
          }
        });
      }else{
        conv.close("Je suis désolé mais le numéro de téléphone que vous avez renseigné sur l'application Google Home semble ne pas être correct. Il vous en faut un valide afin que le livreur puisse vous contacter. Pourriez-vous corriger votre saisie et revenir nous voir plus tard ? A bientot");
        resolved();
      }
    }else{
      //user has not accepted to give his address.
      conv.close("Malheureusement sans votre adresse je ne pourrais pas vous livrer. Revenez nous voir si vous changez d'avis. A bientot !");
      resolved();
    }
  });
});

app.intent('GetBascket', (conv) => {
  return new Promise((resolved, rejected) => {
    dominosAPI.getBascket((err, bascket) => {
      if(err){
        conv.ask("Désolé mais une erreur est survenu lors de la récupération de votre panier. Que puis-je faire d'autre pour vous ?");
      }else{
        var allProductMessage = "";
        for(var product of bascket.cart.products){
          allProductMessage += getWritableQuantity(product.quantity) + " " + extractProductCategory(product.category) + " " + product.name + ", ";
        }
        conv.ask("Votre panier s'elève à "+ getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€.");
        if(allProductMessage !== ""){
          conv.ask("Il comprend : "+ allProductMessage + ". Que puis-je faire d'autre pour vous ?");
        }else{
          conv.ask("Que puis-je faire d'autre pour vous ?");
          addSuggestionsForPhones(conv);
        }
        updateCookies(conv);
      }
      resolved();
    });
  });
});

app.intent('addPizza', (conv) => {
  console.log("addPizza");
  return new Promise((resolved, rejected) => {
    var crust;
    var size;
    var pizza;
    var quantity = conv.parameters["quantity"];
    var messageToReturn ;

    //Verifying that the user did not cancelled the request
    if(conv.parameters["Pizza-Crust"] && conv.parameters["Pizza-Size"] && conv.parameters["Pizza-Type"] && quantity){
      switch(conv.parameters["Pizza-Crust"]){
        case "Fine" :
        crust = Pizza.FINE_CRUST;
        break;
        case "Classique" :
        crust = Pizza.CLASSIQUE_CRUST;
        break;
      }
      switch(conv.parameters["Pizza-Size"]){
        case "Grande" :
        size = Pizza.SIZE_LARGE;
        break;
        case "Moyenne" :
        size = Pizza.SIZE_MEDIUM;
        break;
      }
      switch(conv.parameters["Pizza-Type"]){
        case "Pizza Reine" :
        pizza = new ReinePizza(size, crust);
        messageToReturn = "Bien, je viens d'ajouter à votre panier " + getWritableQuantity(quantity) + " pizza Reine.";
        break;
        case "Pizza Pepperoni" :
        pizza = new PepperoniPizza(size, crust);
        messageToReturn = "Bien, je viens d'ajouter à votre panier " + getWritableQuantity(quantity) + " pizza Pepperoni.";
        break;
        case "Pizza Orientale" :
        pizza = new OrientalePizza(size, crust);
        messageToReturn = "J'ajoute " + getWritableQuantity(quantity) + " pizza Orientale à votre panier.";
        break;
        case "Pizza Barbecue" :
        pizza = new BarbecuePizza(size, crust);
        messageToReturn = "Bon choix ! J'ajoute " + getWritableQuantity(quantity) + " pizza barbecue.";
        break;
        case "Pizza 4 fromages" :
        pizza = new FourCheesePizza(size, crust);
        messageToReturn = "Vous venez d'ajouter " + getWritableQuantity(quantity) + " pizza 4 fromages. Vous êtes un gourmant dis-donc !";
        break;
        case "Pizza Saumon" :
        pizza = new SalmonPizza();
        messageToReturn = "J'aurais choisi la même pizza. Je rajoute donc " + getWritableQuantity(quantity) + " pizza saumon.";
        break;
      }

      if(pizza){
        dominosAPI.addToOrder(pizza, quantity, (err, bascket) => {
          if(err) {
            conv.close("Une erreur c'est produite en ajoutant une pizza à votre panier. Merci de revenir plus tard. A bientot");
          }else{
            conv.ask(messageToReturn);
            conv.ask("Votre panier s'élève maintenant à " + getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€. Que puis-je faire de plus pour vous ?");
          }
          addSuggestionsForPhones(conv);
          updateCookies(conv);
          resolved();
        });
      }else{
        conv.ask("Je ne suis pas sur d'avoir compris le type de pizza que vous souhaitez ajouter. Pourriez-vous reformuler ?");
        addSuggestionsForPhones(conv);
        updateCookies(conv);
        resolved();
      }
    }else{
      //The user has cancelled the request
      console.log("The user has cancelled the request");
      updateCookies(conv);
      resolved();
    }
  });
});

app.intent('removePizza', (conv) => {
  console.log("removePizza");
  return new Promise((resolved, rejected) => {

    var crust = Pizza.FINE_CRUST;
    var size = Pizza.SIZE_MEDIUM;
    var pizza;
    var messageToReturn ;
    //Verifying that the user did not cancelled the request
    if(conv.parameters["Pizza-Type"]){
      switch(conv.parameters["Pizza-Type"]){
        case "Pizza Reine" :
        pizza = new ReinePizza(size, crust);
        messageToReturn = "Bien, je viens de supprimer de votre panier les pizzas Reines.";
        break;
        case "Pizza Pepperoni" :
        pizza = new PepperoniPizza(size, crust);
        messageToReturn = "Ok, je viens de supprmier de votre panier les pizzas Pepperonis.";
        break;
        case "Pizza Orientale" :
        pizza = new OrientalePizza(size, crust);
        messageToReturn = "Je retire les pizzas Orientales à votre panier.";
        break;
        case "Pizza Barbecue" :
        pizza = new BarbecuePizza(size, crust);
        messageToReturn = "Comme vous le sentez ! Je retire les pizzas barbecues.";
        break;
        case "Pizza 4 fromages" :
        pizza = new FourCheesePizza(size, crust);
        messageToReturn = "Vous venez de supprmier les pizzas 4 fromages. Vous faites un régime ?";
        break;
        case "Pizza Saumon" :
        pizza = new SalmonPizza();
        messageToReturn = "Dommage c'était ma pizza préféré. J'enlève donc les pizzas saumons.";
        break;
      }
      if(pizza){
        dominosAPI.removeProductFromBascket(pizza, (err, bascket) => {
          if(err){
            if(err.message === "Product you want to delete not found in the bascket."){
              conv.ask("Désolé mais vous n'avez pas de " + conv.parameters["Pizza-Type"] + " dans votre panier. Que puis-je faire de plus pour vous ?");
            }else{
              conv.close("Désolé mais une erreur est survenue pendant la suppression de votre pizza. Essayez de revenir plus tard.");
            }
          }else{
            conv.ask(messageToReturn);
            conv.ask("Votre panier s'élève maintenant à " + getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€. Que puis-je faire de plus pour vous ?");
          }
          addSuggestionsForPhones(conv, ['Supprimer une entrée', 'Supprimer une pizza', 'Supprimer une boisson', 'Voir mon panier', 'Valider ma commande']);
          updateCookies(conv);
          resolved();
        });
      }else{
        conv.ask("Je ne suis pas sur d'avoir compris le type de pizza que vous souhaitez supprimer. Pourriez-vous reformuler ?");
        addSuggestionsForPhones(conv, ['Supprimer une entrée', 'Supprimer une pizza', 'Supprimer une boisson', 'Voir mon panier', 'Valider ma commande']);
        updateCookies(conv);
        resolved();
      }
    }else{
      //The user has cancelled the request
      console.log("The user has cancelled the request");
      updateCookies(conv);
      resolved();
    }
  });
});

app.intent('addEntry', (conv) => {
  console.log("addEntry");
  return new Promise((resolved, rejected) => {
    var entry;
    var quantity = conv.parameters["quantity"];
    var message ;
    //Verifying that the user did not cancelled the request
    if(conv.parameters["quantity"] && conv.parameters["Entry-Type"]){
      switch(conv.parameters["Entry-Type"]){
        case "Potatos" :
        entry = new PotatosEntry();
        message = "J'ajoute des potatos à votre panier. C'est un bon choix pour compléter une petite faim."
        break;
        case "Chicken Wings" :
        entry = new ChickenWingsEntry();
        message = "Miam Miam des chicken wings! Je m'en leche dèjà les doigts. Je vous le rajoute à votre panier."
        break;
        case "Salade Caesar" :
        entry = new SaladeEntry();
        message = "Bon choix! Moi aussi à votre place je ferais un régime."
        break;
      }
      if(entry){
        dominosAPI.addToOrder(entry, quantity, (err, bascket) => {
          if(err){
            conv.close("Désolé mais une erreur est survenue pendant l'ajout d'une entrée. Essayez de revenir plus tard.")
          }else{
            conv.ask(message);
            conv.ask("Votre panier s'élève maintenant à " + getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€. Que puis-je faire de plus pour vous ?");
          }
          addSuggestionsForPhones(conv);
          updateCookies(conv);
          resolved();
        });
      }else{
        conv.ask("Je ne suis pas sur d'avoir compris le type d'entrée que vous souhaitez ajouter. Pourriez-vous reformuler ?");
        addSuggestionsForPhones(conv);
        updateCookies(conv);
        resolved();
      }
    }else{
      //The user has cancelled the request
      console.log("The user has cancelled the request");
      updateCookies(conv);
      resolved();
    }
  });
});

app.intent('removeEntry', (conv) => {
  console.log("removeEntry");
  return new Promise((resolved, rejected) => {
    var entry;
    var message ;
    //Making sure the user did not cancel the request
    if(conv.parameters["Entry-Type"]){
      switch(conv.parameters["Entry-Type"]){
        case "Potatos" :
        entry = new PotatosEntry();
        message = "Je suprimme les potatos à votre panier. C'est peut-être plus sage comme cela. Je serais vous je les remplacerais par une salade."
        break;
        case "Chicken Wings" :
        entry = new ChickenWingsEntry();
        message = "Dommage j'adorais les chicken wings! Je les enlève de votre panier."
        break;
        case "Salade Caesar" :
        entry = new SaladeEntry();
        message = "Et pourtant vous en auriez bien besoin de cette salade! De toute facon on m'écoute jamais alors. Je supprime donc de votre panier..."
        break;
      }
      if(entry){
        dominosAPI.removeProductFromBascket(entry, (err, bascket) => {
          if(err){
            if(err.message === "Product you want to delete not found in the bascket."){
              conv.ask("Désolé mais vous n'avez pas de " + conv.parameters["Entry-Type"] + " dans votre panier. Que puis-je faire de plus pour vous ?");
            }else{
              conv.close("Désolé mais une erreur est survenue pendant la suppression de l'entrée. Essayez de revenir plus tard.")
            }
          }else{
            conv.ask(message);
            conv.ask("Votre panier s'élève maintenant à " + getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€. Que puis-je faire de plus pour vous ?");
          }
          addSuggestionsForPhones(conv, ['Supprimer une entrée', 'Supprimer une pizza', 'Supprimer une boisson', 'Voir mon panier', 'Valider ma commande']);
          updateCookies(conv);
          resolved();
        });
      }else{
        conv.ask("Je ne suis pas sur d'avoir compris le type d'entrée que vous souhaitez supprimer. Pourriez-vous reformuler ?");
        addSuggestionsForPhones(conv, ['Supprimer une entrée', 'Supprimer une pizza', 'Supprimer une boisson', 'Voir mon panier', 'Valider ma commande']);
        updateCookies(conv);
        resolved();
      }
    }else{
      //The user has cancelled the request
      console.log("The user has cancelled the request");
      updateCookies(conv);
      resolved();
    }
  });
});

app.intent("addDrink", (conv) => {
  console.log("addDrink");
  return new Promise((resolved, rejected) => {
    var drink;
    var quantity = conv.parameters["quantity"];
    var size = conv.parameters["Drink-Size"];
    var message;
    //Verifying that the user did not cancelled the request
    if(quantity && conv.parameters["Drink-Type"] && size){
      switch(conv.parameters["Drink-Type"]){
        case "CocaCola" :
        drink = new CocaColaDrink(size);
        message = "Je rajoute " + getWritableQuantity(quantity) + " CocaCola à votre panier. Je serais vous je rajouterai deux, trois glaçons et une tranche de citron."
        break;
        case "CocaCola Zero" :
        drink = new CocaColaZeroDrink(size);
        message = "Ma maman elle dit que le Coca Zero c'est pas du vrai Coca! Moi c'est mon coca préféré. J'en rajoute " + getWritableQuantity(quantity) + " à votre panier."
        break;
        case "Oasis" :
        drink = new OasisDrink(size);
        message = "Très bon choix. Je rajoute " + getWritableQuantity(quantity) + " Oasis à votre panier..."
        break;
        case "Fanta" :
        drink = new FantaDrink(size);
        message = "Fanta, Fanta, ca me rappelle mon enfance ça... J'ajoute " + getWritableQuantity(quantity) + " Fanta à votre panier..."
        break;
        case "Evian" :
        drink = new EvianDrink();
        message = "L'eau c'est vraiment la meilleur boisson. Je vous rajoute " + getWritableQuantity(quantity) + " bouteille d'eau de 50CL à votre panier..."
        break;
      }
      if(drink){
        dominosAPI.addToOrder(drink, quantity, (err, bascket) => {
          if(err){
            conv.close("Désolé mais une erreur est survenue pendant l'ajout d'une boisson. Essayez de revenir plus tard.")
          }else{
            conv.ask(message);
            conv.ask("Votre panier s'élève maintenant à " + getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€. Que puis-je faire de plus pour vous ?");
          }
          addSuggestionsForPhones(conv);
          updateCookies(conv);
          resolved();
        });
      }else{
        conv.ask("Je ne suis pas sur d'avoir compris le type de boisson que vous souhaitez ajouter. Pourriez-vous reformuler ?");
        addSuggestionsForPhones(conv);
        updateCookies(conv);
        resolved();
      }
    }else{
      //The user has cancelled the request
      console.log("The user has cancelled the request");
      updateCookies(conv);
      resolved();
    }
  });
});

app.intent("removeDrink", (conv) => {
  console.log("removeDrink");
  return new Promise((resolved, rejected) => {
    var drink;
    var message ;
    //Making sure the user did not cancel the request
    console.log(conv.parameters["Drink-Type"]);
    if(conv.parameters["Drink-Type"]){
      switch(conv.parameters["Drink-Type"]){
        case "CocaCola" :
        drink = new CocaColaDrink(Drink.CAN_SIZE);
        message = "Je suprimme le Cocacolas à votre panier. C'est peut-être plus sage comme cela. Je serais vous je le remplacerais par une bouteille d'eau."
        break;
        case "CocaCola Zero" :
        drink = new CocaColaZeroDrink(Drink.CAN_SIZE);
        message = "Dommage le Coca zero c'était parfait pour votre régime! Je l'enlève de votre panier."
        break;
        case "Oasis" :
        drink = new OasisDrink(Drink.CAN_SIZE);
        message = "Dommage c'était ma boisson préféré! De toute facon on m'écoute jamais... Je supprime donc de votre panier..."
        break;
        case "Fanta" :
        drink = new FantaDrink(Drink.CAN_SIZE);
        message = "Ok! Je supprime donc le Fanta de votre panier..."
        break;
        case "Evian" :
        drink = new EvianDrink();
        message = "Vous avez peur de rouiller en buvant de l'eau ? Je supprime l'eau donc de votre panier..."
        break;
      }
      if(drink){
        dominosAPI.removeProductFromBascket(drink, (err, bascket) => {
          if(err){
            if(err.message === "Product you want to delete not found in the bascket."){
              conv.ask("Désolé mais vous n'avez pas de " + conv.parameters["Drink-Type"] + " dans votre panier. Que puis-je faire de plus pour vous ?");
            }else{
              conv.close("Désolé mais une erreur est survenue pendant la suppression de la boisson. Essayez de revenir plus tard.")
            }
          }else{
            conv.ask(message);
            conv.ask("Votre panier s'élève maintenant à " + getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€. Que puis-je faire de plus pour vous ?");
          }
          addSuggestionsForPhones(conv, ['Supprimer une entrée', 'Supprimer une pizza', 'Supprimer une boisson', 'Voir mon panier', 'Valider ma commande']);
          updateCookies(conv);
          resolved();
        });
      }else{
        conv.ask("Je ne suis pas sur d'avoir compris le type de boisson que vous souhaitez supprimer. Pourriez-vous reformuler ?");
        addSuggestionsForPhones(conv, ["Supprimer une pizza", "Supprimer une boisson", "Supprimer une entrée"]);
        updateCookies(conv);
        resolved();
      }
    }else{
      //The user has cancelled the request
      console.log("The user has cancelled the request");
      updateCookies(conv);
      resolved();
    }
  });
});

app.intent('checkout', (conv) => {
  return new Promise((resolved, rejected) => {
    var name = conv.data.address.recipients;
    var phone = conv.data.address.phoneNumber;
    var email = "freezerhm@yahoo.fr";
    var instructions = conv.data.address.instructions + ".\n" + conv.parameters["instructions"];
    var paymentMethod = conv.parameters["Payment-Method"];
    //Verifying that we have all the necessary parameters.
    if(paymentMethod){
      async.series([
        dominosAPI.getBascket.bind(dominosAPI),
        dominosAPI.checkout.bind(dominosAPI, name, phone, email, instructions, paymentMethod)
      ], (err, results) => {
        var bascket;
        if(err){
          if(err.message === "Order minimum amount should be 15€"){
            bascket = results[0];
            conv.ask("Le montant minimum avant de pouvoir valider une commande est de 16.5€. Pour le moment, il s'élève à : " + getBasketPriceIncludingFees(bascket.cart.cartTotal) + "€");
            conv.ask("Et si vous rajoutiez une entrée ou une boisson ? Il vous suffit de dire : Ajouter une entrée ou Ajouter une boisson");
          }else if(err.message === "You should have at least one pizza in your bascket"){
            conv.ask("Il vous faut ajouter au moins une pizza à votre panier avant de pouvoir valider votre commande.");
            conv.ask('Pour ajouter une pizza, il vous suffit de dire : "Ajouter une pizza".');
          }else{
            conv.close("Une erreur c'est produite pendant la validation de votre commande. Pourriez-vous réessayer plus tard ? A bientôt !");
            console.log(err);
          }
          updateCookies(conv);
          resolved();
        }else{
          bascket = results[0];
          var verificationToken = results[1];
          conv.data.verificationToken = verificationToken;
          console.log("is sandbox = " + conv.sandbox);
          var proposedOrder = buildOrderFromBasket(bascket);
          conv.ask(new TransactionDecision({
            orderOptions: {
              requestDeliveryAddress: false,
            },
            paymentOptions: {
              googleProvidedOptions: {
                prepaidCardDisallowed: false,
                supportedCardNetworks: ['VISA', 'AMEX'],
                tokenizationParameters: {
                  parameters:{
                    "gateway": "stripe",
                    "stripe:publishableKey": (conv.sandbox ? "pk_test_PR2T7MRbVRAy5VTdRuQCXmLm" : "pk_live_lMc0FLwb5qGCqsaQUWo19JF8"),
                    "stripe:version": "2018-05-21"
                  },
                  tokenizationType: "PAYMENT_GATEWAY"
                }
              }
            },
            proposedOrder: proposedOrder
          }));
        }
        updateCookies(conv);
        resolved();
      });
    }else{
      //The user has cancelled the request
      console.log("The user has cancelled the request");
      resolved();
    }
  });
});

app.intent('checkout_response', (conv) => {

  return new Promise((resolved, rejected) => {
    console.log("checkout reponse");
    const arg = conv.arguments.get('TRANSACTION_DECISION_VALUE');
    if (arg && arg.userDecision ==='ORDER_ACCEPTED') {

      dominosAPI.checkoutConfirmation(dominosAPI.getDeliveryTimeSaved(), conv.data.verificationToken, conv.sandbox, (err, result) => {
        if(err){
          conv.close("Une erreur s'est produite pendant la validation de votre commande. Aucun prélèvement n'a été effectué !");
        }else{
          const finalOrderId = arg.order.finalOrder.id;
          // Confirm order and make any charges in order processing backend
          // If using Google provided payment instrument:
          // const paymentDisplayName = arg.order.paymentInfo.displayName;
          conv.ask(new OrderUpdate({
            actionOrderId: finalOrderId,
            orderState: {
              label: 'Order created',
              state: 'CONFIRMED',
            },
            lineItemUpdates: {},
            updateTime: new Date().toISOString(),
            receipt: {
              confirmedActionOrderId: "Donatello_PIZZA" + finalOrderId,
            },
            // Replace the URL with your own customer service page
            orderManagementActions: [
              {
                button: {
                  openUrlAction: {
                    url: 'http://example.com/customer-service',
                  },
                  title: 'Customer Service',
                },
                type: 'CUSTOMER_SERVICE',
              },
            ],
            userNotification: {
              text: 'Commande chez Donatello Pizza effectuée.',
              title: 'Commande effectuée',
            },

          }));
          conv.close("Votre commande a bien été prise en compte. Vous devriez recevoir votre commande dans environs 30 minutes. J'ai été ravie de vous aider à commander votre pizza. N'hésitez pas à revenir me voir dès que vous aurez une petite faim. A bientôt !");
          //Clearing cookies for being able to do a new order.
          dominosAPI.clearCookies();
          conv.data.userCookies = null;
        }
        updateCookies(conv);
        resolved();
      });
    }else{
      conv.ask("Ok, j'imagine que vous souhaitez modifier votre commande avant de la valider. Que puis-je faire pour vous ?");
      updateCookies(conv);
      resolved();
    }
  });
});

var buildOrderFromBasket = (bascket) => {

  var generatePriceOrderDescription = (price, type) => {
    var priceUnits = parseInt(price);
    var priceNanos = (parseFloat(price) % 1).toFixed(9)*1000000000;
    return {
      amount: {
        currencyCode: 'EUR',
        nanos: priceNanos,
        units: priceUnits
      },
      type: type
    }
  };
  var generateLineItem = (id, name, quantity, price, priceType, note, type) => {
    var lineItem = {
      name: name,
      id: id,
      price: generatePriceOrderDescription(price, priceType),
      quantity: quantity,
      subLines: [
        {
          note: note,
        },
      ],
      type: type,
    } ;

    if(!quantity){
      delete lineItem.quantity;
    }
    if(!note){
      delete lineItem.subLines;
    }
    return lineItem;
  };

  var lineItems = [];
  var subTotal = 0;
  for(var product of bascket.cart.products){
    var priceWithoutVAT = ((parseFloat(product.price)/product.quantity) * 0.1);
    console.log(product);
    lineItems.push(generateLineItem(product.name, product.id, product.quantity, priceWithoutVAT, "ACTUAL", product.category + " " + product.variant + " " + product.sauce, "REGULAR"));
    subTotal += priceWithoutVAT;
  }

  var vatTaxRate = 0.196;
  var vat = subTotal * vatTaxRate;
  var totalPrice = subTotal + vat;

  var randomId = Math.floor(Math.random() * 1000) + 1 ;
  var orderId = randomId + "_" + new Date().getTime();
  console.log(JSON.stringify(lineItems));
  console.log("normal order ID" + orderId);

  const order = {
    id: orderId,
    cart: {
      merchant: {
        id: 'Donatello Pizza on Google Assistant',
        name: 'Donatello Pizza',
      },
      lineItems: lineItems,
      notes: 'Votre panier. Seul 10% sont à réglé maintenant',
      otherItems: [
        generateLineItem("subtotal", "Subtotal", null, subTotal, "ESTIMATE", null, "SUBTOTAL"),
        generateLineItem("tax", "Tax", null, vat, "ESTIMATE", null, "TAX"),
      ],
    },
    totalPrice: generatePriceOrderDescription(totalPrice, "ESTIMATE")
  };

  return order;
};

var updateCookies = (conv) => {
  conv.data.userCookies = dominosAPI.getCookie();
}

var getWritableQuantity = (quantity) => {
  return (quantity === 1) ? "une" : quantity;
}

var getBasketPriceIncludingFees = (bascketOriginalPrice) => {
  var priceClean = parseFloat(bascketOriginalPrice.replace("€", "").replace(",","."));
  return (priceClean * 1.1).toFixed(2);
}

var addSuggestionsForPhones = (conv, suggestions) => {
  if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    var suggestionsToSend = (suggestions) ? suggestions : ['Ajouter une Pizza', 'Ajouter une entrée', 'Ajouter une boisson', 'Voir mon panier', 'Voir le menu', 'Valider ma commande'];
    conv.ask(new Suggestions(suggestionsToSend));
  }
}

var extractProductCategory = (productCategory) => {
  var indexOfPoint = productCategory.indexOf(".");
  var category = productCategory.substring(indexOfPoint+1, productCategory.length);
  switch(category){
    case "Drink" :
    category = "Boisson";
    break;
    case "side" :
    category = "Entrée"
    break;
  }
  return category;
}

module.exports = app;
