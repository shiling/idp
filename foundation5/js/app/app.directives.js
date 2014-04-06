/*
 * DIRECTIVES
 */
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
app.directive('cmMenu', function() {
    return{
        restrict: 'E',
        templateUrl: './templates/menu.html'
    };
});

app.directive('cmStoreNavigation', function() {
    return{
        restrict: 'E',
        templateUrl: './templates/storeNavigation.html'
    };
});
app.directive('cmMasonry', ['$interval', function($interval) {
        return{
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.$on('refresh', function() {
                    if (typeof Masonry !== 'undefined') {
                        element.imagesLoaded(function(){
                            element.masonry('reloadItems').masonry();
                        });
                    }
                });
            }
        };
    }]);

app.directive('cmProductImage', function() {
    return{
        restrict: 'E',
        template: '<img ng-src="img/{{product.image}}" alt="{{product.name}}"/>'
    };
});

app.directive('cmUpdateCartPopup', function(){
    return{
        restrict: 'E',
        link: function(scope, element, attrs){
            scope.$on('updateCart', function(event, data){
                //update text
                if(data.quantity > 0){
                    var text = "<h5>{0} <small>{1}</small></h5>".format(data.quantity, data.product.name);
                    $(element).find(".joyride-content").html(text);
                    $(element).find(".joyride-tip-guide").removeClass('removed').addClass('added');
                }else{
                    var text = "<h5>Removed <small>{0}</small></h5>".format(data.product.name);
                    $(element).find(".joyride-content").html(text);
                    $(element).find(".joyride-tip-guide").removeClass('added').addClass('removed');
                }
                
                //show popup
                $(element).show();
                
                //fade away popup
                setTimeout(function(){$(element).hide();}, 1500);
                
            });
        },
        template: "<div class='joyride-tip-guide' data-index='0'>"
                    + "<span class='joyride-nub top'></span>"
                    + "<div class='joyride-content-wrapper'>"
                    + "<div class='joyride-content'></div>"
                    + "</div>"
                    + "</div>"
    };
});