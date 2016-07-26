;
(function () {

  angular
    .module('drupalionicDemo.businessFeed.businessDetail.controller', [])
    .controller('BusinessDetailController', BusinessDetailController);

  BusinessDetailController.$inject = ['$state', '$scope', '$stateParams', '$ionicModal', 'UserResource', 'NodeResource', 'CommentResource', 'TaxonomyTermResource','DrupalHelperService', 'BusinessFeedService', 'businessDetail']

  function BusinessDetailController($state, $scope, $stateParams, $ionicModal, UserResource, NodeResource, CommentResource, TaxonomyTermResource, DrupalHelperService, BusinessFeedService, businessDetail) {

    var vm = this;

    vm.viewTitle = $stateParams.title;
    vm = angular.extend(vm, businessDetail);
    vm.pathToImg = false;
    vm.flagAddReview = false;

    //vm.user = undefined;
    vm.pathToUserImg = false;
    
    // ************* Edit Business Section Start ********************* 
    vm.openEditBusinessModal = openEditBusinessModal;
    vm.closeEditBusinessModal = closeEditBusinessModal;
    vm.saveBusiness = saveBusiness;
    
    /* Display add more button start */
    $scope.add_more = [];
    for (i = 0; i < 7; i += 1) {
           addmore = {
               'id': i,
                'addmore': false
           };
           $scope.add_more.push(addmore);
    }
    $scope.showAddMore = function(objIndex) {
        $scope.add_more[objIndex].addmore = true;
    }
    /* Display add more button end */

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
    // For Fetching Keywords Category End 

    // For Fetching Child Keywords Category Start
    vm.keywords_level1 = {};
    vm.keywords_level2 = {};
    vm.getChildKeywords = function(parent_term_id, level) {
                                    //alert("Parent Term ID: " + parent_term_id);
                                    var viewsOptions = {};
                                    viewsOptions.view_name = 'list_keywords_term';
                                    viewsOptions.page = 0;
                                    viewsOptions.pagesize = 25;
                                    viewsOptions.format_output = '0';
                                    viewsOptions.parent_term_id = parent_term_id; 
                                    BusinessFeedService.getAllChildterm(viewsOptions).then(
                                    function (allTerms) {
                                        if(level == 1) {
                                                vm.keywords_level1 = allTerms;
                                                //alert(JSON.stringify(vm.keywords_level1));
                                        }
                                        else if(level == 2) {
                                                vm.keywords_level2 = allTerms;
                                                //alert(JSON.stringify(vm.keywords_level2));
                                        }
                                    },
                                    function (data) {
                                        //Stop the ion-refresher from spinning
                                        //$scope.$broadcast('scroll.refreshComplete');
                                    });
                            }
    // For Fetching Child Keywords Category End


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

    // For Fetching Child Chiefdoms Category Start
    vm.chiefdoms_level1 = {};
    vm.chiefdoms_level2 = {};
    vm.getChildChiefdom = function(parent_term_id, level) {
                                    //alert("Parent Term ID: " + parent_term_id);
                                    var viewsOptions = {};
                                    viewsOptions.view_name = 'list_chiefdoms_term'; ///' + parent_term_id;
                                    viewsOptions.page = 0;
                                    viewsOptions.pagesize = 25;
                                    viewsOptions.format_output = '0';
                                    viewsOptions.parent_term_id = parent_term_id; 
                                    BusinessFeedService.getAllChildterm(viewsOptions).then(
                                    function (allTerms) {
                                        if(level == 1) {
                                                vm.chiefdoms_level1 = allTerms;
                                                //alert(JSON.stringify(vm.chiefdoms_level1));
                                        }
                                        else if(level == 2) {
                                                vm.chiefdoms_level2 = allTerms;
                                                //alert(JSON.stringify(vm.chiefdoms_level2));
                                        }
                                    },
                                    function (data) {
                                        //Stop the ion-refresher from spinning
                                        //$scope.$broadcast('scroll.refreshComplete');
                                    });
                            }
    // For Fetching Child Chiefdoms Category End
    // ************* Edit Business Section End ***********************

    //vm.comments = [];
    vm.pathToImg = "";
    vm.pathToImg = (businessDetail.field_category_banner_image.und) ? DrupalHelperService.getPathToImgByStyle('large') + businessDetail.field_category_banner_image.und[0].uri.split('//')[1] : false;
 
     bizcatdata = {};
     bizcatdata.tid = businessDetail.field_ltc_biz_category.und[0].tid;
     vm.bizcatinfo = {};
     TaxonomyTermResource.retrieve(bizcatdata).then(
             function(terminfo) {
                     vm.bizcatinfo = terminfo;
             },
             //error loading user
             function() {
             }
     ); 

     chiefdomcatdata = {};
     chiefdomcatdata.tid = businessDetail.field_ltc_biz_admin_location.und[0].tid;
     vm.chiefdomcatinfo = {};
     TaxonomyTermResource.retrieve(chiefdomcatdata).then(
             function(terminfo) {
                     vm.chiefdomcat = terminfo;
             },
             //error loading user
             function() {
             }
     );
 
     vm.showWriteReview = function showWriteReview() {
        vm.flagAddReview = true;
        //alert(vm.flagAddReview);
     }
     vm.comments = {};
     vm.loadingComments = false;
     NodeResource.comments(businessDetail).then(
             function(newComments) {
                     vm.loadingComments = false;
                     vm.comments = newComments;
             },
             //error loading user
             function() {
                vm.loadingComments = false;
             }
     );
     

    vm.doRefreshComments = function doRefresh(data) {
       NodeResource.comments(data).then(
        function (allComments) {
          vm.comments = allComments;
        },
        function (data) {
        });
    };

     $scope.showAddComment = function() {
        $scope.addComment = true;
     }
     $scope.addComment = false;
     $scope.newComment = {};
     vm.createComment = function(nid, newComment) {
          //alert(JSON.stringify(newComment));
          data = {"nid": nid, 
                 "subject": newComment.subject,
                "comment_body":{"und":[{"value": newComment.comment_body}]},
                "field_ltc_biz_rating": {"und":[{"rating": (newComment.rating * 20)}]}
                }
          
          newComment.subject = '';
          newComment.comment_body = '';
          newComment.rating = 0;
          CommentResource.create(data).then(
                function (data) {
                       var node = data.config.data.comment;
                       $scope.addComment = false; 
                       vm.doRefreshComments(node); 
                },
                function (data) {
                }); 

     }

    //returns promise
    // - resolve after saved image to server
    // - rejects if saving image fails or no image given
    function trySaveOptionalImage(newComment) {
      //if data is given
      if (newComment.field_image.base64) {

        var imgData = newComment.field_image.base64;
        delete newComment.field_image.base64;

        var newImage = {};

        newImage.file = imgData;
        newImage.filename = 'drupal.jpg';
        newImage.filesize = newImage.file.length;
        newImage.filepath = 'field/image/';
        newImage.filemime = "image/jpeg",
        newImage.image_file_name = 'drupal.jpg';

        return FileResource.create(newImage);
      }

      //else fail
      return $q.reject(false);

    } 
     
    // Open our new task modal
    function openEditBusinessModal(business, linstIndex) {
      vm.editBusiness = businessDetail;
      var jsonBusinessHours = vm.editBusiness.field_ltc_biz_business_hours.und;
      var length = jsonBusinessHours.length;
      var currentDay = vm.editBusiness.field_ltc_biz_business_hours.und[(length - 1)].day;
      for(i = length; i <= 13; i++) {
        if(currentDay == 6) { 
          currentDay = 0;
        }
        else {
          currentDay++;
        }
        day = {"day": currentDay, "starthours": "", "endhours": "", "daydelta": "1"};
        vm.editBusiness.field_ltc_biz_business_hours.und.push(day);
      } 
      vm.editBusiness.field_ltc_biz_category.und = vm.editBusiness.field_ltc_biz_category.und[0].tid;
      
      alert(JSON.stringify(vm.editBusiness)); 

      //alert(JSON.stringify(vm.editBusiness));
      vm.businessModalMode = 'edit';
      
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
      //alert(JSON.stringify(vm.member_type));

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
      //alert(JSON.stringify(vm.days));

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
      //alert(JSON.stringify(vm.int_day));

      // Hours...
      vm.hours = [];
      for (i = 0; i < 24; i += 1) {
           hours = {
               'title': ((i < 10) ? "0" + i : i),
               'value': (i * 100)
           };

           vm.hours.push(hours);
      } 
      //alert(JSON.stringify(vm.hours));
        
      // Minutes...
      vm.minutes = [];
      for (i = 0; i < 1; i += 1) {
           minute = {
               'title': ((i < 10) ? "0" + i : i),
               'value': (i * 100)
           };

           vm.minutes.push(minute);
      } 
      //alert(JSON.stringify(vm.minutes));
      vm.editBusinessModal.show();
    };

    
    // init the editBusinessModal
    $ionicModal.fromTemplateUrl('app/components/businessFeed/businessDetail/templates/edit.modal.html',
      function (modal) {
        vm.editBusinessModal = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      }
    );
    
    // Close the new task modal
    function closeEditBusinessModal() {
      vm.editBusinessModal.hide();
    };
    
    function saveBusiness(business) {
      //alert(JSON.stringify(business));
      vm.savingBusiness = true;
      BusinessFeedService
        .updateBusiness(business)
        .then(
        function (data) {
          //vm.doRefresh();
          for (i = 0; i < 7; i += 1) {
                $scope.add_more[i].addmore = false;
          }
        }
      )
      .finally(
        function (findata) {

          //update view
          //vm.newBusiness.field_image.base64 = false;
          vm.editBusinessModal.hide();
          vm.savingBusiness = false;
        }
      );
    }
  }; 

})();


