;(function () {
  'use strict';


  angular
    .module('drupalionicDemo.register.controller', ['commons.validation.setValidAfterChange', 'ngStorage', 'ngMessages'])
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$scope', 'UserResource', 'AuthenticationService', '$localStorage'];

  /** @ngInject */
  function RegisterController($scope, UserResource, AuthenticationService, $localStorage) {
    // jshint validthis: true
    var vm = this;

    vm.serverErrors = [];

    //data for vm.registerForm
    vm.registerData = {
      name: 'johnnyharpertesting',
      field_mobile_user_telephone: {und: [{value: '012345789'}]},
      field_user_nick_name: {und: [{value: 'johnnyharpertesting'}]},
      mail: 'johnnyharpertesting@gmail.com',
      pass: 'testing'
    };

    vm.registerIsPending = false;

    vm.goToLogin = goToLogin;
    vm.doRegister = doRegister;

    /////////////

    function goToLogin() {
      $scope.app.resetForm(vm.registerForm);
      $scope.app.$state.go('app.login');
    }

    function doRegister() {

      //$scope.app.resetForm(vm.registerForm);

      if (vm.registerForm.$valid) {
        vm.registerIsPending = true;
        vm.serverErrors = [];
        UserResource.register(vm.registerData)
          //register
          .then(
          function (data) {
            $localStorage.isRegistered = true;
            return AuthenticationService.login({username: vm.registerData.name, password: vm.registerData.pass});
          }
        )
          //login
          .then(
          function (data) {
            vm.registerIsPending = false;
            //reset form
            vm.registerData = {};

            //reste form
            $scope.app.resetForm(vm.registerForm);
            $scope.app.$state.go('app.login');
            $scope.app.$state.go('app.profile');
          }
        )
          .catch(
          function (errorResult) {


            if (errorResult.status >= 400 && errorResult.status < 500) {
              //Not found
              if (errorResult.status == 404) {
                vm.serverErrors.push("Service not available!");
              }
              //Not Acceptable
              else if (errorResult.status == 406) {
                //errors for specific fields
                if (angular.isObject(errorResult.data) && 'form_errors' in errorResult.data) {
                  if (errorResult.data.form_errors.name) {
                    vm.registerForm.name.$setValidity('name-taken', false);
                  }
                  if (errorResult.data.form_errors.mail) {
                    vm.registerForm.mail.$setValidity('email-taken', false);
                  }
                }
                //general errors
                else {
                  vm.serverErrors.push(errorResult.statusText);
                }
              }
              //400 - 500 default message
              else {
                vm.serverErrors.push(errorResult.data[0]);
              }

            }



          }
        )
        .finally(
          function () {
            vm.registerIsPending = false;
          }
        );
      }

    }


  }

})();
