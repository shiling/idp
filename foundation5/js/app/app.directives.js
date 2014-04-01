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

