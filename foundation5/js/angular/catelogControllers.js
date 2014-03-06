//CONTROLLERS
function categoriesController($scope, $http, categoriesService) {
    $scope.categories = [];

    $scope.init = function() {
        //get categories data
        categoriesService.async().then(function(data) {
            $scope.categories = data;
        });
    };
}

function productsController($scope, $http, webStorage, productsService) {
    $scope.products = [];   //array of class Product
    $scope.cart;    //class Cart

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
}
