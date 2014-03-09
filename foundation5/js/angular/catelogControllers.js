//CONTROLLERS
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
    
    $scope.selectCategory = function(category){
        $scope.searchService.activeCategory = category;
        $scope.searchService.activeSubcategory = null;
        $scope.subcategories = $scope.searchService.activeCategory.subcategories;
    };
    
    $scope.isActiveCategory = function(category){
        if($scope.searchService.activeCategory === category){
            return true;
        }
        return false;
    };
    
    $scope.selectSubcategory = function(subcategory){
        $scope.searchService.activeSubcategory = subcategory;
    };
    
    $scope.isActiveSubcategory = function(subcategory){
        if($scope.searchService.activeSubcategory === subcategory){
            return true;
        }
        return false;
    };

}

function productsController($scope, $http, webStorage, productsService, searchService) {
    $scope.products = [];   //array of class Product
    $scope.cart;    //class Cart
    $scope.searchService = searchService;

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
    
    $scope.getNumOfItemsInCart = function(){
        return $scope.cart.getNumOfItems();
    };
    
    $scope.productFilter = function(){
        var productFilter = {
            categories: []
        };
        if(searchService.activeCategory){
            productFilter.categories.push(searchService.activeCategory.name);
        }
        if(searchService.activeSubcategory){
            productFilter.categories.push(searchService.activeSubcategory.name);
        }
        return productFilter;
    };
}