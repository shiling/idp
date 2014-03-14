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
            $.each($scope.productsMap, function(productName, product){
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
    
    $scope.getFavProducts = function(){ //TODO: make more efficient
        var favProducts = [];
        $.each($scope.favourites, function(index, productName){
            favProducts.push($scope.productsMap[productName]);
        });
        return favProducts;
    };

}
function addressesController($scope, webStorage) {
    $scope.userAddresses = [];
    $scope.selectedAddress;

    $scope.init = function(username) {
        //get addresses data
        
        addresses = [
            {
                "username": "shiling",
                "name": "Tai Shi Ling",
                "address": "North Bridge Road #01-10",
                "postalcode": "(S)621111"
            },
            {
                "username": "shiling",
                "name": "Tai Shi Ling",
                "address": "Clementi Road #08-08",
                "postalcode": "(S)688111"
            },
            {
                "username": "cao li",
                "name": "Cao Li",
                "address": "Lakeside Drive #18-18",
                "postalcode": "(S)688000"
            }
        ];
        $.each(addresses, function(index, address) {
            if (address.username === username) {
                $scope.userAddresses.push(address);
            }
        });
        //get selectedAddress from localstorage
        if (webStorage.get("address") === null) {
            webStorage.add("address", new Address());
        }
        $scope.selectedAddress = $.extend(new Address, webStorage.get("address"));  //convert object to Cart

    };

    $scope.selectAddress = function(selectedAddress) {
        //reset all address's selected to false;
        $.each($scope.userAddresses, function(index, address) {
            address.selected = false;

        });
        selectedAddress.selected = true;
        $scope.selectedAddress = selectedAddress;
        webStorage.add("address", selectedAddress);
    };
}

function creditCardController($scope, webStorage) {
    $scope.userCreditcards = [];
    $scope.selectedCard;

    $scope.init = function(username) {
        //get creditcards data
        cards=[
            {
                "username": "shiling",
                "cardholderName": "Tai Shi Ling",
                "cardType": "Visa",
                "cardNumber": "100999888777",
                "CCV":"008",
                "expiryMonth":"09",
                "expiryYear":"2018"
            },
             {
                "username": "caoli",
                "cardholderName": "Cao Li",
                "cardType": "Visa",
                "cardNumber": "09999988811",
                "CCV":"012",
                "expiryMonth":"06",
                "expiryYear":"2020"
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

