//CONTROLLERS
function categoriesController($scope, $http){
  $scope.categories = [];
  
  $scope.init = function(){
      $http.get('./data/categories.json').success(function(data){
          $.each(data, function(i,e){
              cat = $.extend(new Category, e);  //convert object to Category
              cat.subcategories = [];
              $.each(e.subcategories, function(i,e2){
                  sub_cat = $.extend(new Category, e2); //convert object to Category
                  cat.subcategories.push(sub_cat);
              });
            $scope.categories.push(cat);
            
          });
      });
  };
}

function productsController($scope, $http, webStorage){
    $scope.products = [];
    $scope.cart;
    
    $scope.init = function(){
        //get products from json data file
        $http.get('./data/products.json').success(function(data){
            $.each(data, function(i,e){
                product = $.extend(new Product, e); //convert object to Product
                $scope.products.push(product);
            });
        });
        //get cart from localstorage
        if(webStorage.get("cart") === null){
            webStorage.add("cart",new Cart());
        }
        $scope.cart = $.extend(new Cart, webStorage.get("cart"));  //convert object to Cart
    };
    
    $scope.updateQuantity = function(product, quantity){
        $scope.cart.updateQuantity(product, parseInt(quantity));
        webStorage.add("cart", $scope.cart);   //update localstorage
    };
    
    $scope.validateQuantity = function(product){
        var intRegex = /^\d+$/;
        quantity = $scope.cart.getQuantity(product);
        if(!intRegex.test(quantity)){   //not an integer, set to zero
            $scope.updateQuantity(product,0);
        }
        webStorage.add("cart", $scope.cart);   //update localstorage
    };
    
    $scope.getQuantity = function(product){
        return $scope.cart.getQuantity(product);
    };
}