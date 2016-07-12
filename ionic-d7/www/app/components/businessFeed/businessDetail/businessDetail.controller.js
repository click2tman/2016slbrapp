;
(function () {

  angular
    .module('drupalionicDemo.businessFeed.businessDetail.controller', [])
    .controller('BusinessDetailController', BusinessDetailController);

  BusinessDetailController.$inject = ['$scope', '$stateParams', 'UserResource', 'NodeResource', 'CommentResource', 'TaxonomyTermResource','DrupalHelperService', 'businessDetail']

  function BusinessDetailController($scope, $stateParams, UserResource, NodeResource, CommentResource, TaxonomyTermResource, DrupalHelperService, businessDetail) {

    var vm = this;

    vm.viewTitle = $stateParams.title;
    vm = angular.extend(vm, businessDetail);
    vm.pathToImg = false;

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
     
     $scope.newComment = {};
     vm.createComment = function(nid, newComment) {
          data = {"nid": nid, 
                 "subject": newComment.subject,
                "comment_body":{"und":[{"value": newComment.comment_body}]}
                }
          CommentResource.create(data)
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


