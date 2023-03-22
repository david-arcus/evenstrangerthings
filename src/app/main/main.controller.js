(function () {
  'use strict';

  angular
    .module('evenstrangerthings')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $window, $log, Api, Helpers) {

    var vm = this;
    var UPLOAD_WIDTH = 650;

    vm.gotResponse = false;
    vm.loading = false;
    vm.allAssetsLoaded = false;
    vm.renderToCanvas = false;
    vm.userText = null;
    vm.userImage = null;
    vm.displayWidth = 1000;
    vm.showCanvas = false;  
    vm.imageLabels = null;  

    preloadAssets();

    vm.upload = function (file) {

      vm.loading = true;
      vm.gotResponse = false;
      vm.success = false;

      var img = new Image();
      var reader = new FileReader();

      reader.onload = function (event) {
        img.onload = function () {
          // correct the image orientation of the user image
          Helpers.correctImageRotation(img.src, function (correctedImage) {
            resizeImage(correctedImage);
          });
        }
        img.src = event.target.result;
      }

      if (file != null) {
        reader.readAsDataURL(file);
      }

    };

    vm.goAgain = function () {

      vm.showCanvas = false;

    }

    function preloadAssets() {

      var manifest = [
        'assets/images/tv.png',
        'assets/images/upload-an-image.png',
        'assets/images/loading.gif',
        'assets/images/canvas-placeholder.png',
        'assets/images/canvas-background.png',
        'assets/images/mask.png',
        'assets/images/lighting-small.png'
      ];

      var preload = new createjs.LoadQueue(true, '/');

      preload.on('complete', imagesLoaded);
      preload.loadManifest(manifest, true, "/");

    }

    function imagesLoaded() {

      $scope.$apply(function () {
        vm.allAssetsLoaded = true;
      });

    }

    function resizeImage(correctedImage) {

      $scope.$apply(function () {

        // upload a lower res version of image to cloud vision api
        var imageToUpload = Helpers.resizeCanvas(correctedImage, UPLOAD_WIDTH);
        // resize user image for display on canvas
        var imageToDisplay = Helpers.resizeCanvas(correctedImage, vm.displayWidth);

        getImageLabels(imageToUpload, imageToDisplay);

      });

    }

    function getImageLabels(imageToUpload, imageToDisplay) {

      var postImage = imageToUpload.toDataURL('image/jpeg', 0.6);

      Api.postImage(postImage).then(function (result) {

        vm.loading = false;
        vm.showCanvas = true;

        // $log.log(result.statusText);
        // $log.log(result);

        if (result.status == 200) {

            // scoped properties to be used in our stranger canvas directive
            vm.success = true;
            vm.renderToCanvas = true;
            vm.userImage = imageToDisplay;
            vm.userText = result.data[0].description.toUpperCase();
            vm.imageLabels = result.data;

        } else {

          // $log.log(result);
          alert('Something went wrong :(');
          vm.success = false;

        }

      }).catch(function () {

        // quick fix to deal with cloud vision api rate limit
        alert('This site is too busy right now :( Please try again, or come back later.');
        $window.location.reload();

      });

    }

  }
})();
