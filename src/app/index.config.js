(function() {
  'use strict';

  angular
    .module('evenstrangerthings')
    .config(config);

  /** @ngInject */
  function config($logProvider) {
    // Enable log
    $logProvider.debugEnabled(true);

  
  }

})();
