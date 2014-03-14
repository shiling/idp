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

    $scope.addToFav = function(productName) {
        $scope.favourites.push(productName);
        webStorage.add('favourites', $scope.favourites);
    };

    $scope.getFavProducts = function() { //TODO: make more efficient
        var favProducts = [];
        $.each($scope.favourites, function(index, productName) {
            favProducts.push($scope.productsMap[productName]);
        });
        return favProducts;
    };

}

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
;

function deliveryNotesController($scope, webStorage) {
    $scope.date;
    $scope.time;
    $scope.contactNum;
    $scope.specialInstructions;
    $scope.valid = false;

    $scope.init = function() {
    };

    $scope.validate = function() {
        $scope.valid = false;
        if ($scope.date && $scope.time && $scope.contactNum) {
            $scope.valid = true;
        }
    };

    $scope.submit = function(location) {
        if ($scope.valid) {
            //save to currentOrder
            var currentOrder = $.extend(new Order, webStorage.get("currentOrder"));  //convert object to Order
            currentOrder.date = $scope.date;
            currentOrder.time = $scope.time;
            currentOrder.contactNum = $scope.contactNum;
            currentOrder.specialInstructions = $scope.specialInstructions;
            webStorage.add("currentOrder", currentOrder);

            //go to next page
            window.location.href = location;
        }
    };

}

function creditCardController($scope, webStorage) {
    $scope.userCreditcards = [];
    $scope.selectedCard;

    $scope.init = function(username) {
        //get creditcards data
        cards = [
            {
                "username": "shiling",
                "cardholderName": "Tai Shi Ling",
                "cardType": "Visa",
                "cardNumber": "100999888777",
                "CCV": "008",
                "expiryMonth": "09",
                "expiryYear": "2018"
            },
            {
                "username": "caoli",
                "cardholderName": "Cao Li",
                "cardType": "Visa",
                "cardNumber": "09999988811",
                "CCV": "012",
                "expiryMonth": "06",
                "expiryYear": "2020"
            }
        ];
        $.each(cards, function(index, card) {
            if (card.username === username) {
                $scope.userCreditcards.push(card);
            }
        });
        //get selectedCard from localstorage
        if (webStorage.get("card") === null) {
            webStorage.add("card", new CreditCard());
        }
        $scope.selectedCard = $.extend(new CreditCard, webStorage.get("card"));

    };

    $scope.selectCard = function(selectedCard) {
        //reset all card's selected to false;
        $.each($scope.userCreditcards, function(index, card) {
            card.selected = false;

        });
        selectedCard.selected = true;
        $scope.selectedCard = selectedCard;
        webStorage.add("card", selectedCard);
    };
}

