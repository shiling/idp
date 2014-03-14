//MODELS
function Category(name) {
    this.name = name;
    this.subcategories = [];    //class Category
}

function Filter(name) {
    this.name = name;
}

function Product(name, brand, price, unit, description, image) {
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.unit = unit;
    this.description = description;
    this.image = image;
    this.categories = [];   //class Category
    this.filters = [];  //class Filter
    this.related = [];  //class Product
}

Product.prototype.inCategory = function(categoryName) {
    return this.categories.indexOf(categoryName) !== -1;
};

Product.prototype.inFilter = function(filterName) {
    return this.filters.indexOf(filterName) !== -1;
};

function Cart(username) {
    this.username = username;
    this.items = {};    //hashmap of class OrderItem
    this.subscriptions = {};    //hashmap of class Subscription
}

Cart.prototype.updateQuantity = function(product, quantity) {   //args[0] must be class Product, args[1] must be integer
    var intRegex = /^\d+$/;
    if (intRegex.test(quantity)) { //make sure is integer
        quantity = parseInt(quantity);
        if(quantity === 0){ //remove if quantity is 0
            this.removeItem(product);
        }else{  //update if quantity is not zero
            this.items[product.name] = new OrderItem(product, quantity);
        }
    }else{  //remove if not integer
        this.removeItem(product);
    }
};

Cart.prototype.getQuantity = function(product) {    //args[0] must be class Product
    if (!this.items[product.name]) {    //item not in cart
        return 0;
    } else {    //item in cart
        return this.items[product.name].quantity;
    }
};

Cart.prototype.removeItem = function(product) { //args[0] must be class Product
    delete this.items[product.name];
};

Cart.prototype.getNumOfItems = function(){
    var length = 0;
    $.each(this.items, function(i, e){
        length++;
    });
    return length;
};

Cart.prototype.getSubtotal = function(){
    var subTotal = 0;
    $.each(this.items, function(i, item){
        subTotal += item.product.price * item.quantity;
    });
    return subTotal;
};

Cart.prototype.getDeliveryFee = function(){
    return 0.0;
};

Cart.prototype.getGrandTotal = function(){
    return this.getSubtotal() + this.getDeliveryFee();
};

function OrderItem(product, quantity) { //args[0] must be class Product, args[1] must be integer
    this.product = product; //class Product
    this.quantity = quantity;   //integer
}

function Subscription(username, product, quantity, frequency, num_times, num_times_delivered) {
    this.username = username;   //string
    this.product = product; //class Product
    this.quantity = quantity;   //integer
    this.frequency = frequency; //integer
    this.num_times = num_times; //integer
    this.num_times_delivered = num_times_delivered; //integer
}

function Order(username, address, creditCard, date, time, contactNum, specialInstruction, status) {
    this.username = username;
    this.address = address; //class Address
    this.creditCard = creditCard;   //class CreditCard
    this.deliveryDate = date;   //date
    this.deliveryTime = time;   //time
    this.contactNum = contactNum;
    this.specialInstructions = specialInstruction;  
    this.status = status;   //string - 'processing','shipped','delivered'
    this.items = [];    //array of class OrderItem
}

function User(identity) {
    this.identity = identity;   //class Identity
    this.favourites = [];   //array of class Product
    this.addresses = [];    //array of class Address
    this.creditCards = [];  //array of class CreditCard
}

function Identity(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
}

function Address(username, address, postalCode) {
    this.username = username;   
    this.address = address;
    this.postalCode = postalCode;
}

function CreditCard(username, cardholderName, cardType, cardNumber, CCV, expiryMonth, expiryYear) {
    this.username = username;
    this.cardholderName = cardholderName;
    this.cardType = cardType;
    this.cardNumber = cardNumber;
    this.CCV = CCV;
    this.expiryMonth = expiryMonth;
    this.expiryYear = expiryYear;
}