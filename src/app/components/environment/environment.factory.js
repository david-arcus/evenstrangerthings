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
        path = "http://localhost:8000/api";
        break;

      case 'http://13.55.9.100/' :
      default :
        path = "/api";
      break;
    }

    var environment = {
      'mode':'production',
      'apiURL':path,

    };

    return environment;

  }

})();
