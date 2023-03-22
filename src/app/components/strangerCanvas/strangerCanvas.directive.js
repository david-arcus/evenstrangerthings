(function () {
    'use strict';

    angular
        .module('evenstrangerthings')
        .directive('strangerCanvas', strangerCanvas);

    /** @ngInject */
    function strangerCanvas() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/strangerCanvas/strangerCanvas.html',
            scope: {
                renderToCanvas: '=',
                userImage: '=',
                userText: '=',
                displayWidth: '='
            },
            controller: StrangerCanvasController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        /** @ngInject */
        function StrangerCanvasController($scope) {

            var vm = this;
            var canvas = document.getElementById('preview');
            var ctx = canvas.getContext('2d');

            $scope.$watch('vm.renderToCanvas', function (ready) {

                if (ready) {
                    drawFinalImage(vm.userImage, vm.displayWidth);
                    drawTextOnCanvas(vm.userText);
                }

                vm.renderToCanvas = false;
            });

            function drawTextOnCanvas(text) {

                var fontSize = fitTextOnCanvas(text, 491);
                var lighting = document.getElementById('lighting-small');

                ctx.textBaseline = 'top';
                ctx.shadowColor = 'rgba(215,21,0, 1)';
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 7;
                ctx.font = fontSize + 'px Benguiat';
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(255,0,7)';
                ctx.strokeText(text, 254, 805);
                ctx.shadowBlur = 5;
                ctx.strokeText(text, 254, 805);

                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.6;
                ctx.globalCompositeOperation = 'multiply';
                ctx.drawImage(lighting, 54, 574, 853, 568);

            }

            function fitTextOnCanvas(text, width) {

                // start with a large font size
                var fontSize = 300;

                // lower the font size until the text fits the canvas
                do {
                    fontSize--;
                    ctx.font = fontSize + 'px Benguiat';
                } while (ctx.measureText(text).width > width)

                // draw the text
                ctx.fillText(text, 0, 0);

                return fontSize;

            }

            function drawFinalImage(imageToDisplay, displayWidth) {

                var yc = document.createElement('canvas');
                var yctx = yc.getContext('2d');

                var background = document.getElementById('canvas-background');
                var mask = document.getElementById('mask');

                canvas.width = displayWidth;
                canvas.height = displayWidth;

                yc.width = displayWidth;
                yc.height = displayWidth;

                yctx.drawImage(mask, 0, 0, displayWidth, displayWidth);
                yctx.globalCompositeOperation = 'source-in';

                drawImageProp(yctx, imageToDisplay, 0, 0, displayWidth, displayWidth);

                ctx.drawImage(background, 0, 0, displayWidth, displayWidth);

                ctx.globalCompositeOperation = 'overlay';
                ctx.drawImage(yc, 0, 0, displayWidth, displayWidth);

                ctx.globalCompositeOperation = 'normal';


            }

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
                offsetX = angular.isNumber(offsetX) ? offsetX : 0.5;
                offsetY = angular.isNumber(offsetY) ? offsetY : 0.5;

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
                ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
            }

        }
    }

})();
