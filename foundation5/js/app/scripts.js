/*
 * HEADJS - LOAD DEPENDENCIES
 */

//CSS
head.load("css/foundation.css");
head.load("css/font-awesome.min.css");
head.load("css/app.css");
head.load("css/app.angular.css");

//JS
head.load("js/vendor/modernizr.js");
head.load({jquery:"js/vendor/jquery.js"}, function() {
    head.load({foundation:"js/foundation.min.js"}, function(){
        Foundation.set_namespace = function() {};
        $(document).foundation();
    });
    head.load("js/angular/angular.min.js", function() {
        head.load("js/angular/mm-foundation-tpls-0.1.0.min.js"
                ,"js/angular/angular.webstorage.min.js"
                , "js/angular/angular.truncate.min.js"
                , function() {
                    head.load("js/app/models.js", function() {
                        head.load("js/app/app.js", function() {
                            head.load("js/app/app.directives.js");
                            head.load("js/app/app.services.js", function() {
                                head.load("js/app/app.controllers.js");
                            });
                        });
                    });
                });
    });
});
