function retrieveProduct($scope, $http){
    $scope.products = [];
    
    $scope.init = function(){
        $http.get('./data/products.json').success(function(data){
            $.each(data, function(i,e){
                product = $.extend(new Product, e);
                console.log(product.name);
                console.log(decodeURI(window.location.search.replace( "?", "" )));
                console.log( product.name === decodeURI(window.location.search.replace( "?", "" )));
                if ( product.name === decodeURI(window.location.search.replace( "?", "" ))){
                    $scope.pname = product.name;
                    $scope.brand = product.brand;
                    $scope.price = product.price;
                    $scope.unit = product.unit;
                    $scope.description = product.description;
                    $scope.image = product.image;
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