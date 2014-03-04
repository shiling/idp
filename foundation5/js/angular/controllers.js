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

function OrderItem(product, quantity, subscription){
  this.product = product;
  this.quantity = quantity;
  this.subscription = subscription;
}

function Subscription(username, product, quantity, frequency, num_times, num_times_delivered){
  this.username = username;
  this.product = product;
  this.quantity = quantity;
  this.frequency = frequency;
  this.num_times = num_times;
  this.num_times_delivered = num_times_delivered;
}

function Order(username, address, creditCard, date, status){
  this.username = username;
  this.address = address;
  this.creditCard = creditCard;
  this.date = date;
  this.status = status;
  this.items = [];
}

function User(identity){
  this.identity = identity;
  this.favourites = [];
  this.addresses = [];
  this.creditCards = [];
}

function Identity(username, email, password){
  this.username = username;
  this.email = email;
  this.password = password;
}

function Address(username, addresseeName, address, postalCode){
  this.username = username;
  this.addresseeName = addresseeName;
  this.address = address;
  this.postalCode = postalCode;
}

function CreditCard(username, cardholderName, cardType, cardNumber, CCV, expiryMonth, expiryYear){
  this.username = username;
  this.cardholderName = cardholderName;
  this.cardType = cardType;
  this.cardNumber = cardNumber;
  this.CCV = CCV;
  this.expiryMonth = expiryMonth;
  this.expiryYear = expiryYear;
}