(function() {
  'use strict';

  angular
    .module('evenstrangerthings')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
