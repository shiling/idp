/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var app = angular.module('cmartApp', ['mm.foundation', 'webStorageModule']);
app.directive('ngModelOnblur', function () {
  return {
      restrict: 'A',
      require: 'ngModel',
      priority: 1,
      link: function (scope, element, attrs, ngModelCtrl) {
          if (attrs.type === 'radio' || attrs.type === 'checkbox') { return; }
          var update = function () {
              scope.$apply(function () {
                  ngModelCtrl.$setViewValue(element.val().trim());
                  ngModelCtrl.$render();
              });
          };
          element.off('input').off('keydown').off('change').on('focus', function () {
              scope.$apply(function () {
                  ngModelCtrl.$setPristine();
              });
          }).on('blur', update).on('keydown', function (e) {
              if (e.keyCode === 13) {
                  update();
              }
          });
      }
  };
});
