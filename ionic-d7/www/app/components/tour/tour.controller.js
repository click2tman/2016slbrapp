;
(function () {
  'use strict';


  angular
    .module('drupalionicDemo.tour.controller', ['ngStorage'])
    .controller('TourController', TourController);

  TourController.$inject = ['$scope', '$localStorage','$ionicSideMenuDelegate'];

  /** @ngInject */
  function TourController($scope, $localStorage, $ionicSideMenuDelegate) {
    // jshint validthis: true
    var vm = this;

    vm.start = start;

    vm.options = {
      loop: false,
      effect: 'fade',
      speed: 500,
    };

    init();

    vm.goToLogin = goToLogin;
    vm.goToRegister = goToRegister;

    ///////////////////////

    function init(){
      $scope.$on('$ionicView.enter', function(){
        $ionicSideMenuDelegate.canDragContent(false);
      });
      $scope.$on('$ionicView.leave', function(){
        $ionicSideMenuDelegate.canDragContent(true);
      });
    }


    function start() {
      $localStorage.firstVisit = true;
      $scope.app.$state.go('app.register');
    }

    ///////////////
    function goToLogin() {
      $scope.app.$state.go('app.login');
    }
    function goToRegister() {
      $scope.app.$state.go('app.register');
    }

  };

})();
