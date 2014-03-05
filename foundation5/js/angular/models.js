//MODELS
function Category(name) {
    this.name = name;
    this.subcategories = [];
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
    this.categories = [];
    this.filters = [];
    this.related = [];
}

Product.prototype.inCategory = function(categoryName) {
    return this.categories.indexOf(categoryName) !== -1;
};

Product.prototype.inFilter = function(filterName) {
    return this.filters.indexOf(filterName) !== -1;
};

function Cart(username) {
    this.username = username;
    this.items = {};
    this.subscriptions = {};
}

Cart.prototype.updateQuantity = function(product, quantity) {
    if (product instanceof Product) {
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
    }
};

Cart.prototype.getQuantity = function(product) {
    if (product instanceof Product) {
        if (!this.items[product.name]) {    //item not in cart
            return 0;
        } else {    //item in cart
            return this.items[product.name].quantity;
        }
    }
};

Cart.prototype.removeItem = function(product) {
    delete this.items[product.name];
};

function OrderItem(product, quantity) {
    this.product = product;
    this.quantity = quantity;
}

function Subscription(username, product, quantity, frequency, num_times, num_times_delivered) {
    this.username = username;
    this.product = product;
    this.quantity = quantity;
    this.frequency = frequency;
    this.num_times = num_times;
    this.num_times_delivered = num_times_delivered;
}

function Order(username, address, creditCard, date, status) {
    this.username = username;
    this.address = address;
    this.creditCard = creditCard;
    this.date = date;
    this.status = status;
    this.items = [];
}

function User(identity) {
    this.identity = identity;
    this.favourites = [];
    this.addresses = [];
    this.creditCards = [];
}

function Identity(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
}

function Address(username, addresseeName, address, postalCode) {
    this.username = username;
    this.addresseeName = addresseeName;
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