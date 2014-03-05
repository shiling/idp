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
    $scope.products = [];
    $scope.cart;

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

    $scope.updateQuantity = function(product, quantity) {
        $scope.cart.updateQuantity(product, parseInt(quantity));
        webStorage.add("cart", $scope.cart);   //update localstorage
    };

    $scope.validateQuantity = function(product) {
        var intRegex = /^\d+$/;
        quantity = $scope.cart.getQuantity(product);
        if (!intRegex.test(quantity)) {   //not an integer, set to zero
            $scope.updateQuantity(product, 0);
        }
        webStorage.add("cart", $scope.cart);   //update localstorage
    };

    $scope.getQuantity = function(product) {
        return $scope.cart.getQuantity(product);
    };
}