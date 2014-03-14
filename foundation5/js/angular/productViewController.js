function retrieveProduct($scope, $http){
    $scope.products = [];
    $scope.product = null;
    $scope.productFound = false;

    $scope.init = function(){
        $http.get('./data/products.json').success(function(data){
            $.each(data, function(i,e){
                currentProduct = $.extend(new Product, e);
                $scope.products.push(currentProduct);
                console.log(currentProduct.name);
                console.log(decodeURI(window.location.search.replace( "?", "" )));
                console.log( currentProduct.name === decodeURI(window.location.search.replace( "?", "" )));
                if ( !$scope.productFound && currentProduct.name === decodeURI(window.location.search.replace( "?", "" ))){
                    $scope.product = currentProduct;
                    $scope.productFound = true;
                };
            });
        });
    };

    $scope.related = function(products, product){
         if(product==null || product==undefined)
            return [];
        relatedProducts = [];
        console.log("related function");
        console.log(products);
        console.log(product);
        console.log(product.related);
        for (relatedIndex in product.related){
            relatedName = product.related[relatedIndex];
            console.log(relatedName);
            for (checkProductIndex in products){
                checkProduct = products[checkProductIndex];
                console.log(checkProduct.name + relatedName);
                if (checkProduct.name === relatedName){
                    relatedProducts.push(checkProduct);
                    console.log("triggered!");
                    break;
                };
            };
        };
        return relatedProducts;
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