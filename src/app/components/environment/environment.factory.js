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

      case 'evenstrangerthings.s3-website-us-east-1.amazonaws.com' :
      default :
        path = "http://dapi.us-east-1.elasticbeanstalk.com/api";
      break;
    }

    var environment = {
      'mode':'production',
      'apiURL':path,

    };

    return environment;

  }

})();
