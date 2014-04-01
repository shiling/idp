/*
 * SERVICES
 */
//retrieves categories from json file
app.factory('categoriesService', function($http) {
    var promise;
    var categoriesService = {
        async: function() {
            if (!promise) {
                promise = $http.get('./data/categories.json').then(function(response) {
                    categories = [];
                    $.each(response.data, function(i, e) {
                        cat = $.extend(new Category, e); //convert object to Category
                        cat.subcategories = [];
                        $.each(e.subcategories, function(i, e2) {
                            sub_cat = $.extend(new Category, e2); //convert object to Category
                            cat.subcategories.push(sub_cat);
                        });
                        categories.push(cat);
                    });
                    return categories;
                });
            }
            return promise;
        }
    };
    return categoriesService;
});

//retrieves identities from json file
app.factory('identityService', function($http, webStorage) {
    var promise;
    var identityService = {
        username: function() {
            var username = webStorage.get('username');
            if (!username) {
                username = 'Guest';
            }
            return username;
        },
        isAuthenticated: function() {
            var username = webStorage.get('username');
            if (!username) {
                return true;
            }
            return false;
        },
        async: function() {
            if (!promise) {
                promise = $http.get('./data/identities.json').then(function(response) {
                    identitiesMap = {};
                    $.each(response.data, function(i, e) {
                        var identity = $.extend(new Identity, e);
                        identitiesMap[identity.username] = identity;
                    });
                    return identitiesMap;
                });
            }
            return promise;
        },
        login: function(username, password, onLogin) {
            if (!promise) {
                this.async().then(__login);
            } else {
                promise.then(__login);
            }
            function __login(identitiesMap) {
                var identity = identitiesMap[username];
                if (!identity) {
                    onLogin(false, {username: "Username is not registered"});
                } else if (identity.password !== password) {
                    onLogin(false, {password: "Wrong Password"});
                } else {
                    webStorage.add('username', username);
                    onLogin(true);
                }
            }
        }
    };
    return identityService;
});

//retrieves products from json file
app.factory('productsService', function($http) {
    var promise;
    var productsService = {
        async: function() {
            if (!promise) {
                promise = $http.get('./data/products.json').then(function(response) {
                    productsMap = {};
                    $.each(response.data, function(i, e) {
                        product = $.extend(new Product, e); //convert object to Product
                        productsMap[product.name] = product;
                    });
                    return productsMap;
                });
            }
            return promise;
        }
    };
    return productsService;
});

//retrieves filters from json file
app.factory('filtersService', function($http) {
    var promise;
    var filtersService = {
        filters: null,
        filtersDictionary: null
    };
    $http.get('./data/filters.json').then(function(response) {
        filtersService.filters = response.data;
    });
    $http.get('./data/filtersDictionary.json').then(function(response) {
        filtersService.filtersDictionary = response.data;
    });
    return filtersService;
});

//retrieves categories from json file
app.factory('searchService', function(webStorage) {
    var searchService = {
        'category': null,
        'subcategory': null,
        'name': '',
        'filters': []
                /*
                 ,
                 load: function(){
                 if(!webStorage.get('searchService')){
                 webStorage.add('searchService', this);
                 }else{
                 var data = webStorage.get('searchService');
                 if(data.category){
                 this.category = $.extend(new Category, data.category);
                 this.category.subcategories = [];
                 for(var i = 0; i<data.category.subcategories.length; i++){
                 this.category.subcategories.push($.extend(new Category, data.category.subcategories[i]));
                 }
                 }
                 if(data.subcategory){
                 this.subcategory = $.extend(new Category, data.subcategory);
                 }
                 }
                 },
                 save: function(){
                 webStorage.add('searchService', this);
                 }
                 */
    };
    //searchService.load();
    return searchService;
});

app.factory('subscriptionsService', function(webStorage) {
    var subscriptions;
    var subscriptionsService = {
        getSubscriptions: function() {
            if (!subscriptions) {
                subscriptions = [];
                if (!webStorage.get('subscriptions')) {
                    webStorage.add('subscriptions', []);
                }
                $.each(webStorage.get('subscriptions'), function(index, orderItem) {
                    subscriptions.push($.extend(new OrderItem, orderItem));
                });
            }
            return subscriptions;
        },
        getOngoingSubscriptions: function() {
            if (!subscriptions) {
                this.getSubscriptions();
            }
            var ongoingSubscriptions = [];
            $.each(subscriptions, function(index, subscription) {
                if (subscription.numTimesDelivered < subscription.numTimes) {
                    ongoingSubscriptions.push(subscription);
                }
            });
            return ongoingSubscriptions;
        },
        getExpiredSubscriptions: function() {
            if (!subscriptions) {
                this.getSubscriptions();
            }
            var expiredSubscriptions = [];
            $.each(subscriptions, function(index, subscription) {
                if (subscription.numTimesDelivered === subscription.numTimes) {
                    expiredSubscriptions.push(subscription);
                }
            });
            return expiredSubscriptions;
        },
        addSubscription: function(orderItem) {    //args[0] must be OrderItem
            if (!subscriptions) {
                this.getSubscriptions();
            }
            subscriptions.push(orderItem);
            webStorage.add('subscriptions', subscriptions);
        }
    };
    return subscriptionsService;
});