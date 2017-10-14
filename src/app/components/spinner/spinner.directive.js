(function() {
  'use strict';

  angular
    .module('evenstrangerthings')
    .directive('spinner', spinner);

  /** @ngInject */
  function spinner() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/spinner/spinner.html',
      scope: {
          creationDate: '='
      },
      controller: SpinnerController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function SpinnerController() {
      var vm = this;

    }
  }

})();
