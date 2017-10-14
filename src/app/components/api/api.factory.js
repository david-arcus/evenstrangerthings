(function() {
  'use strict';

  // return an environment variable and url

  angular
    .module('evenstrangerthings')
    .factory('Api', Api);

  /** @ngInject */
  function Api($log, $http, Environment) {

    var ENV = Environment.apiURL;

    return {
      postImage: function (image) {

        return $http.post(ENV + '/describe-image', {
          image: image
        });

      }

    };

  }

})();
