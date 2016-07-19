;
(function () {

  angular
    .module('drupalionicDemo.businessFeed.businessDetail.controller', [])
    .controller('BusinessDetailController', BusinessDetailController);

  BusinessDetailController.$inject = ['$state', '$scope', '$stateParams', 'UserResource', 'NodeResource', 'CommentResource', 'TaxonomyTermResource','DrupalHelperService', 'businessDetail']

  function BusinessDetailController($state, $scope, $stateParams, UserResource, NodeResource, CommentResource, TaxonomyTermResource, DrupalHelperService, businessDetail) {

    var vm = this;

    vm.viewTitle = $stateParams.title;
    vm = angular.extend(vm, businessDetail);
    vm.pathToImg = false;
    vm.flagAddReview = false;

    //vm.user = undefined;
    vm.pathToUserImg = false;

    //vm.comments = [];
    vm.pathToImg = "";
    vm.pathToImg = (businessDetail.field_category_banner_image.und) ? DrupalHelperService.getPathToImgByStyle('large') + businessDetail.field_category_banner_image.und[0].uri.split('//')[1] : false;

    /*if(vm.article.uid) {
     UserResource.retrieve(vm.article.uid).then(
     function(user) {
     if(user.picture !== null && user.picture.filename !== null) {
     vm.user = user;
     vm.pathToUserImg = vm.pathToCms + '/sites/default/files/styles/thumbnail/public/pictures/' + user.picture.filename;
     }
     },
     //error loading user
     function() {}
     );
     }*/  

     
     
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
        alert(vm.flagAddReview);
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
                       vm.doRefreshComments(node);
                },
                function (data) {
                });
                   
          /*newComment.field_image = {};
          return trySaveOptionalImage(newComment)
                .then(
                function (result) {
                  data.field_ltc_biz_photos = DrupalHelperService.structureField({fid: result.data.fid});
                },
                function (error) {
                  //resolve without image
                  //return $q.resolve(true);
                }
              )
              .finally(
                function () {
                  CommentResource.create(data);
                }
              );
          */

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
     /*vm.loadingComments = false;
     vm.loadComments = function (numOfNodes, node) {
             if(numOfNodes > 0) {
                     vm.loadingComments = true;

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
             }
     }


     vm.createComment = function(nid, cid) {

     }*/

  };
  /*
   authedTabsNodeDemoControllers.controller('NodeEditCtrl', function(vm, $state, NodeResource, NodeResourceChannel, nodeObj) {
   vm.nid = nodeObj.nid;
   delete nodeObj.nid;

   vm.dirtyPage = nodeObj;
   vm.editServerErrors = [];

   NodeResourceChannel.onNodeUpdateConfirmed(vm, function(node) {

   });

   vm.updatePage = function() {

   NodeResource.update(vm.nid, vm.dirtyPage).then(
   //success
   function(data) {
   $state.go('app.authed-tabs.node-list');
   },
   //error
   function(data) {
   vm.editServerErrors.push(data);
   }
   );
   }
   }
   */

})();


