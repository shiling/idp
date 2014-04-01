/*
 * ANGULARJS
 */
var app = angular.module('cmartApp', ['mm.foundation', 'webStorageModule', 'truncate']);

/*
 * UTILITY
 */
String.prototype.format = String.prototype.f = function() {
    var s = this,
            i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
Date.prototype.toString = Date.prototype.tS = function() {
    var isAm = this.getHours() / 12 < 0;
    var ampm = isAm ? "AM" : "PM";

    return "{0} {1} ({2}),   {3}:{4} {5}".format(
            this.getDate(),
            MONTH_NAMES[this.getMonth()],
            DAY_NAMES[this.getDay()],
            this.getHours(),
            this.getMinutes(),
            ampm
            );
};

//get value from query string in url
function getQueryValue(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}