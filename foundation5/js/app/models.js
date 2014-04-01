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
    this.stock; //integer
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
    this.subscriptions = {};    //hashmap of class OrderItem
}

Cart.cast = function(object){
    var order = $.extend(new Cart, object);
    $.each(order.items, function(productName, orderItem){
        order.items[productName] = $.extend(new OrderItem, orderItem);
    });
    $.each(order.subscriptions, function(productName, orderItem){
        order.subscriptions[productName] = $.extend(new OrderItem, orderItem);
    });
    return order;
};

Cart.prototype.updateQuantity = function(product, quantity) {   //args[0] must be class Product, args[1] must be integer
    var intRegex = /^\d+$/;
    if (intRegex.test(quantity)) { //make sure is integer
        quantity = parseInt(quantity);
        if (quantity === 0) { //remove if quantity is 0
            this.removeItem(product);
        } else {  //update if quantity is not zero
            this.items[product.name] = new OrderItem(product, quantity);
        }
    } else {  //remove if not integer
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

Cart.prototype.isEmpty = function() {
    var isEmpty = true;
    $.each(this.items, function(i, e) {
        isEmpty = false;
        return false;    //break out of $.each loop
    });
    $.each(this.subscriptions, function(i, e) {
        isEmpty = false;
        return false;    //break out of $.each loop
    });
    return isEmpty;
};

Cart.prototype.addSubscription = function(subscription) {    //args[0] must be class OrderItem
    this.subscriptions[subscription.product.name] = subscription;
};

Cart.prototype.getCharges = function() {
    return getCharges(this);
};

function OrderItem(product, quantity, isSubscription, frequency, numTimes) { //args[0] must be class Product, args[1] must be integer
    this.product = product; //class Product
    this.quantity = quantity;   //integer; per delivery
    this.isSubscription = isSubscription;
    this.frequency = frequency;
    this.numTimes = numTimes; //integer
    this.numTimesDelivered; //integer
}

OrderItem.prototype.getUnitPrice = function() {
    if (this.isSubscription) {
        return 0.85 * this.product.price;
    }
    return this.product.price;
};
OrderItem.prototype.getTotalPrice = function() {
    if (this.isSubscription) {
        return 0.85 * this.product.price * this.quantity * this.numTimes;
    }
    return this.product.price * this.quantity;
};

function Order(username) {
    this.username = username;
    this.address; //class Address
    this.creditCard;   //class CreditCard
    this.deliveryDate;
    this.deliveryTime;
    this.contactNum;
    this.specialInstructions;
    this.status;   //string - 'processing','shipped','delivered'
    this.items;    //array of class OrderItem
    this.subscriptions; //array of class OrderItem
    this.orderDate; //timestamp
    this.id;    //integer
}

Order.cast = function(object){
    var order = $.extend(new Order, object);
    $.each(order.items, function(productName, orderItem){
        order.items[productName] = $.extend(new OrderItem, orderItem);
    });
    $.each(order.subscriptions, function(productName, orderItem){
        order.subscriptions[productName] = $.extend(new OrderItem, orderItem);
    });
    return order;
};

Order.prototype.getOrderDate = function() {
    var d = new Date(this.orderDate);
    return d.toString();
};

Order.prototype.getCharges = function() {
    return getCharges(this);
};

Order.prototype.reset = function() {
    this.deliveryDate = null;
    this.deliveryTime = null;
    this.specialInstructions = null;
    this.status = null;
    this.items = null;
};

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

//helper functions
function getCharges(object) {   //args[0] must be class Cart or Order
    var subTotal = 0;
    $.each(object.items, function(productName, orderItem) {
        subTotal += orderItem.getTotalPrice();
    });
    $.each(object.subscriptions, function(productName, orderItem) {
        subTotal += orderItem.getTotalPrice();
    });
    var deliveryFee = 0.0;
    var grandTotal = subTotal + deliveryFee;
    return {'subTotal': subTotal, 'deliveryFee': deliveryFee, 'grandTotal': grandTotal};
}