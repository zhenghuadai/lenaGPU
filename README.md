# lenaGPU

[GPU](https://github.com/gpujs/gpu.js) implentation of [lena.js](https://codeclimate.com/github/davidsonfellipe/lena.js)

## Demo

http://zhenghuadai.github.io/lenaGPU.html

## Tutorials
```javascript
var lenaGPU = new LenaGPU({width: 512, height: 512});
let img     = $('#image000')[0];  // source image
let canvas  = $('#canvasGPU')[0]; // destination canvas
lenaGPU.gaussian(img, canvas);    // input: img;  output: canvas
```
```javascript
var lenaGPU = new LenaGPU({width: 512, height: 512});
let canvasSRC = $('#CanvasCPU')[0];  // source canvas 
let canvasDst  = $('#canvasGPU')[0]; // destination canvas
lenaGPU.gaussian(canvasSRC, canvasDst);    // input: canvasSRC;  output: canvasDst 
```
LenaGPU.__proto__:
```javascript
bigGaussian      : ƒ (image, dstCanvas)
blue             : ƒ (image, dstCanvas)
flip             : ƒ (image, dstCanvas)
gaussian         : ƒ (image, dstCanvas)
grayscale        : ƒ (image, dstCanvas)
green            : ƒ (image, dstCanvas)
highpass         : ƒ (image, dstCanvas)
invert           : ƒ (image, dstCanvas)
laplacian        : ƒ (image, dstCanvas)
lowpass3         : ƒ (image, dstCanvas)
lowpass5         : ƒ (image, dstCanvas)
mirror           : ƒ (image, dstCanvas)
prewittHorizontal: ƒ (image, dstCanvas)
prewittVertical  : ƒ (image, dstCanvas)
red              : ƒ (image, dstCanvas)
roberts          : ƒ (image, dstCanvas)
sepia            : ƒ (image, dstCanvas)
sharpen          : ƒ (image, dstCanvas)
sobelHorizontal  : ƒ (image, dstCanvas)
sobelVertical    : ƒ (image, dstCanvas)
dct              : ƒ (image)            // return a texture
idct             : ƒ (dct_texture)      // dct_texture is the texture returned by dct
convolution      : ƒ convolution(image, weights, dstCanvas)
filterImage      : ƒ filterImage(image, filtername, dstCanvas)
canny            : ƒ canny(image, dstCanvas, ...rest)

// The input image can be:
// HTMLImage
// HTMLCanvas
// Array2D(4)
// GLTextureArray4Float2D
```

## License

Code is under [MIT](http://davidsonfellipe.mit-license.org) license

