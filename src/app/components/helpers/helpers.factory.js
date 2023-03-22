(function () {
  'use strict';

  angular
    .module('evenstrangerthings')
    .factory('Helpers', Helpers);

  /** @ngInject */
  function Helpers($log) {

    // correct rotation of user image by temporarily 
    // rendering as an image element (thereby using 
    // browser to correct on EXIF data)

    function loadImage(file, callback) {
      var image = document.createElement('img');
      image.onload = function () {
        URL.revokeObjectURL(image.src);
        callback(image);
      };
      image.onerror = function () {
        URL.revokeObjectURL(image.src);
        $log.log('Incorrect image format.');
      };
      image.src = file;
    }

    function correctImage(file, callback) {
      loadImage(file, function (image) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);
        try {
          // var correctedData = canvas.toDataURL('image/jpeg', 1.0);
          callback(canvas);
        } catch (e) {
          $log.log('Save image error.');
          $log.log(e);
        }
      });
    }

    return {
      correctImageRotation: function (image, callback) {

        correctImage(image, function (data) {

          callback(data);

        });

      },

      // proportionally resize canvas element to desired width 

      resizeCanvas: function (canvas, desiredWidth) {
        var resized = document.createElement('canvas');
        var ctx = resized.getContext('2d');

        var ratio = canvas.width / canvas.height;
        var newHeight = desiredWidth / ratio;

        resized.width = desiredWidth;
        resized.height = newHeight;

        ctx.drawImage(canvas, 0, 0, desiredWidth, newHeight);
        return resized;
      }

    }

  }

})();
