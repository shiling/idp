/*
 * CONTROLLERS
 */
app.controller('identityController', function($scope, $http, identityService) {
    $scope.loginForm = {
        username: null,
        password: null,
        errors: null
    };

    $scope.init = function() {
    };

    $scope.login = function(previousUrl) {
        identityService.login($scope.loginForm.username, $scope.loginForm.password, function(success, errors) {
            if (success) {
                window.location.href = 'index.html';
            } else {
                $scope.loginForm.errors = errors;
            }
        });
    };

    $scope.username = function() {
        return identityService.username();
    };

    $scope.isAuthenticated = function() {
        return identityService.isAuthenticated();
    };

});

app.controller('searchController', function($scope, filtersService, searchService) {
    $scope.searchService = searchService;
    $scope.filtersService = filtersService;

    $scope.init = function() {
    };
    
    $scope.dissect = function(){
        var terms = $scope.searchService.name.split(" ");
        var filters = [];
        $.each(terms, function(index, term){
            if(term.charAt(0) === "#"){ //find filter terms
                term = term.substring(1,term.length);   //remove #
                if($scope.filtersService.filtersDictionary){
                    var filter = $scope.filtersService.filtersDictionary[term];
                    if(filter){
                        filters.push(filter);
                    }
                }
            }
        });
        $scope.searchService.filters = filters;
    };
    
    $scope.getAppliedFilters = function() {
        return $scope.searchService.filters;
    };

    $scope.applyFilter = function(filter){
        $scope.searchService.filters.push(filter);
        $scope.searchService.name += " #" + filter;
    };
    
    $scope.removeFilter = function(filter){
        var index = $scope.searchService.filters.indexOf(filter);
        if(index !== -1){
            $scope.searchService.filters.splice(index,1);
        }
        var terms = $scope.searchService.name.split(" ");
        $scope.searchService.name = '';
        $.each(terms, function(index, term){
            if(term.charAt(0) !== "#"){
                $scope.searchService.name += term + " ";
            }
        });
        $.each($scope.searchService.filters, function(index, filter){
            $scope.searchService.name += "#" + filter + " ";
        });
    };
    
    $scope.toggleFilter = function(filter){
        if($scope.isApplied(filter)){
            $scope.removeFilter(filter);
        }else{
            $scope.applyFilter(filter);
        }
    };
    
    $scope.isApplied = function(filter){
        return $scope.searchService.filters.indexOf(filter) !== -1;
    };
    
});

app.controller('categoriesController', function($scope, $http, categoriesService, searchService) {
    $scope.categories = []; //array of class Category
    $scope.subcategories = [];
    $scope.searchService = searchService;

    $scope.init = function() {
        //get categories data
        categoriesService.async().then(function(data) {
            $scope.categories = data;
        });
        //
        if($scope.searchService.category){
            $scope.subcategories = $scope.searchService.category.subcategories;
        }
    };

    $scope.selectCategory = function(category) {
        $scope.searchService.category = category;
        $scope.searchService.subcategory = null;
        //$scope.searchService.save();
        if($scope.searchService.category) $scope.subcategories = $scope.searchService.category.subcategories;
    };

    $scope.isActiveCategory = function(category) {
        if(!$scope.searchService.category && !category) {
            return true;
        }
        if($scope.searchService.category && category && $scope.searchService.category.name === category.name) {
            return true;
        }
        return false;
    };

    $scope.selectSubcategory = function(subcategory) {
        $scope.searchService.subcategory = subcategory;
        //$scope.searchService.save();
    };

    $scope.isActiveSubcategory = function(subcategory) {
        if(!$scope.searchService.subcategory && !subcategory) {
            return true;
        }
        if($scope.searchService.subcategory && subcategory && $scope.searchService.subcategory.name === subcategory.name) {
            return true;
        }
        return false;
    };
});

app.controller('productsController', function($scope, webStorage, productsService, searchService, filtersService) {
    $scope.productsMap;    //hashmap of class Product
    $scope.products = [];   //array of class Product
    $scope.cart;    //class Cart
    $scope.searchService = searchService;
    $scope.favourites = []; //array of product names

    $scope.init = function() {
        //get product data
        productsService.async().then(function(data) {
            //get products as hashmap
            $scope.productsMap = data;
            //create copy of products as array
            $.each($scope.productsMap, function(productName, product) {
                $scope.products.push(product);
            });
        });

        //get cart from localstorage
        if (webStorage.get("cart") === null) {
            webStorage.add("cart", new Cart());
        }
        $scope.cart = Cart.cast(webStorage.get("cart"));  //convert object to Cart

        //get fav from localstorage
        if (webStorage.get("favourites") === null) {
            webStorage.add("favourites", []);
        }
        $scope.favourites = webStorage.get("favourites");  //get fav from local storage
        
    };

    $scope.productFilter = function(product) { 
        var show = true;
        //not in applied category
        if (searchService.category && product.categories.indexOf(searchService.category.name) === -1) {
            show = false;
        }
        //not in applied subcategory
        else if (searchService.subcategory && product.categories.indexOf(searchService.subcategory.name) === -1) {
            show = false;
        }
        else{
            //name does not match
            if (searchService.name) {
                //&& !product.name.toLowerCase().match(searchService.name.toLowerCase())
                var productName = product.name.toLowerCase();
                var searchtext = searchService.name.toLowerCase();
                var terms = searchtext.split(" ");
                $.each(terms, function(index, term){
                    if(term.charAt(0) !== '#'){ //ignore filter terms
                        if(!productName.match(term)){ 
                            show = false;
                            return false;   //break out of $.each
                        }
                    }
                });
            }
            //not in applied filter
            if(searchService.filters.length > 0){
                $.each(searchService.filters, function(index, filter) {
                    if (product.filters.indexOf(filter) === -1) {
                        show = false;
                        return false;   //break out of $.each
                    }
                });
            }
        }
        $scope.$emit('refresh');
        return show;
    };

    //UPDATE CART
    $scope.updateQuantity = function(product, quantity) {   //args[0] must be class Product, args[1] must be integer
        $scope.cart.updateQuantity(product, quantity);
        webStorage.add("cart", $scope.cart);   //update localstorage
    };

    $scope.validateQuantity = function(product) {   //args[0] must be class Product
        quantity = $scope.getQuantity(product); //may not be an non-zero integer
        $scope.updateQuantity(product, quantity);   //pass to updateQuantity function for validation
        webStorage.add("cart", $scope.cart);   //update localstorage
    };

    $scope.getQuantity = function(product) {    //args[0] must be class Product
        if ($scope.cart && product) {
            return $scope.cart.getQuantity(product);
        }
    };

    $scope.checkout = function(location) {
        if (!$scope.cart.isEmpty()) {  //proceed if cart has items
            if (!webStorage.get("currentOrder")) {    //create currentOrder if doesn't exist
                webStorage.add("currentOrder", new Order($scope.username));
            }
            var currentOrder = $.extend(new Order, webStorage.get("currentOrder")); //convert object to Order
            currentOrder.items = $scope.cart.items; //add items from cart
            currentOrder.subscriptions = $scope.cart.subscriptions; //add subscriptions from cart
            webStorage.add("currentOrder", currentOrder);   //update currentOrder

            //go to next page
            window.location.href = location;
        }
    };

    $scope.getFavProducts = function() {
        var favProducts = [];
        $.each($scope.favourites, function(index, productName) {
            favProducts.push($scope.productsMap[productName]);
        });
        return favProducts;
    };
});

app.controller('viewProductController', function($scope, webStorage) {  //inherit $scope from productsController
    $scope.product;

    $scope.init = function() {
        //retrieve selected product
        var productName = getQueryValue("name");
        $scope.$watch('productsMap', function(newValue, oldValue) {
            if ($scope.productsMap) {
                $scope.product = $scope.productsMap[productName];
            }
        });
    };

    //FAVOURITES
    $scope.toggleFav = function() {
        if ($scope.product) {
            var index = $scope.favourites.indexOf($scope.product.name);
            if (index === -1) { //add
                $scope.favourites.push($scope.product.name);
            } else {    //remove
                $scope.favourites.splice(index, 1);
            }
            webStorage.add('favourites', $scope.favourites);
        }
    };

    $scope.isInFav = function() {
        if ($scope.product) {
            return $scope.favourites.indexOf($scope.product.name) !== -1;
        }
    };

    //RELATED
    $scope.getRelated = function() {
        if ($scope.product) {
            var relatedProducts = [];
            $.each($scope.product.related, function(i, productName) {
                relatedProducts.push($scope.productsMap[productName]);
            });
            return relatedProducts;
        }
    };
});

//inherit $scope from productsController and viewProductController
app.controller('subscribeController', function($scope, webStorage) {
    $scope.subscribeForm = {
        quantity: 1,
        frequency: 4,
        numTimes: 3
    };

    $scope.subscribe = function() {
        if ($scope.product) {
            //create subscription and add to cart
            var subscription = new OrderItem($scope.product,
                    $scope.subscribeForm.quantity,
                    true,
                    $scope.subscribeForm.frequency,
                    $scope.subscribeForm.numTimes);
            //add to cart
            $scope.cart.addSubscription(subscription);
            webStorage.add("cart", $scope.cart);   //update localstorage
        }
    };
    $scope.decrement = function(fieldName) {
        $scope.subscribeForm[fieldName] -= 1;
    };
    $scope.increment = function(fieldName) {
        $scope.subscribeForm[fieldName] += 1;
    };

    $scope.isInCart = function() {
        if ($scope.cart.subscriptions[$scope.product.name]) {
            return true;
        }
        return false;
    };
});

//CHECKOUT CONTROLLERS
app.controller('addressesController', function($scope, webStorage) {
    $scope.username;
    $scope.addresses = []; //array of class address
    $scope.newAddress;
    $scope.selectedAddress;
    $scope.valid = false;

    $scope.init = function(username) {

        $scope.username = username;

        //get addresses data
        var addresses = [
            new Address('shiling', 'North Bridge Road #01-10', '621111'),
            new Address('shiling', 'Clementi Road #08-08', '688111'),
            new Address('cao li', 'Lakeside Drive #18-18', '688000')
        ];
        $.each(addresses, function(index, address) {
            if (address.username === username) {
                $scope.addresses.push(address);
            }
        });
    };

    $scope.selectAddress = function(selectedAddress) {
        //reset
        $scope.selectedAddress = null;
        $scope.valid = false;
        if ($scope.newAddress) {
            $scope.newAddress.selected = false;
        }

        //find selected address
        $.each($scope.addresses, function(index, address) {
            if (address === selectedAddress) {
                $scope.selectedAddress = selectedAddress;
            } else {
                address.selected = false;
            }
        });
        if ($scope.newAddress && selectedAddress === $scope.newAddress) {
            $scope.selectedAddress = selectedAddress;
        }

        //mark selected addresses
        if ($scope.selectedAddress) {
            $scope.selectedAddress.selected = true;
            $scope.valid = true;
        }
    };

    //validate new address
    $scope.validate = function() {
        if ($scope.newAddress && $scope.newAddress.building && $scope.newAddress.postalCode) {    //valid new address
            $scope.valid = true;
            $scope.selectAddress($scope.newAddress);
        } else {
            $scope.valid = false;
            $scope.selectAddress(null);
        }
    };

    formatNewAddress = function() {
        if ($scope.newAddress.level && $scope.newAddress.unit) {
            return "{0}, #{1}-{2}".format($scope.newAddress.building, $scope.newAddress.level, $scope.newAddress.unit)
        } else {
            return $scope.newAddress.building;
        }
    };

    $scope.submit = function(location) {
        if ($scope.valid) {
            //if new address is selected, convert to Address object
            if ($scope.selectedAddress === $scope.newAddress) {
                $scope.selectedAddress = new Address(
                        $scope.username,
                        formatNewAddress(),
                        $scope.newAddress.postalCode);
            }

            //save address to current order
            var currentOrder = $.extend(new Order, webStorage.get("currentOrder"));  //convert object to Order
            currentOrder.address = $scope.selectedAddress;
            webStorage.add("currentOrder", currentOrder);

            //go to next page
            window.location.href = location;
        }
    };

});

app.controller('deliveryNotesController', function($scope, webStorage) {
    $scope.date;
    $scope.time;
    $scope.contactNum;
    $scope.specialInstructions;
    $scope.valid = false;

    $scope.init = function() {
        $scope.validate();
    };

    $scope.validate = function() {
        $scope.valid = false;
        $scope.errors = {};
        var patt_contactNum = /^[689]\d{7}$/;
        if ($scope.date && $scope.time && $scope.contactNum && patt_contactNum.test($scope.contactNum)) {
            $scope.valid = true;
        } else {
            if ($scope.date === undefined) {
                $scope.errors['date'] = "Required";
            }
            if ($scope.time === undefined) {
                $scope.errors['time'] = "Required";
            }
            if ($scope.contactNum === undefined) {
                $scope.errors['contactNum'] = "Required";
            }
            if ($scope.contactNum && !patt_contactNum.test($scope.contactNum)) {
                $scope.errors['contactNum'] = "Invalid";
            }
        }
    };

    $scope.submit = function(location) {
        if ($scope.valid) {
            //save to currentOrder
            var currentOrder = $.extend(new Order, webStorage.get("currentOrder"));  //convert object to Order
            currentOrder.deliveryDate = $scope.date;
            currentOrder.deliveryTime = $scope.time;
            currentOrder.contactNum = $scope.contactNum;
            currentOrder.specialInstructions = $scope.specialInstructions;
            webStorage.add("currentOrder", currentOrder);

            //go to next page
            window.location.href = location;
        }
    };
});

app.controller('creditCardController', function($scope, webStorage) {
    $scope.username;
    $scope.creditCards = []; //array of class address
    $scope.newCreditCard;
    $scope.selectedCreditCard;
    $scope.valid = false;

    $scope.init = function(username) {
        $scope.username = username;

        //get credit card data
        creditCards = [
            new CreditCard("shiling", "Tai Shi Ling", "Visa", "xxxx-xxxx-xxxx-1823", "008", "2018-09"),
            new CreditCard("caoli", "Cao Li", "Visa", "xxxx-xxxx-xxxx-3721", "012", "2020-06")
        ];
        $.each(creditCards, function(index, creditCard) {
            if (creditCard.username === username) {
                $scope.creditCards.push(creditCard);
            }
        });
        $scope.newCreditCard = new CreditCard(username);
    };

    $scope.selectCreditCard = function(selectedCreditCard) {
        //reset
        $scope.selectedCreditCard = null;
        $scope.valid = false;
        if ($scope.newCreditCard) {
            $scope.newCreditCard.selected = false;
        }

        //find selected credit card
        $.each($scope.creditCards, function(index, creditCard) {
            if (creditCard === selectedCreditCard) {
                $scope.selectedCreditCard = selectedCreditCard;
            } else {
                creditCard.selected = false;
            }
        });
        if ($scope.newCreditCard && selectedCreditCard === $scope.newCreditCard) {
            $scope.selectedCreditCard = selectedCreditCard;
        }

        //mark selected credit card
        if ($scope.selectedCreditCard) {
            $scope.selectedCreditCard.selected = true;
            $scope.valid = true;
        }
    };


    //validate new credit card
    $scope.validate = function() {
        if ($scope.newCreditCard
                && $scope.newCreditCard.cardholderName
                && $scope.newCreditCard.cardNumber
                && $scope.newCreditCard.CCV
                && $scope.newCreditCard.expiryMonth) {
            $scope.valid = true;
            $scope.selectCreditCard($scope.newCreditCard);
        } else {
            $scope.valid = false;
            $scope.selectCreditCard(null);
        }
    };

    $scope.submit = function(location) {
        if ($scope.valid) {
            //save credit card to current order
            var currentOrder = $.extend(new Order, webStorage.get("currentOrder"));  //convert object to Order
            currentOrder.creditCard = $scope.selectedCreditCard;
            webStorage.add("currentOrder", currentOrder);

            //go to next page
            window.location.href = location;
        }
    };
});

app.controller('confirmCheckoutController', function($scope, webStorage, subscriptionsService) {
    $scope.currentOrder;

    $scope.init = function() {
        //get currentOrder
        if (webStorage.get("currentOrder")) {
            $scope.currentOrder = Order.cast(webStorage.get("currentOrder"));
        }
    };

    $scope.submit = function(location) {
        //set currentOrder status, orderDate and id
        $scope.currentOrder.status = "Processing";
        $scope.currentOrder.orderDate = $.now();
        $scope.currentOrder.id = Math.floor((Math.random() * 10000000));    //random 6 digit number

        //add currentOrder to purchase history
        if (!webStorage.get("purchaseHistory")) {
            webStorage.add("purchaseHistory", []);
        }
        var purchaseHistory = webStorage.get("purchaseHistory");
        purchaseHistory.push($scope.currentOrder);
        webStorage.add("purchaseHistory", purchaseHistory);

        //add subscriptions
        $.each($scope.currentOrder.subscriptions, function(productName, orderItem) {
            orderItem.numTimesDelivered = 0;
            subscriptionsService.addSubscription(orderItem);
        });

        //clear currentOrder and cart
        webStorage.add("cart", null);
        $scope.currentOrder.reset();
        webStorage.add("currentOrder", $scope.currentOrder);

        //go to next page
        window.location.href = location;
    };
});

app.controller('purchaseHistoryController', function($scope, webStorage) {
    $scope.purchaseHistory = [];   //array of orderItems

    $scope.init = function() {
        //get purchase history
        if (!webStorage.get("purchaseHistory")) {
            webStorage.add("purchaseHistory", []);
        }
        var purchaseHistory = webStorage.get("purchaseHistory");
        $.each(purchaseHistory, function(i, order) {
            $scope.purchaseHistory.push(Order.cast(order));
        });
    };

    $scope.getUndeliveredOrders = function() {
        var undelivered = [];
        $.each($scope.purchaseHistory, function(i, purchase) {
            if (purchase.status !== "Delivered")
                undelivered.push(purchase);
        });
        return undelivered;
    };

    $scope.getDeliveredOrders = function() {
        var delivered = [];
        $.each($scope.purchaseHistory, function(i, purchase) {
            if (purchase.status === "Delivered")
                delivered.push(purchase);
        });
        return delivered;
    };
});

app.controller('viewPurchaseController', function($scope, webStorage) {
    $scope.purchase;

    $scope.init = function() {
        //get order id from query string in url
        var id = parseInt(getQueryValue("id"));

        //get purchase history
        if (!webStorage.get("purchaseHistory")) {
            webStorage.add("purchaseHistory", []);
        }
        var purchaseHistory = webStorage.get("purchaseHistory");
        $.each(purchaseHistory, function(i, order) {
            if (order.id === id) {
                $scope.purchase = Order.cast(order);
                return false;   //break from $.each loop
            }
        });
    };
});

app.controller('subscriptionsController', function($scope, subscriptionsService) {
    $scope.subscriptions;
    $scope.ongoingSubscriptions;
    $scope.expiredSubscriptions;

    $scope.init = function() {
        $scope.subscriptions = subscriptionsService.getSubscriptions();
        $scope.ongoingSubscriptions = subscriptionsService.getOngoingSubscriptions();
        $scope.expiredSubscriptions = subscriptionsService.getExpiredSubscriptions();
    };
});