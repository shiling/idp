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
    
    $scope.getAppliedFilters = function(){
        return $scope.searchService.filters;
    };
    
    $scope.addFilter = function(filter){    //args[0] must be of class Filter
        $scope.searchService.filters.push(filter.name);
        
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
    $scope.products = [];   //array of class Product
    $scope.cart;    //class Cart
    $scope.searchService = searchService;
    $scope.fav = [];

    $scope.init = function() {
        //get product data
        productsService.async().then(function(data) {
            $scope.products = data;
        });
        //get cart from localstorage
        if (webStorage.get("cart") === null) {
            webStorage.add("cart", new Cart());
        }
        $scope.cart = $.extend(new Cart, webStorage.get("cart"));  //convert object to Cart
        
        //get fav from localstorage
        if (webStorage.get("fav") === null) {
            webStorage.add("fav", []);
        }
        $scope.fav = JSON.parse(webStorage.get("fav"));  //get fav from local storage
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

    $scope.getNumOfItemsInCart = function() {
        return $scope.cart.getNumOfItems();
    };

    $scope.productFilter = function(product) {
        //not in applied category
        if(searchService.activeCategory && product.categories.indexOf(searchService.activeCategory.name) === -1){
            return false;
        }
        //not in applied subcategory
        if(searchService.activeSubcategory && product.categories.indexOf(searchService.activeSubcategory.name) === -1){
            return false;
        }
        //not in applied filter
        $.each(searchService.filters, function(index, filter){
            if(product.filters.indexOf(filter) === -1){
                console.log("false");
                return false;
            }
        });
        return true;
    };
    
    $scope.productFilter2 = function() {
        var productFilter = {
            name: '',
            categories: [],
            filters: []
        };
        if (searchService.name) {
            productFilter.name = searchService.name;
        }
        if (searchService.activeCategory) {
            productFilter.categories.push(searchService.activeCategory.name);
        }
        if (searchService.activeSubcategory) {
            productFilter.categories.push(searchService.activeSubcategory.name);
        }
        /*
        if(searchService.filters){
            productFilter.filters = searchService.filters;
        }*/
        return productFilter;
    };
    
    $scope.addToFav = function(productName) {
    	console.log('add '+productName+' to fav');
    	$scope.fav.push(productName);
    	webStorage.add('fav', $scope.fav);
    };
    
}
function addressesController($scope) {
    $scope.addresses = []; //array of class address

    $scope.init = function() {
        //get addresses data
        $scope.addresses = [
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
    };
    
    $scope.getUserAddresses = function(username){
        userAddress = [];
        $.each($scope.addresses, function(index, address){
            if(address.username === username){
                userAddress.push(address);
            }
        });
        return userAddress;
    };
};
