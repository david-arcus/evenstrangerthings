(function() {
  'use strict';

  angular
    .module('evenstrangerthings')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($log, $scope, Api, Upload, Environment) {

    var vm = this;

        vm.gotResponse = false;
        vm.loading = false;
        vm.base64Image = '';
        vm.previewImage = '';
        vm.allAssetsLoaded = false;

    var img = new Image(),
        postImage,
        reader = new FileReader(),
        srcOrientation,
        size = 1000,
        manifest,
        preload;

    var ENV = Environment.apiURL;

    // now all our canvas elements

    var zc      = document.createElement('canvas'),
        zctx    = zc.getContext('2d'),

        yc      = document.createElement('canvas'),
        yctx    = yc.getContext('2d'),

        oc      = document.createElement('canvas'),
        octx    = oc.getContext('2d'),

        canvas  = document.getElementById('preview'),
        ctx     = canvas.getContext('2d'),

        canvasContainer = document.querySelector('.canvas-container');

    preloadAssets();

    function preloadAssets() {

      manifest = [
        'assets/images/tv.png',
        'assets/images/upload-an-image.png',
        'assets/images/loading.gif',
        'assets/images/canvas-placeholder.png',
        'assets/images/canvas-background.png',
        'assets/images/mask.png',
        'assets/images/lighting-small.png'
      ];

      preload = new createjs.LoadQueue(true, '/');

      preload.on('complete', handleComplete);
      preload.loadManifest(manifest, true, "/");


    };

    function handleComplete() {

      $scope.$apply(function() {
        vm.allAssetsLoaded = true;

      });

    }

    vm.upload = function (file) {

      vm.loading = true;
      vm.gotResponse = false;
      vm.success = false;

      getOrientation(file, function(orientation) {
        srcOrientation = orientation;
      });

      reader.onload = function(event) {

        img.onload = function() {

          rotateFromEXIF(img, size, zc, zctx, false);      // rotate in a temporary canvas to put in our final canvas

          rotateFromEXIF(img, 640, oc, octx, true);       // rotate to send to a different planet

          postImage = oc.toDataURL('image/jpeg', 0.6);    // post image is compressed and resized via js

          Api.postImage(postImage).then(function(result) {

            vm.loading = false;

            // not the angular way #uwotmate
            document.querySelector('.hero').classList.add('hide');
            document.querySelector('.lighting').classList.add('hide');
            document.querySelector('.desc').classList.add('hide');
            document.querySelector('.upload').classList.add('hide');
            document.querySelector('.canvas-container').classList.add('show');

            if (result.data.status=='success') {

              $log.debug(result.data);
              vm.success = true;

              drawTextOnCanvas(result);

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

    function drawTextOnCanvas(result) {

      var fontSize = fitTextOnCanvas(result.data.results[0].toUpperCase(), 491);
      var lighting = document.getElementById('lighting-small');

      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(215,21,0, 1)';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 7;
      ctx.font = fontSize + 'px Benguiat';
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(255,0,7)';
      ctx.strokeText(result.data.results[0].toUpperCase(), 254, 805);
      ctx.shadowBlur = 5;
      ctx.strokeText(result.data.results[0].toUpperCase(), 254, 805);
      // ctx.shadowBlur = 2;
      // ctx.strokeText(result.data.results[0].toUpperCase(), 254, 805);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.6;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(lighting, 54, 574, 853, 568);

    }

    function fitTextOnCanvas(text, width){

      // start with a large font size
      var fontSize=300;

      // lower the font size until the text fits the canvas
      do {
          fontSize--;
          ctx.font = fontSize + 'px Benguiat';
      } while(ctx.measureText(text).width > width)

      // draw the text
      ctx.fillText(text, 0, 0);

      return fontSize;

    }

    function rotateFromEXIF(img, width, canvas, ctx, isUpload) {

      // if (width > img.width) {
      //   width = img.width;
      // }

      var height = img.height * (width/img.width);

      // set proper canvas dimensions before transform & export
      if ([5,6,7,8].indexOf(srcOrientation) > -1) {

       // portrait

       // make sure our uploaded image is 640 pixels wide at all costs

       if (isUpload) {

         canvas.width = 640;

         var ratio = 1/(img.height/img.width);

         canvas.height = parseInt(640 * ratio);

         height = 640;
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

      if (!isUpload) {

        drawFinalImage();

      }

    }

    function drawFinalImage(width, height) {

      var background = document.getElementById('canvas-background');
      var mask = document.getElementById('mask');

      canvas.width = size;
      canvas.height = size;

      yc.width = size;
      yc.height = size;

      yctx.drawImage(mask, 0, 0, size, size);
      yctx.globalCompositeOperation = 'source-in';

      drawImageProp(yctx, zc, 0, 0, size, size);

      ctx.drawImage(background, 0, 0, size, size);

      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(yc, 0, 0, size, size);

      ctx.globalCompositeOperation = 'normal';


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

    /**
     * By Ken Fyrstenberg Nilsen
     *
     * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
     *
     * If image and context are only arguments rectangle will equal canvas
    */
    function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

        if (arguments.length === 2) {
            x = y = 0;
            w = ctx.canvas.width;
            h = ctx.canvas.height;
        }

        // default offset is center
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;

        // keep bounds [0.0, 1.0]
        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;

        var iw = img.width,
            ih = img.height,
            r = Math.min(w / iw, h / ih),
            nw = iw * r,   // new prop. width
            nh = ih * r,   // new prop. height
            cx, cy, cw, ch, ar = 1;

        // decide which gap to fill
        if (nw < w) ar = w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
        nw *= ar;
        nh *= ar;

        // calc source rectangle
        cw = iw / (nw / w);
        ch = ih / (nh / h);

        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;

        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;

        // fill image in dest. rectangle
        ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
    }

  }
})();
