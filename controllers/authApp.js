var app = angular.module('authApp', []);


app.controller('AuthController', function($scope, $http, $window) {
    $scope.isLogin = true;
    $scope.user = { username: '', email: '', password: '' };

    $scope.toggleMode = function() {
        $scope.isLogin = !$scope.isLogin;
        $scope.user = { username: '', email: '', password: '' };
    };

    $scope.isLoggedIn = false; // Change to true if the user is logged in
            if (JSON.parse(localStorage.getItem('user'))){
                $scope.isLoggedIn = true;
            }
    
    $scope.logout = function() {
        localStorage.removeItem('user');
        $window.location.href = 'login.html';
    };
    
    $scope.authenticate = function() {
        const url = $scope.isLogin ? 'http://localhost:4000/auth/login' : 'http://localhost:4000/auth/register';

        $http.post(url, $scope.user).then(function(response) {
            alert(response.data.message);

            if ($scope.isLogin) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                $window.location.href = 'dashboard.html';
            } else {
                $scope.toggleMode();
            }
        }).catch(function(error) {
            alert(error.data.message || "Authentication failed");
        });
    };
});

