function identityController($scope, $http, webStorage, identityServices) {
    $scope.identities = [];
    $scope.identityMap;
    $scope.loggedInUsername = null;

    $scope.init = function() {
         //get identities
        identityServices.async().then(function(data) {
            $scope.identityMap = data;
            $.each($scope.identityMap, function(username, identity) {
                $scope.identities.push(identity);
            });
        });
        $scope.loggedInUsername = webStorage.get("loggedInUsername");
    };

    $scope.login = function() {
        var username = $scope.username;
        var password = $scope.password;
        if($scope.identityMap[username] && $scope.identityMap[username].password === password) {
            console.log('loggin successful');
            $scope.loggedInUsername = username;
            webStorage.add("loggedInUsername", username);
            return true;
        }
        console.log('loggin fail');
        $scope.loggedInUsername = null;
        webStorage.add("loggedInUsername", null);
        return false;
    };

    $scope.getLoggedInUsername = function() {
        return $scope.loggedInUsername;
    };

    $scope.isAuthenticated = function() {
        return $scope.loggedInUsername != null;
    };

}