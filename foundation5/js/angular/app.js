//ANGULAR JS
var app = angular.module('cmartApp', ['mm.foundation', 'webStorageModule', 'truncate']);

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
        async: function() {
            if (!promise) {
                promise = $http.get('./data/filters.json').then(function(response) {
                    filters = [];
                    $.each(response.data, function(i, e) {
                        filter = $.extend(new Filter, e); //convert object to Product
                        filters.push(filter);
                    });
                    return filters;
                });
            }
            return promise;
        }
    };
    return filtersService;
});

//retrieves categories from json file
app.factory('searchService', function() {
    var searchService = {
        'activeCategory': null,
        'activeSubcategory': null,
        'name': null,
        'filters': []
    };
    return searchService;
});

app.directive('ngModelOnblur', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope, element, attrs, ngModelCtrl) {
            if (attrs.type === 'radio' || attrs.type === 'checkbox') {
                return;
            }
            var update = function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(element.val().trim());
                    ngModelCtrl.$render();
                });
            };
            element.off('input').off('keydown').off('change').on('focus', function() {
                scope.$apply(function() {
                    ngModelCtrl.$setPristine();
                });
            }).on('blur', update).on('keydown', function(e) {
                if (e.keyCode === 13) {
                    update();
                }
            });
        }
    };
});

//UTILITY
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};
