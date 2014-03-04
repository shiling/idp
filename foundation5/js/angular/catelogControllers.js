//CONTROLLERS
function categoriesController($scope, $http){
  $scope.categories = [];
  
  $scope.init = function(){
      $http.get('./data/categories.json').success(function(data){
          $.each(data, function(i,e){
              cat = $.extend(new Category, e);
              cat.subcategories = [];
              $.each(e.subcategories, function(i,e2){
                  sub_cat = $.extend(new Category, e2);
                  cat.subcategories.push(sub_cat);
              });
            $scope.categories.push(cat);
            
          });
      });
  };
}

function productsController($scope, $http, webStorage){
    $scope.products = [];
    
    $scope.init = function(){
        $http.get('./data/products.json').success(function(data){
            $.each(data, function(i,e){
                product = $.extend(new Product, e);
                $scope.products.push(product);
            });
        });
    };
    
    $scope.updateQuantity = function(product, quantity){
        if(webStorage.get("cart") === null){
            webStorage.add("cart",new Cart());
        }
        cart = $.extend(new Cart, webStorage.get("cart"));
        cart.updateQuantity(product, quantity);
        webStorage.add("cart", cart);
    };
    
    $scope.getQuantity = function(product){
        if(webStorage.get("cart") === null){
            return 0;
        }else{
            cart = $.extend(new Cart, webStorage.get("cart"));
            return cart.getQuantity(product);
        }
    };
}

//MODELS
function Category(name){
  this.name = name;
  this.subcategories = [];
}

function Filter(name){
  this.name = name;
}

function Product(name, brand, price, unit, description, image){
  this.name = name;
  this.brand = brand;
  this.price = price;
  this.unit = unit;
  this.description = description;
  this.image = image;
  this.categories = [];
  this.filters = [];
  this.related = [];
}

Product.prototype.inCategory = function(categoryName){
  return this.categories.indexOf(categoryName) !== -1;
};

Product.prototype.inFilter = function(filterName){
  return this.filters.indexOf(filterName) !== -1;
};

function Cart(username){
  this.username = username;
  this.items = {};
}

Cart.prototype.updateQuantity = function(product, quantity){
  if (product instanceof Product){
      this.items[product.name] = new OrderItem(product, quantity, null);
  }
};

Cart.prototype.getQuantity = function(product){
   if (product instanceof Product){
       if (!this.items[product.name]){
           return 0;
       }else{
           return this.items[product.name].quantity;
       }
  } 
};