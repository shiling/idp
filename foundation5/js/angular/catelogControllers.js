//CONTROLLERS
function searchController($scope, filtersService, searchService) {
    $scope.filters = [];
    $scope.searchService = searchService;

    $scope.init = function() {
        //get filters data
        filtersService.async().then(function(data) {
            $scope.filters = data;
        });
    };

    $scope.getAppliedFilters = function() {
        return $scope.searchService.filters;
    };

    $scope.saveFilters = function() {
        $scope.searchService.filters = [];
        $.each($scope.filters, function(index, filter) {
            if (filter.selected) {
                $scope.searchService.filters.push(filter.name);
            }
        });
    };
}

function categoriesController($scope, $http, categoriesService, searchService) {
    $scope.categories = []; //array of class Category
    $scope.subcategories = [];
    $scope.searchService = searchService;

    $scope.init = function() {
        //get categories data
        categoriesService.async().then(function(data) {
            $scope.categories = data;
        });
    };

    $scope.selectCategory = function(category) {
        $scope.searchService.activeCategory = category;
        $scope.searchService.activeSubcategory = null;
        $scope.subcategories = $scope.searchService.activeCategory.subcategories;
    };

    $scope.isActiveCategory = function(category) {
        if ($scope.searchService.activeCategory === category) {
            return true;
        }
        return false;
    };

    $scope.selectSubcategory = function(subcategory) {
        $scope.searchService.activeSubcategory = subcategory;
    };

    $scope.isActiveSubcategory = function(subcategory) {
        if ($scope.searchService.activeSubcategory === subcategory) {
            return true;
        }
        return false;
    };

}

function productsController($scope, $http, webStorage, productsService, searchService) {
    $scope.productsMap;    //hashmap of class product
    $scope.products = [];   //array of class Product
    $scope.cart;    //class Cart
    $scope.searchService = searchService;
    $scope.favourites = []; //array of product names

    $scope.init = function() {
        //get product data
        productsService.async().then(function(data) {
            $scope.productsMap = data;
            $.each($scope.productsMap, function(productName, product) {
                $scope.products.push(product);
            });
        });
        //get cart from localstorage
        if (webStorage.get("cart") === null) {
            webStorage.add("cart", new Cart());
        }
        $scope.cart = $.extend(new Cart, webStorage.get("cart"));  //convert object to Cart
        //get fav from localstorage
        if (webStorage.get("favourites") === null) {
            webStorage.add("favourites", []);
        }
        $scope.favourites = webStorage.get("favourites");  //get fav from local storage
    };

    $scope.productFilter = function(product) {
        //not in applied category
        if (searchService.activeCategory && product.categories.indexOf(searchService.activeCategory.name) === -1) {
            return false;
        }
        //not in applied subcategory
        if (searchService.activeSubcategory && product.categories.indexOf(searchService.activeSubcategory.name) === -1) {
            return false;
        }
        //not in applied filter
        var include = true;
        $.each(searchService.filters, function(index, filter) {
            if (product.filters.indexOf(filter) === -1) {
                include = false;
            }
        });
        if (!include) {
            return false;
        }

        //name does not match
        if (searchService.name && !product.name.toLowerCase().match(searchService.name.toLowerCase())) {
            return false;
        }
        return true;
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
        return $scope.cart.getQuantity(product);
    };

    $scope.checkout = function(location) {
        if (!$scope.cart.isEmpty()) {  //proceed if cart has items
            if (!webStorage.get("currentOrder")) {    //create currentOrder if doesn't exist
                webStorage.add("currentOrder", new Order($scope.username));
            }
            var currentOrder = $.extend(new Order, webStorage.get("currentOrder")); //convert object to Order
            currentOrder.items = $scope.cart.items; //add items from cart
            webStorage.add("currentOrder", currentOrder);   //update currentOrder

            //go to next page
            window.location.href = location;
        }
    };

    //UPDATE FAVOURITES
    $scope.addToFav = function(productName) {
        $scope.favourites.push(productName);
        webStorage.add('favourites', $scope.favourites);
    };

    $scope.toggleFav = function(productName) {
        var index = $scope.favourites.indexOf(productName);
        if (index === -1) {
            $scope.favourites.push(productName);
        } else {
            $scope.favourites.splice(index, 1);
        }
        webStorage.add('favourites', $scope.favourites);
    };

    $scope.getFavProducts = function() { //TODO: make more efficient
        var favProducts = [];
        $.each($scope.favourites, function(index, productName) {
            favProducts.push($scope.productsMap[productName]);
        });
        return favProducts;
    };

    $scope.isProductInFav = function(productName) {
        var products = $scope.getFavProducts();
        for (var i = 0; i < products.length; i++) {
            if (products[i].name === productName) {
                return true;
            }
        }
        return false;
    };

}

//CHECKOUT CONTROLLERS
function addressesController($scope, webStorage) {
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

}

function deliveryNotesController($scope, webStorage) {
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
}

function creditCardController($scope, webStorage) {
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
}

function confirmCheckoutController($scope, webStorage) {
    $scope.currentOrder;

    $scope.init = function() {
        //get currentOrder
        if (webStorage.get("currentOrder")) {
            $scope.currentOrder = $.extend(new Order, webStorage.get("currentOrder"));
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

        //clear currentOrder and cart
        webStorage.add("cart", null);
        $scope.currentOrder.reset();
        webStorage.add("currentOrder", $scope.currentOrder);

        //go to next page
        window.location.href = location;
    };
}

function purchaseHistoryController($scope, webStorage) {
    $scope.purchaseHistory = [];   //array of orderItems

    $scope.init = function() {
        //get purchase history
        if (!webStorage.get("purchaseHistory")) {
            webStorage.add("purchaseHistory", []);
        }
        var purchaseHistory = webStorage.get("purchaseHistory");
        $.each(purchaseHistory, function(i, order) {
            $scope.purchaseHistory.push($.extend(new Order, order));
        });
    };

    $scope.getUndeliveredOrders = function() {
        var undelivered = [];
        $.each($scope.purchaseHistory, function(i, purchase) {
            if(purchase.status !== "Delivered")
            undelivered.push(purchase);
        });
        return undelivered;
    };
    
    $scope.getDeliveredOrders = function() {
        var delivered = [];
        $.each($scope.purchaseHistory, function(i, purchase) {
            if(purchase.status === "Delivered")
            delivered.push(purchase);
        });
        return delivered;
    };

}

function viewPurchaseController($scope, webStorage){
    $scope.purchase; 

    $scope.init = function() {
        //get order id from query string in url
        var id = parseInt(getQueryValue("id"));
        console.log(id);
        
        //get purchase history
        if (!webStorage.get("purchaseHistory")) {
            webStorage.add("purchaseHistory", []);
        }
        var purchaseHistory = webStorage.get("purchaseHistory");
        $.each(purchaseHistory, function(i, order) {
            if(order.id === id){
                $scope.purchase = $.extend(new Order,order);
                return false;   //break from $.each loop
            }
        });
    };
    
}
