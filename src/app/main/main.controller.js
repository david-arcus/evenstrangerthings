(function() {
  'use strict';

  angular
    .module('evenstrangerthings')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, $log, $window, $location, $rootScope, Api, Upload, Environment) {

    var vm = this;

    vm.gotResponse = false;
    vm.loading = false;
    vm.base64Image = '';
    vm.previewImage = '';

    var canvas = document.getElementById('preview'),
     canvasContainer = document.querySelector('.canvas-container'),
     ctx = canvas.getContext('2d'),
     oc = document.createElement('canvas'),
     octx = oc.getContext('2d'),
     img = new Image(),
     postImage,
     reader = new FileReader(),
     srcOrientation

    var ENV = Environment.apiURL;

    vm.upload = function (file) {

      vm.loading = true;
      vm.gotResponse = false;
      vm.success = false;

      getOrientation(file, function(orientation) {
        srcOrientation = orientation;
      });

      reader.onload = function(event) {

        img.onload = function() {

          rotateFromEXIF(img, 600, canvas, ctx, false);    // rotate for preview on screen

          rotateFromEXIF(img, 300, oc, octx, true);       // rotate to send to our doggy face detector

          postImage = oc.toDataURL('image/jpeg', 0.8); // post image is compressed and resized via js

          Api.postImage(postImage).then(function(result) {

            vm.loading = false;

            if (result.data.status=='success') {

              $log.debug(result.data);
              vm.success = true;

            } else {

              alert('Something went wrong :(');
              vm.success = false;

            }

          });

        }

        img.src = event.target.result;

      }

      if (file != null) {

        reader.readAsDataURL(file);

      }
      //return;

    };

    function rotateFromEXIF(img, width, canvas, ctx, isUpload) {

      // if (width > img.width) {
      //   width = img.width;
      // }

      var height = img.height * (width/img.width);

      // set proper canvas dimensions before transform & export
      if ([5,6,7,8].indexOf(srcOrientation) > -1) {

       // portrait

       // make sure our uploaded image is 300 pixels wide at all costs

       if (isUpload) {

         canvas.width = 300;

         var ratio = 1/(img.height/img.width);

         canvas.height = parseInt(300 * ratio);

         height = 300;
         width = canvas.height;


       } else {

         canvas.width = height;
         canvas.height = width;

       }

      } else {

       canvas.width = width;
       canvas.height = height;

      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, width, height ); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, height ); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, height, width); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
        default: ctx.transform(1, 0, 0, 1, 0, 0);
      }

      ctx.drawImage(img, 0, 0, width, height);

    }


    function getOrientation(file, callback) {

      var reader = new FileReader();

      reader.onload = function(event) {
        var view = new DataView(event.target.result);

        if (view.getUint16(0, false) != 0xFFD8) return callback(-2);

        var length = view.byteLength,
            offset = 2;

        while (offset < length) {
          var marker = view.getUint16(offset, false);
          offset += 2;

          if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) {
              return callback(-1);
            }
            var little = view.getUint16(offset += 6, false) == 0x4949;
            offset += view.getUint32(offset + 4, little);
            var tags = view.getUint16(offset, little);
            offset += 2;

            for (var i = 0; i < tags; i++)
              if (view.getUint16(offset + (i * 12), little) == 0x0112)
                return callback(view.getUint16(offset + (i * 12) + 8, little));
          }
          else if ((marker & 0xFF00) != 0xFF00) break;
          else offset += view.getUint16(offset, false);
        }
        return callback(-1);
      };

      if (file != null) {

        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));

      }

    };

  }
})();
