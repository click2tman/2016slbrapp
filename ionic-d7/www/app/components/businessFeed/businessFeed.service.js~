;
(function () {

  angular
    .module('drupalionicDemo.businessFeed.service', [])
    .factory('BusinessFeedService', BusinessFeedService);

  BusinessFeedService.inject = ['$q', '$filter', 'DrupalApiConstant', 'DrupalHelperService', 'ViewsResource', 'FileResource', 'NodeResource', 'AuthenticationService']

  function BusinessFeedService($q, $filter, DrupalApiConstant, DrupalHelperService, ViewsResource, FileResource, NodeResource, AuthenticationService) {

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

    //businessFeed service object
    var businessFeedService = {
      init: init,
      getAll: getAll,
      get: get,
      loadRecent: loadRecent,
      loadMore: loadMore,
      saveBusiness: saveBusiness,
      deleteBusiness: deleteBusiness
    }

    return businessFeedService;

    /////////////////////////////////////////////////////////////

    function init() {
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
      var defer = $q.defer(),
        allFilteredSpots = undefined;
      if (businesses.length > 0) {
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
      if (paginationOptions.pageFirst > 0) {
        paginationOptions.pageFirst = 0;
      }
      viewsOptions.page = paginationOptions.pageFirst;

      return retreiveBusinesses(viewsOptions);
    }

    //loads businesses and adds to businesses array
    function loadMore() {
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
      return NodeResource.delete(business);
    }

    function mergeItems(newItems, currentItems , type, callback) {

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
    };


  }


})();
