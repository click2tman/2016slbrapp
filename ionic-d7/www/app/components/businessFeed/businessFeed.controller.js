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

    // For Fetching Business Category Start
    vm.business_categories = {};
    BusinessFeedService.getAllBusinessCat().then(
    function (allTerms) {
        vm.business_categories = allTerms;
    },
    function (data) {
        //Stop the ion-refresher from spinning
        //$scope.$broadcast('scroll.refreshComplete');
    });  
    // For Fetching Business Category End 

    // For Fetching Keywords Category Start
    vm.keywords = {};
    BusinessFeedService.getAllKeywords().then(
    function (allTerms) {
        vm.keywords = allTerms;
        //alert(JSON.stringify(vm.keywords));
    },
    function (data) {
        //Stop the ion-refresher from spinning
        //$scope.$broadcast('scroll.refreshComplete');
    });  
    // For Fetching Business Category End 


    // For Fetching Chiefdoms Category Start
    vm.chiefdoms = {};
    BusinessFeedService.getAllChiefdoms().then(
    function (allTerms) {
        vm.chiefdoms = allTerms;
        //alert(JSON.stringify(vm.chiefdoms));
    },
    function (data) {
        //Stop the ion-refresher from spinning
        //$scope.$broadcast('scroll.refreshComplete');
    });  
    // For Fetching Chiefdoms Category End 

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
      
      // Member Types...
      vm.member_type = [];
      var member_type_term = ["business", "silver", "gold", "diamond"];
      for (i = 0; i < 4; i += 1) {
           member_type = {
               'tid': i,
               'term_name': member_type_term[i]
           };
           vm.member_type.push(member_type);
      }
      alert(JSON.stringify(vm.member_type));

      // Days...
      vm.days = [];
      var days_name = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (i = 0; i < 7; i += 1) {
           day = {
               'day_id': i,
               'day_name': days_name[i]
           };
           vm.days.push(day);
      }
      alert(JSON.stringify(vm.days));

      vm.int_day = [];
      var j = 0;
      for (i = 1; i <= 13; i += 1) {
        if(i % 2 != 0) {
           int_day = {
               'int_day_id': j,
               'int_day_index': i
           };
           j++;
           vm.int_day.push(i);
        }
      } 
      alert(JSON.stringify(vm.int_day));

      // Hours...
      vm.hours = [];
      for (i = 0; i < 24; i += 1) {
           hours = {
               'title': ((i < 10) ? "0" + i : i),
               'value': (i * 100)
           };

           vm.hours.push(hours);
      } 
      alert(JSON.stringify(vm.hours));
        
      // Minutes...
      vm.minutes = [];
      for (i = 0; i < 1; i += 1) {
           minute = {
               'title': ((i < 10) ? "0" + i : i),
               'value': (i * 100)
           };

           vm.minutes.push(minute);
      } 
      alert(JSON.stringify(vm.minutes));


      //setup drupal field structure
      vm.newBusiness = angular.extend(vm.newBusiness, /*{
          type: 'ltc_business',
          title: '',
          body: DrupalHelperService.structureField({'value': 'full', 'summary': 'summ'}),
          field_image: {base64: false}
        }*/
        {"type":"ltc_business", 
         "field_ltc_biz_category": {"und":219},
        "title":"test",
        "field_ltc_biz_telephone":{"und":[{"value":"123123123123"}]},
        "field_ltc_biz_email":{"und":[{"email":"test@gmail.com"}]},
        "field_ltc_biz_website":{"und":[{"url":"www.google.com"}]},
        "field_ltc_biz_chiefdom": {"und":3},
        "field_ltc_biz_keywords": {"und":873},
        "field_ltc_biz_admin_location":{"und":[{"tid":""}]},
        "field_ltc_biz_address":{"und":[{"thoroughfare":"thoroughfare", "premise":"premise", "locality":"locality"}]},
        "field_ltc_biz_description":{"und":[{"value":"Say something nice about your business. This is your opportunity to tell it all."}]},
        "field_ltc_biz_address_geo":{"und":[{"value":"", "geom": {"lat": ""}, "geom": {"lon": ""}}]},
        "field_ltc_biz_admin_location":{"und":[{"tid":"123"}]},
        "field_ltc_biz_business_hours":{"und":{"1":800, "3":800, "5":800, "7":800, "9":800, "10":800, "11":800, "12":800, "13":800}},
        "field_ltc_biz_member_type": {"und": "0"},
        "field_image": {base64: false}
        }
      );

      //alert(JSON.stringify(vm.newBusiness));

      vm.createModal.show();
    };

    // Close the new task modal
    function closeCreateModal() {
      vm.createModal.hide();
    };

    function saveBusiness(business) {
      //alert(JSON.stringify(business));
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
