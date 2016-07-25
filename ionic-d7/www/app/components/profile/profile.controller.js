;
(function () {
  'use strict'

  angular.module('drupalionicDemo.profile.controller', ['drupalionicDemo.profile.service'])
    .controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$scope', 'ProfileService'];

  function ProfileController($scope, ProfileService) {

    var vm = this;
    vm.isLoading = true;
    vm.editProfile = {};
    vm.changePassword = {};
    
    $scope.$on('$ionicView.enter', function () {
      ProfileService
        .getProfile()
        .then(function (profile) {
          angular.extend(vm, profile);
          vm.editProfile = {"uid": profile.uid,
                            "field_user_nick_name":{"und":[{"value": profile.field_user_nick_name.und[0].value}]}}
          vm.changePassword = {"uid": profile.uid}
           
        })
        .finally(function () {
          vm.isLoading = false;
        });
      ;
    })

    ////////////////
    vm.saveProfile = function(editProfile) {
      vm.savingProfile = true;
      ProfileService
        .updateProfile(editProfile)
        .then(
        function (profile) {
          //alert(JSON.stringify(profile));
          //vm.doRefresh();
        }
      )
      .finally(
        function (findata) {
          vm.savingProfile = false;
        }
      );
    }
    
    vm.saveChangePassword = function(data) {
      ProfileService
        .changePassword(data)
        .then(
        function (data) {
          //alert("Password Change Successfully.");
          //vm.doRefresh();
        }
      )
      .finally(
        function (findata) {
          vm.savingProfile = false;
        }
      );
    }
  }
})();
