(function () {
    'use strict';

    angular
        .module('evenstrangerthings')
        .directive('showImageLabels', showImageLabels);

    /** @ngInject */
    function showImageLabels() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/showImageLabels/showImageLabels.html',
            scope: {
                renderToCanvas: '=',
                imageLabels: '='
            },
            controller: ShowImageLabelsController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        /** @ngInject */
        function ShowImageLabelsController($window, $scope, $log) {

            var vm = this;
            var i = 0;
            var speed = 50;
            var typewriter = document.getElementById("typewriter");
            var timeoutID;

            $scope.$watch('vm.renderToCanvas', function (ready) {

                i = 0;
                vm.renderToCanvas = false;
                typewriter.innerHTML = '';

                if (ready) {

                    // $log.log(vm.imageLabels);

                    var labels = vm.imageLabels.map(function(item) {
                        return item.description;
                    })

                    var output = "I saw: " + labels.join(', ');

                    function typeWriter() {

                        if (i < output.length) {
                            typewriter.innerHTML += output.charAt(i);
                            i++;
                            timeoutID = $window.setTimeout(typeWriter, speed);
                        } else {
                            $window.clearTimeout(timeoutID);
                        }
                    }

                    typeWriter();

                }
            })
        }
    }

})();
