;
(function () {
  'use strict';
  angular
    .module('drupalionicDemo.config', ['d7-services.commons.configurations', 'd7-services.commons.http.configurations'])
    .config(configFunction);
    configFunction.$inject = ['DrupalApiConstant'];

    /** @ngInject */
    function configFunction(DrupalApiConstant) {
      //drupal services configurations
      DrupalApiConstant.drupal_instance = 'http://localhost/2016slbrapp/ionic-d7/slbizreviewslinode/docroot/';
      DrupalApiConstant.api_endpoint += 'v1/slbiz/';
    }
})();
