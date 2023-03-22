(function() {
  'use strict';

  // return an environment variable and url

  angular
    .module('evenstrangerthings')
    .factory('Environment', Environment);

  /** @ngInject */
  function Environment($log, $location) {

    var path;
    var host = $location.host();

    switch(host)
    {
      case 'localhost' :
        path = "http://127.0.0.1:5001/even-stranger-things/us-central1/getImageAnnotations";
        break;

      default :
        path = "https://us-central1-even-stranger-things.cloudfunctions.net/getImageAnnotations";
      break;
    }

    var environment = {
      'mode':'production',
      'apiURL':path,

    };

    return environment;

  }

})();
