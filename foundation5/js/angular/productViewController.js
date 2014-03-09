function retrieveProduct($scope, $http){
    $scope.products = [];
    $scope.product = null;
    
    $scope.init = function(){
        $http.get('./data/products.json').success(function(data){
            $.each(data, function(i,e){
                product = $.extend(new Product, e);
                console.log(product.name);
                console.log(decodeURI(window.location.search.replace( "?", "" )));
                console.log( product.name === decodeURI(window.location.search.replace( "?", "" )));
                if ( product.name === decodeURI(window.location.search.replace( "?", "" ))){
                    $scope.product = product;
                    return false;
                } else {
                    $scope.pname = decodeURI(window.location.search.replace( "?", "" )) + ' not found!'
                };
            });
        });
    };
}

function retrieveRelated($scope, $http){
    $scope.products = [];
    
    $scope.init = function(){
        $http.get('./data/products.json').success(function(data){
            $scope.products = data;
        });
    };
}