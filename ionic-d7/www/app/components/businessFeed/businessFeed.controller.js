;
(function () {

  angular.module('drupalionicDemo.businessFeed.controller', ['commons.directives.toggleByOwnUid', 'drupalionicDemo.businessFeed.service'])
    .controller('BusinessFeedController', BusinessFeedController);

  BusinessFeedController.$inject = ['$q', '$scope', '$state', '$filter', '$ionicListDelegate', '$ionicModal', 'DrupalHelperService', 'BusinessFeedService', 'AuthenticationService', 'actualBusinesses']

  function BusinessFeedController($q, $scope, $state, $filter, $ionicListDelegate, $ionicModal, DrupalHelperService, BusinessFeedService, AuthenticationService, actualBusinesses) {

    var vm = this;
    //vars
    vm.deleteVisible = false;

    vm.loadingDetail = false;
    vm.businesses = actualBusinesses;
    //functions
    vm.doRefresh = doRefresh;
    vm.loadMore = loadMore;
    vm.openDetail = openDetail;

    //hide loading spinner on route change
    $scope.$on("$stateChangeSuccess", function () {
      vm.loadingDetail = false;
    });

    ///////////////////////////////

    /* List view */

    function doRefresh() {
       BusinessFeedService.loadRecent().then(
        function (allNodes) {
          vm.businesses = allNodes;
          //Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        },
        function (data) {
          //Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
    };

    function loadMore() {
      BusinessFeedService.loadMore().then(
        function (allNodes) {
          vm.businesses = allNodes;
          //Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.infiniteScrollComplete');
        },
        function (data) {
          //Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    function openDetail(businessToOpen) {
      vm.loadingDetail = businessToOpen.nid;

      $state.go('app.businessDetail', {
        nid: businessToOpen.nid,
        title: businessToOpen.title
      });
    };

    /*Create Modal*/
    vm.deletingBusiness = false;
    vm.saveingBusiness = false;
    vm.openCreateModal = openCreateModal;
    vm.closeCreateModal = closeCreateModal;
    vm.takeImage = takeImage,
    vm.saveBusiness = saveBusiness;
    vm.deleteBusiness = deleteBusiness;

    //new node
    vm.newImage = {};
    vm.newBusiness = {};

    // init the createModal
    $ionicModal.fromTemplateUrl('app/components/businessFeed/templates/create.modal.html',
      function (modal) {
        vm.createModal = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      }
    );

    //
    function takeImage(options) {

      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };

      ionic.Platform.ready(function () {

        navigator.camera.getPicture(
          function (result) {
            vm.newBusiness.field_image.base64 = result;
            $scope.$apply();
          },
          function (err) {
          },
          options
        );

      });

    }

    // Open our new task modal
    function openCreateModal(business, linstIndex) {
      vm.newBusiness = {};
      vm.businessModalMode = 'create';

      //setup drupal field structure
      vm.newBusiness = angular.extend(vm.newBusiness, /*{
          type: 'ltc_business',
          title: '',
          body: DrupalHelperService.structureField({'value': 'full', 'summary': 'summ'}),
          field_image: {base64: false}
        }*/
        {"type":"ltc_business", 
         "field_ltc_biz_category":{"und":"201"},
        "title":"test",
        "field_ltc_biz_telephone":{"und":[{"value":"123123123123"}]},
        "field_ltc_biz_email":{"und":[{"email":"test@gmail.com"}]},
        "field_ltc_biz_website":{"und":[{"value":"www.google.com"}]},
        "field_ltc_biz_admin_location":{"und":[{"tid":""}]},
        "field_ltc_biz_address":{"und":[{"thoroughfare":"201", "locality":"test"}]},
        "field_ltc_biz_admin_location":{"und":[{"tid":"123"}]},
        "field_ltc_biz_business_hours":{"und":{"1":10, "3":10, "5":10, "7":10, "9":10, "10":10, "11":10, "12":10, "13":10}},
        "field_image": {base64: false}
        }
      );

      vm.createModal.show();
    };

    // Close the new task modal
    function closeCreateModal() {
      vm.createModal.hide();
    };

    function saveBusiness(business) {

      vm.savingBusiness = true;
      BusinessFeedService
        .saveBusiness(business)
        .then(
        function (data) {
          vm.doRefresh();
        }
      )
        .finally(
        function (findata) {

          //update view
          //vm.newBusiness.field_image.base64 = false;
          vm.createModal.hide();
          vm.savingBusiness = false;
        }
      );

    }

    function deleteBusiness(business, linstIndex) {

      vm.deletingBusiness = business.nid;
      BusinessFeedService
        .deleteBusiness(business)
        .then(
        function (data) {
          vm.businesses.splice(linstIndex, 1)
        }
      )
        .finally(function () {
          vm.deletingBusiness = false;
        });

    }
  }

})();
