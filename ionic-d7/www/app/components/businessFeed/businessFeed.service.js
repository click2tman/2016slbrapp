;
(function () {

  angular
    .module('drupalionicDemo.businessFeed.service', [])
    .factory('BusinessFeedService', BusinessFeedService);

  BusinessFeedService.inject = ['$q', '$filter', '$http', 'DrupalApiConstant', 'DrupalHelperService', 'ViewsResource', 'FileResource', 'NodeResource', 'AuthenticationService', 'TaxonomyVocabularyResource', 'TaxonomyTermResource', 'CommentResource']
  function BusinessFeedService($q, $filter, $http, DrupalApiConstant, DrupalHelperService, ViewsResource, FileResource, NodeResource, AuthenticationService, TaxonomyTermResource, CommentResource) {

    console.log("BusinessFeedService");
    var initialised = false,
    //pagination options
    paginationOptions = {};
    paginationOptions.pageFirst = 0;
    paginationOptions.pageLast = undefined;
    paginationOptions.maxPage = undefined;

    //Options for indexing nodes
    var viewsOptions = {};
    viewsOptions.view_name = 'businessview';
    viewsOptions.page = 0;
    viewsOptions.pagesize = 25;
    viewsOptions.format_output = '0';

    //stored business
    var businesses = [];

    //Options for indexing business category
    var viewsOptions_bc = {};
    viewsOptions_bc.view_name = 'list_business_term';
    viewsOptions_bc.page = 0;
    viewsOptions_bc.pagesize = 25;
    viewsOptions_bc.format_output = '0';

    //stored business category
    var business_categories = [];

    //Options for indexing keywords category
    var viewsOptions_kw = {};
    viewsOptions_kw.view_name = 'list_keywords_term';
    viewsOptions_kw.page = 0;
    viewsOptions_kw.pagesize = 25;
    viewsOptions_kw.format_output = '0';
    viewsOptions_kw.parent_term_id = '0'; 

    //stored keywords category
    var keywords = [];

    //Options for indexing chiefdoms category
    var viewsOptions_cd = {};
    viewsOptions_cd.view_name = 'list_chiefdoms_term';
    viewsOptions_cd.page = 0;
    viewsOptions_cd.pagesize = 25;
    viewsOptions_cd.format_output = '0';
    viewsOptions_cd.parent_term_id = '0'; 

    //stored chiefdoms category
    var chiefdoms = [];

    //stored child terms
    var childterms = [];
    
    //businessFeed service object
    var businessFeedService = {
      init: init,
      getAll: getAll,
      getAllBusinessCat: getAllBusinessCat,
      getAllKeywords: getAllKeywords,
      getAllChiefdoms: getAllChiefdoms,
      getAllChildterm: getAllChildterm,
      retrieveparents: retrieveparents,
      get: get,
      loadRecent: loadRecent,
      loadMore: loadMore,
      saveBusiness: saveBusiness,
      deleteBusiness: deleteBusiness,
      updateBusiness: updateBusiness
    }
 

    return businessFeedService;

    /////////////////////////////////////////////////////////////

    function init() {
      console.log("init");
      var defer = $q.defer();

      retreiveBusinesses(viewsOptions)
        .then(
        //success
        function (newBusinesses) {
          defer.resolve(businesses);
        }
      )
      .catch(
        function (error) {
          defer.reject(error);
        }
      )
      .finally(
        function () {
          initialised = true;
        }
      );

      return defer.promise;
    }


    //prepare business after fetched from server
    function prepareBusiness(business) {
      if("field_image" in business && "und" in business.field_image) {
        angular.forEach(business.field_image.und, function (value, key) {

          var imgPath = business.field_image.und[key].uri.split('//')[1].replace(/^\/+/, "");
          business.field_image.und[key].imgPath = DrupalHelperService.getPathToImgByStyle(DrupalApiConstant.imageStyles.medium) + imgPath;
          business.nid = parseInt(business.nid);
        });

      }

      return business;
    }

    //returns all businesses
    //@TODO implement exposed filters for request and cache like in get
    function getAll() {
      console.log("getAll");
      var defer = $q.defer(),
        allFilteredSpots = undefined;
      if (businesses.length > 0 && false) {
        allFilteredSpots = businesses;
      } else {
        allFilteredSpots = undefined;
      }

      if (allFilteredSpots != undefined) {
        defer.resolve(allFilteredSpots);
      }
      else {
        return retreiveBusinesses(viewsOptions);
      }

      return defer.promise;
    }

    //returns business by nid
    // first it query's the cache
    // if item not in cache it fires request to server
    //filter { nid:3 }
    function get(filter) {
      console.log("get");
      var defer = $q.defer(),
        business = undefined;

      //if a filter is given and not empty
      if (angular.isObject(filter) && typeof Object.keys(filter)[0] !== 'undefined') {
        business = $filter('filter')(businesses, filter)
        if (business.length > 0) {
          business = business[0];
        }
      }

      //return business form cache
      if (angular.isObject(business) && typeof Object.keys(business)[0] !== 'undefined') {
        defer.resolve(business);
      }
      else {
        //setup exposed filters options
        viewsOptions.exposed_filters = filter;

        return ViewsResource
          .retrieve(viewsOptions)
          .then(function (result) {
            if (result.data[0]) {
              return result.data[0];
            }
            return $q.reject(false);
          });
      }

      return defer.promise;
    }

    //loads recent businesses and adds to businesses array
    function loadRecent() {
      console.log("loadRecent");
      if (paginationOptions.pageFirst > 0) {
        paginationOptions.pageFirst = 0;
      }
      viewsOptions.page = paginationOptions.pageFirst;
      return retreiveBusinesses(viewsOptions);
    }

    //loads businesses and adds to businesses array
    function loadMore() {
      console.log("loadMore");
      var defer = $q.defer();

      if (paginationOptions.maxPage === undefined) {
        //start initial with 0
        paginationOptions.pageLast = (paginationOptions.pageLast === undefined) ? 0 : paginationOptions.pageLast + 1,
          viewsOptions.page = paginationOptions.pageLast;

        return retreiveBusinesses(viewsOptions);
      }
      //no more nodes to load
      else {
        defer.resolve(businesses);
      }

      return defer.promise;
    }

    //retrieves businesses from view and handle pagination
    function retreiveBusinesses(viewsOptions) {
      console.log("retreiveBusinesses");
      paginationOptions.pageLast = (paginationOptions.pageLast === undefined) ? 0 : paginationOptions.pageLast;
      var defer = $q.defer();
      ViewsResource
        .retrieve(viewsOptions)
        .then(
        function (response) {
          if (response.data.length != 0) {
            businesses = mergeItems(response.data, businesses, undefined, prepareBusiness);
          }

          if (response.data.length == 0) {
            viewsOptions.page--;
            paginationOptions.pageLast = viewsOptions.page;
            paginationOptions.maxPage = viewsOptions.page;
          }

          defer.resolve(businesses);
        }
      )
        .catch(
        function (error) {
          defer.reject(error);
        }
      );

      return defer.promise;

    }

    //saves business and optional image
    //returns promise
    function saveBusiness(business) {
      console.log("saveBusiness");

      var preparedBusiness = angular.merge({}, business);

      var field_biz_geocodeData = {
        bottom : "48.193302200000",
        geo_type : "point",
        geohash : "u2ed5v743dstd",
        geom : "POINT (16.3408603 48.1933022)",
        lat: "48.193302200000",
        left: "16.340860300000",
        lon: "16.340860300000",
        right: "16.340860300000",
        top: "48.193302200000"
      };

      preparedBusiness.field_biz_geocodeData = DrupalHelperService.structureField(field_biz_geocodeData);


      return trySaveOptionalImage()
        .then(
        function (result) {
          preparedBusiness.field_image = DrupalHelperService.structureField({fid: result.data.fid});
        },
        function (error) {
          //resolve without image
          return $q.resolve(true);
        }
      )
      .finally(
        function () {
          return NodeResource.create(preparedBusiness);
        }
      );

      ///////////


      //returns promise
      // - resolve after saved image to server
      // - rejects if saving image fails or no image given
      function trySaveOptionalImage() {
        console.log("trySaveOptionalImage");
        return $q.reject(false);
        //if data is given
        if (preparedBusiness.field_image.base64) {

          var imgData = preparedBusiness.field_image.base64;
          delete preparedBusiness.field_image.base64;

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

    }

    function deleteBusiness(business) {
      console.log("deleteBusiness");
      return NodeResource.delete(business);
    }

    function mergeItems(newItems, currentItems , type, callback) {
      console.log("mergeItems");

      callback = (typeof(callback) === "function")?callback:function(obj) {return obj;};

      if(!type) {
        var uniqueNodes = [];
        var isUnique;
        angular.forEach(newItems, function(newItems) {
          isUnique = true;
          angular.forEach(currentItems, function(currentItem, key) {
            if(newItems.nid == currentItem.nid) { isUnique = false; }
          }, isUnique);

          if(isUnique) {
            uniqueNodes.push(callback(newItems));
          }
        }, uniqueNodes);

        currentItems =  uniqueNodes.concat(currentItems);

        return currentItems;
      }
      else {
        angular.forEach(newItems, function(newItem) {
          //@TODO add this to if => || currentItems[newItem[type]].updated > newItem.updated
          if(!currentItems[newItem[type]] ) {
            currentItems[parseInt(newItem[type])] = callback(newItem);
          }

        });
        return currentItems;
      }
    }

      
    //returns all business terms
    //@TODO implement exposed filters for request and cache like in get
    function getAllBusinessCat() {
      console.log("getAllBusinessCat");
      var defer_bc = $q.defer(),
      allTaxonomy = undefined;
      if (business_categories.length > 0) {
        allTaxonomy = business_categories;
      } else {
        allTaxonomy = undefined;
      }

      if (allTaxonomy != undefined) {
        defer_bc.resolve(allTaxonomy);
      }
      else {
        return retreiveBusinessCategory(viewsOptions_bc);;
      }

      return defer_bc.promise;
    }


    //retrieves business terms from services and handle pagination
    function retreiveBusinessCategory() {
      console.log("retreiveBusinessCategory");
      console.log("viewsOptions_bc: " + JSON.stringify(viewsOptions_bc));
      console.log("paginationOptions: " + JSON.stringify(paginationOptions));
      paginationOptions.pageLast = (paginationOptions.pageLast === undefined) ? 0 : paginationOptions.pageLast;
      var defer_bc = $q.defer();
      ViewsResource
        .retrieve(viewsOptions_bc)
        .then(
        function (response) {
          if (response.data.length != 0) {   
            business_categories = response.data;
            //alert(JSON.stringify(business_categories));
            business_categories = mergeItems(response.data, business_categories, undefined, prepareBusiness);
            //return business_categories;
          }

          if (response.data.length == 0) {
            viewsOptions_bc.page--;
            paginationOptions.pageLast = viewsOptions_bc.page;
            paginationOptions.maxPage = viewsOptions_bc.page;
          }

          defer_bc.resolve(business_categories);
        }
      )
        .catch(
        function (error) {
          defer_bc.reject(error);
        }
      );

      return defer_bc.promise;

    }

    
    //returns all keywords terms
    //@TODO implement exposed filters for request and cache like in get
    function getAllKeywords() {
      console.log("getAllKeywords");
      var defer_kw = $q.defer(),
      allTaxonomy = undefined;
      if (keywords.length > 0) {
        allTaxonomy = keywords;
      } else {
        allTaxonomy = undefined;
      }

      if (allTaxonomy != undefined) {
        defer_kw.resolve(allTaxonomy);
      }
      else {
        return retreiveKeywords(viewsOptions_kw);
      }

      return defer_kw.promise;
    }


    //retrieves keywords terms from services and handle pagination
    function retreiveKeywords() {
      console.log("retreiveKeywords");
      console.log("viewsOptions: " + JSON.stringify(viewsOptions_kw));
      console.log("paginationOptions: " + JSON.stringify(paginationOptions));
      paginationOptions.pageLast = (paginationOptions.pageLast === undefined) ? 0 : paginationOptions.pageLast;
      var defer_kw = $q.defer();
      ViewsResource
        .retrieve(viewsOptions_kw)
        .then(
        function (response) {
          if (response.data.length != 0) {   
            keywords = response.data;
            //alert(JSON.stringify(keywords));
            //business_categories = mergeItems(response.data, keywords, undefined, prepareBusiness);
            //return business_categories;
          }

          if (response.data.length == 0) {
            viewsOptions_kw.page--;
            paginationOptions.pageLast = viewsOptions_kw.page;
            paginationOptions.maxPage = viewsOptions_kw.page;
          }

          defer_kw.resolve(keywords);
        }
      )
        .catch(
        function (error) {
          defer_kw.reject(error);
        }
      );

      return defer_kw.promise;

    }

    
    //returns all chiefdoms terms
    //@TODO implement exposed filters for request and cache like in get
    function getAllChiefdoms(parent_term_id = 0) {
      console.log("getAllChiefdoms");
      var defer_cd = $q.defer(),
      allTaxonomy = undefined;
      if (chiefdoms.length > 0) {
        allTaxonomy = chiefdoms;
      } else {
        allTaxonomy = undefined;
      }

      if (allTaxonomy != undefined) {
        defer_cd.resolve(allTaxonomy);
      }
      else {
        return retreiveChiefdoms(parent_term_id);
      }

      return defer_cd.promise;
    }


    //retrieves chiefdoms terms from services and handle pagination
    function retreiveChiefdoms(parent_term_id) {
      if(parent_term_id > 0) {
        viewsOptions_kw.view_name += "/" + parent_term_id;
      }
      console.log("retreiveChiefdoms");
      console.log("viewsOptions: " + JSON.stringify(viewsOptions_cd));
      console.log("paginationOptions: " + JSON.stringify(paginationOptions));
      paginationOptions.pageLast = (paginationOptions.pageLast === undefined) ? 0 : paginationOptions.pageLast;
      var defer_cd = $q.defer();
      ViewsResource
        .retrieve(viewsOptions_cd)
        .then(
        function (response) {
          if (response.data.length != 0) {   
            chiefdoms = response.data;
            //alert(JSON.stringify(chiefdoms));
            //business_categories = mergeItems(response.data, keywords, undefined, prepareBusiness);
            //return business_categories;
          }

          if (response.data.length == 0) {
            viewsOptions_cd.page--;
            paginationOptions.pageLast = viewsOptions_cd.page;
            paginationOptions.maxPage = viewsOptions_cd.page;
          }

          defer_cd.resolve(chiefdoms);
        }
      )
        .catch(
        function (error) {
          defer_cd.reject(error);
        }
      );

      return defer_cd.promise;

    }

    //returns all child terms
    //@TODO implement exposed filters for request and cache like in get
    function getAllChildterm(viewsOptions) {
      console.log("getAllChildterm");
      var defer_ct = $q.defer(),
      allTaxonomy = undefined;
      

      if (allTaxonomy != undefined) {
        defer_ct.resolve(allTaxonomy);
      }
      else {
        return retreiveChildterm(viewsOptions);
      }

      return defer_ct.promise;
    }


    //retrieves child terms from services and handle pagination
    function retreiveChildterm(viewsOptions) { 
      console.log("retreiveChildterm");
      console.log("viewsOptions: " + JSON.stringify(viewsOptions));
      console.log("paginationOptions: " + JSON.stringify(paginationOptions));
      paginationOptions.pageLast = (paginationOptions.pageLast === undefined) ? 0 : paginationOptions.pageLast;
      var defer_ct = $q.defer();
      ViewsResource
        .retrieve(viewsOptions)
        .then(
        function (response) {
          if (response.data.length != 0) {   
            childterms = response.data;
            //alert(JSON.stringify(childterms));
            //business_categories = mergeItems(response.data, keywords, undefined, prepareBusiness);
            //return business_categories;
          }

          if (response.data.length == 0) {
            viewsOptions_cd.page--;
            paginationOptions.pageLast = viewsOptions_cd.page;
            paginationOptions.maxPage = viewsOptions_cd.page;
          }

          defer_ct.resolve(childterms);
        }
      )
      .catch(
        function (error) {
          defer_ct.reject(error);
        }
      );

      return defer_ct.promise;

    }
    
    
    function retrieveparents(data) {
      url = DrupalApiConstant.drupal_instance + "custom-api/get-parent-term/" + data.tid;
      config = {};
      var defer = $q.defer();
      $http.post(url, data, config)
      .success(function (data) {
          defer.resolve(data);
      })
      .catch(function (error) {
          defer.reject(error);
      });

      return defer.promise; 
    }
    
    //Update business and optional image
    //returns promise
    function updateBusiness(business) {
      console.log("updateBusiness");

      var preparedBusiness = angular.merge({}, business);

      var field_biz_geocodeData = {
        bottom : "48.193302200000",
        geo_type : "point",
        geohash : "u2ed5v743dstd",
        geom : "POINT (16.3408603 48.1933022)",
        lat: "48.193302200000",
        left: "16.340860300000",
        lon: "16.340860300000",
        right: "16.340860300000",
        top: "48.193302200000"
      };

      preparedBusiness.field_biz_geocodeData = DrupalHelperService.structureField(field_biz_geocodeData);


      return trySaveOptionalImage()
        .then(
        function (result) {
          preparedBusiness.field_image = DrupalHelperService.structureField({fid: result.data.fid});
        },
        function (error) {
          //resolve without image
          return $q.resolve(true);
        }
      )
      .finally(
        function () {
          return NodeResource.update(preparedBusiness);
        }
      );

      ///////////


      //returns promise
      // - resolve after saved image to server
      // - rejects if saving image fails or no image given
      function trySaveOptionalImage() {
        console.log("trySaveOptionalImage");
        return $q.reject(false);
        //if data is given
        if (preparedBusiness.field_image.base64) {

          var imgData = preparedBusiness.field_image.base64;
          delete preparedBusiness.field_image.base64;

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

    };

  }

})();
