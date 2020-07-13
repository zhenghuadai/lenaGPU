/*
 *  lena-gpu.js - v0.1.0
 *  Library for image processing by GPU.js
 *  https://github.com/zhenghuadai/lenaGPU
 *  Under MIT License
 */
(function(win) {
var ffunc = {
    filterDataFunc: function(canvas, filter, w, h) {
        var r = 0, g = 0, b = 0, a = 1.0;
        var fw = this.constants.fw;
        var fh = this.constants.fh;
        var fw2 = this.constants.fw2;
        var fh2 = this.constants.fh2;
        for (var i = 0; i < fh; i++) {
            for (var j = 0; j < fw; j++) {
                var pos = ((this.thread.y - fh2 + i) * w +
                           (this.thread.x - fw2 + j)) *
                    4;
                r += canvas[pos + 0] * filter[i * fw + j];
                g += canvas[pos + 1] * filter[i * fw + j];
                b += canvas[pos + 2] * filter[i * fw + j];
            }
        }
        return exports(r, g, b, a);
    },

    filterFunc: function(image, filter) {
        var r = 0, g = 0, b = 0, a = 1.0;
        var fw = this.constants.fw;
        var fh = this.constants.fh;
        var fw2 = this.constants.fw2;
        var fh2 = this.constants.fh2;
        for (var i = 0; i < fh; i++) {
            for (var j = 0; j < fw; j++) {
                const pixel =
                    image[this.thread.y - fh2 + i][this.thread.x - fw2 + j];
                r += pixel[0] * filter[i * fw + j];
                g += pixel[1] * filter[i * fw + j];
                b += pixel[2] * filter[i * fw + j];
            }
        }
        // this.color(r, g, b, a);
        return exports(r, g, b, a);
    },
};
var gfunc = {
    gray: function(image, w, h) {
        var pixel = image[this.thread.y][this.thread.x];
        var r = pixel[0], g = pixel[1], b = pixel[2], a = pixel[3];
        var c = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // this.color(c, c, c, 1.0);
        return exports(c, c, c, 1.0);
    },
    thresholding: function(image, tlow, thigh) {
        var pixel = image[this.thread.y][this.thread.x];
        var r = pixel[0], g = pixel[1], b = pixel[2], a = pixel[3];
        var w = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if ((w > tlow) && (w < thigh)) {
        } else {
            r = g = b = 0;
        }
        // this.color(r, g, b, 1.0);
        return exports(r, g, b, 1.0);
    },
    thresholding2: function(image, tlow, thigh) {
        var pixel = image[this.thread.y][this.thread.x];
        var r = pixel[0], g = pixel[1], b = pixel[2], a = pixel[3];
        var w = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if ((w > tlow) && (w < thigh)) {
            r = g = b = 1.0;
        } else {
            r = g = b = 0;
        }
        // this.color(r, g, b, 1.0);
        return exports(r, g, b, 1.0);
    },

    invert: function(image, w, h) {
        var pixel = image[this.thread.y][this.thread.x];
        var r = 1.0 - pixel[0];
        var g = 1.0 - pixel[1];
        var b = 1.0 - pixel[2];
        // this.color(r, g, b, 1.0);
        return exports(r, g, b, 1.0);
    },
    red: function(image, w, h) {
        var pixel = image[this.thread.y][this.thread.x];
        // this.color(pixel[0], 0, 0, 1.0);
        return exports(pixel[0], 0, 0, 1.0);
    },
    green: function(image, w, h) {
        var pixel = image[this.thread.y][this.thread.x];
        return exports(0, pixel[1], 0, 1.0);
    },
    blue: function(image, w, h) {
        var pixel = image[this.thread.y][this.thread.x];
        return exports(0, 0, pixel[2], 1.0);
    },
    saturation: function(image, level) {
        var pixel = image[this.thread.y][this.thread.x];
        var RW = 0.3086, RG = 0.6084, RB = 0.0820;
        var RW0 = (1 - level) * RW + level;
        var RW1 = (1 - level) * RW;
        var RW2 = (1 - level) * RW;
        var RG0 = (1 - level) * RG;
        var RG1 = (1 - level) * RG + level
        var RG2 = (1 - level) * RG;
        var RB0 = (1 - level) * RB;
        var RB1 = (1 - level) * RB;
        var RB2 = (1 - level) * RB + level;

        var r = RW0 * pixel[0] + RG0 * pixel[1] + RB0 * pixel[2];
        var g = RW1 * pixel[0] + RG1 * pixel[1] + RB1 * pixel[2];
        var b = RW2 * pixel[0] + RG2 * pixel[1] + RB2 * pixel[2];
        return exports(r, g, b, 1.0);
    },
    sepia: function(image, w, h) {
        var pixel = image[this.thread.y][this.thread.x];
        var r = pixel[0], g = pixel[1], b = pixel[2], a = pixel[3];
        var s = 0.3 * r + 0.59 * g + 0.11 * b;
        return exports(
            s + 40.0 / 255.0, s + 20.0 / 255.0, s - 20.0 / 255.0, 1.0);
    },
    mirror: function(image, w, h) {
        var pixel = image[this.thread.y][w - this.thread.x];
        return exports(pixel[0], pixel[1], pixel[2], 1.0);
    },
    flip: function(image, w, h) {
        var pixel = image[h - this.thread.y][this.thread.x];
        return exports(pixel[0], pixel[1], pixel[2], 1.0);
    },
    passthrough: function(image, w, h) {
        var pixel = image[this.thread.y][this.thread.x];
        return exports(pixel[0], pixel[1], pixel[2], 1.0);
    },
};

cfunc = {
    gradient: function(canvas) {
        function dot3(a0, a1, a2, b0, b1, b2) {
            return a0 * b0 + a1 * b1 + a2 * b2;
        }
        var x = this.thread.x, y = this.thread.y;
        const pixel00 = canvas[y - 1 + 0][x - 1 + 0];
        const pixel01 = canvas[y - 1 + 0][x - 1 + 1];
        const pixel02 = canvas[y - 1 + 0][x - 1 + 2];
        const pixel10 = canvas[y - 1 + 1][x - 1 + 0];
        const pixel11 = canvas[y - 1 + 1][x - 1 + 1];
        const pixel12 = canvas[y - 1 + 1][x - 1 + 2];
        const pixel20 = canvas[y - 1 + 2][x - 1 + 0];
        const pixel21 = canvas[y - 1 + 2][x - 1 + 1];
        const pixel22 = canvas[y - 1 + 2][x - 1 + 2];
        var dx = 0;
        var dy = 0;
        // clang-format off
            dy = dot3(pixel00[0], pixel01[0], pixel02[0],  1.0/4,  2.0/4,  1.0/4)
               + dot3(pixel20[0], pixel21[0], pixel22[0], -1.0/4, -2.0/4, -1.0/4);
            dx = dot3(pixel00[0], pixel10[0], pixel20[0],  1.0/4,  2.0/4,  1.0/4)
               + dot3(pixel02[0], pixel12[0], pixel22[0], -1.0/4, -2.0/4, -1.0/4);
        // clang-format on

        var grad = 0;
        var dir = 0;
        grad = Math.sqrt(dx * dx + dy * dy);
        dir = Math.atan2(dy, dx);
        /*
        if ((dir >= -Math.PI / 8 && dir < Math.PI / 8) ||
            (dir <= -7 * Math.PI / 8 && dir > 7 * Math.PI / 8)) {
            dir = 0;
        } else if (
            (dir >= Math.PI / 8 && dir < 3 * Math.PI / 8) ||
            (dir <= -5 * Math.PI / 8 && dir > -7 * Math.PI / 8)) {
            dir = Math.PI / 4;
        } else if (
            (dir >= 3 * Math.PI / 8 && dir <= 5 * Math.PI / 8) ||
            (-3 * Math.PI / 8 >= dir && dir > -5 * Math.PI / 8)) {
            dir = Math.PI / 2;
        } else if (
            (dir < -Math.PI / 8 && dir >= -3 * Math.PI / 8) ||
            (dir > 5 * Math.PI / 8 && dir <= 7 * Math.PI / 8)) {
            dir = -Math.PI / 4;
        }
        */
        return exports(grad, dir, 0, 1.0);
        // this.color(dx, dx, dx, 1.0);
    },
    nonMaximumSuppression: function(image, grads) {
        var x = this.thread.x, y = this.thread.y;
        var fw = 5, fh = 5;
        var pixel00 = image[y][x];
        var r = pixel00[0];
        for (var i = 0; i < fh; i++) {
            for (var j = 0; j < fw; j++) {
                const pix = image[y - 2 + i][x - 2 + j];
                const grad = grads[y - 2 + i][x - 2 + i];
                const r0 = pix[0];
                const dir = grad[1];
                var angle = Math.atan2(i - 2, j - 2);
                const r1 = r0 * Math.abs(Math.cos(dir - angle));
                if (r1 > r) {
                    r = 0;
                }
            }
        }
        return exports(r * 2, r * 2, r * 2, 1.0);
    },
    dctrow: function(image, coe) {
        var x = this.thread.x, y = this.thread.y;
        var bx = Math.floor(x / 8) * 8;
        var by = Math.floor(y / 8) * 8
        var u = x % 0x8;
        var r = 0.0;
        var b = 0.0;
        var g = 0.0;
        for (var i = 0; i < 8; i++) {
            var pixel = image[y][bx + i];
            r += pixel[0] * coe[u][i];
            g += pixel[1] * coe[u][i];
            b += pixel[2] * coe[u][i];
        }
        return exports(r, g, b, 1.0);
    },
    dctcol: function(image, coe) {
        var x = this.thread.x, y = this.thread.y;
        var bx = Math.floor(x / 8) * 8;
        var by = Math.floor(y / 8) * 8
        var u = y % 0x8;
        var r = 0.0;
        var b = 0.0;
        var g = 0.0;
        for (var i = 0; i < 8; i++) {
            var pixel = image[by + i][x];
            r += pixel[0] * coe[u][i];
            g += pixel[1] * coe[u][i];
            b += pixel[2] * coe[u][i];
        }
        
        return exports(r, g, b, 1.0);
    }
};
cfunc.idctcol = cfunc.dctcol;
cfunc.idctrow = cfunc.dctrow;


var operators = {
    // clang-format off
            gaussian          : [1/16, 2/16, 1/16,
                                 2/16, 4/16, 2/16,
                                 1/16, 2/16, 1/16],
            bigGaussian       : [2/159, 4/159, 5/159, 4/159, 2/159,
                                 4/159, 9/159,12/159, 9/159, 4/159,
                                 5/159,12/159,15/159,12/159, 5/159,
                                 4/159, 9/159,12/159, 9/159, 4/159,
                                 2/159, 4/159, 5/159, 4/159, 2/159],
            highpass          : [-1, -1, -1,
                                 -1,  8, -1, 
                                 -1, -1, -1],
            laplacian         : [ 0, -1, 0,
                                 -1, 4, -1,
                                 0, -1, 0 ],
            lowpass3          : [1/9, 1/9, 1/9,
                                 1/9, 1/9, 1/9,
                                 1/9, 1/9, 1/9],
            lowpass5          : [1/25, 1/25, 1/25, 1/25, 1/25,
                                 1/25, 1/25, 1/25, 1/25, 1/25,
                                 1/25, 1/25, 1/25, 1/25, 1/25,
                                 1/25 ,1/25, 1/25, 1/25, 1/25,
                                 1/25 ,1/25, 1/25, 1/25, 1/25],
            prewittHorizontal : [1/3, 1/3, 1/3,
                                 0, 0, 0,
                                 -1/3, -1/3, -1/3],
            prewittVertical   : [-1/3, 0, 1/3,
                                 -1/3, 0, 1/3,
                                 -1/3, 0, 1/3],
            roberts           : [0, 0, 0,
                                 1, -1, 0,
                                 0, 0, 0],
            sharpen           : [0, -0.2, 0,
                                 -0.2, 1.8, -0.2,
                                 0, -0.2, 0],
            sobelHorizontal   : [1/4, 2/4, 1/4,
                                 0, 0, 0,
                                 -1/4, -2/4, -1/4 ],
            sobelVertical     : [1/4, 0, -1/4,
                                 2/4, 0, -2/4,
                                 1/4, 0, -1/4 ]
    // clang-format on
};
class LenaGPU {
    constructor(settings = {}) {
        this.width = settings.width || null;
        this.height = settings.height || null;
        var graphical = settings.graphical || true;
        let theGPU = window.GPUJS || window.GPU;
        this.gpu = settings.gpu || new theGPU();
        LenaGPU.gpu = LenaGPU.gpu || this.gpu;
        this.dynamicOutput = (this.width && this.height) ? false : true;
        let s3x3 = {
            constants: {fw: 3, fh: 3, fw2: 1, fh2: 1},
            dynamicOutput: this.dynamicOutput,
            graphical: graphical
        };
        let s5x5 = {
            constants: {fw: 5, fh: 5, fw2: 2, fh2: 2},
            dynamicOutput: this.dynamicOutput,
            graphical: graphical
        };
        let s000 = {dynamicOutput: this.dynamicOutput, graphical: graphical};
        let cs000 = {
            dynamicOutput: this.dynamicOutput,
            constants: {fw: 3, fh: 3, fw2: 1, fh2: 1},
        };
        let cs5x5 = {
            dynamicOutput: this.dynamicOutput,
            constants: {fw: 5, fh: 5, fw2: 2, fh2: 2},
        };
        var gfxexports = [function exports(r, g, b, a) {
            this.color(r, g, b, a);
            return 0.0;
        }];
        var csexports = [function exports(r, g, b, a) {
            return [r, g, b, a];
        }];
        this.gfxkernels = {};
        this.cskernels = {};
        this.gfxkernels.conv3x3canvas =
            this.gpu.createKernel(ffunc.filterDataFunc, s3x3);
        this.gfxkernels.conv5x5canvas =
            this.gpu.createKernel(ffunc.filterDataFunc, s5x5);
        this.gfxkernels.conv3x3 = this.gpu.createKernel(ffunc.filterFunc, s3x3);
        this.gfxkernels.conv5x5 = this.gpu.createKernel(ffunc.filterFunc, s5x5);
        for (var f in gfunc) {
            this.gfxkernels[f] = this.gpu.createKernel(gfunc[f], s000);
            this.cskernels[f] = this.gpu.createKernel(gfunc[f], cs000);
        }
        for (var f in cfunc) {
            this.cskernels[f] = this.gpu.createKernel(cfunc[f], cs000);
        }
        this.cskernels.conv5x5 = this.gpu.createKernel(ffunc.filterFunc, cs5x5);
        this.cskernels.conv3x3 = this.gpu.createKernel(ffunc.filterFunc, cs000);
        if (this.width && this.height) {
            let w = this.width;
            let h = this.height;
            for (var k in this.gfxkernels) {
                this.gfxkernels[k].setOutput([w, h]).setFunctions(gfxexports);
            }
            for (var k in this.cskernels) {
                this.cskernels[k].setOutput([w, h]);
                this.cskernels[k].setPipeline(true).setFunctions(csexports);
            }
        } else {
        }
    }
    setOutput(kernel, w, h) {
        if (!this.dynamicOutput) return;
        kernel.setOutput([w, h]);
        kernel.canvas.width = w;
        kernel.canvas.height = h;
    }
    convolution(image, weights, dstCanvas) {
        var mykernel = this.gfxkernels.conv3x3;
        let w = image.width || this.width;
        let h = image.height || this.height;
        if (typeof weights === 'string') {
            weights = operators[weights];
        }
        if ((weights == null) || (w == null) || (h == null)) {
            return null;
        } else if (
            image.hasOwnProperty('data1d') && Array.isArray(image.data1d)) {
            let imgdata = image.data1d;
            if (weights.length == 9) {
                mykernel = this.gfxkernels.conv3x3canvas;
            } else if (weights.length == 25) {
                mykernel = this.gfxkernels.conv5x5canvas;
            }
            this.setOutput(mykernel, w, h);
            mykernel.data = mykernel(imgdata, weights, w, h);
        } else {
            if (weights.length == 9) {
                mykernel = this.gfxkernels.conv3x3;
            } else if (weights.length == 25) {
                mykernel = this.gfxkernels.conv5x5;
            }
            this.setOutput(mykernel, w, h);
            mykernel.data = mykernel(image, weights);
        }

        this.present(mykernel, dstCanvas, w, h);
        return mykernel;
    };

    /*
    sobelHorizontal(image) {
        let filter = operators.sobelHorizontal;
        return this.convolution(image, filter);
    }
    */

    filterImage(image, filtername, canvas) {
        let filter = operators[filtername];
        return this.convolution(image, filter, canvas);
    }
    opsImage(kernel, image, dstCanvas, ...rest) {
        let w = image.width || this.width;
        let h = image.height || this.height;
        let mykernel = kernel;
        if (typeof kernel === 'string' || kernel instanceof String) {
            mykernel = this.gfxkernels[kernel];
        }
        this.setOutput(mykernel, w, h);
        // if (dstCanvas) {
        //    mykernel.setCanvas(dstCanvas);
        //}
        mykernel.data = mykernel.apply(null, [image].concat(rest));
        this.present(mykernel, dstCanvas, w, h);
        return mykernel;
    }
    present(mykernel, dstCanvas, w, h) {
        if(mykernel.texture && mykernel.texture instanceof WebGLTexture)
        {
            w = w || mykernel.dimensions[0] || this.gpu.canvas.width;
            h = h || mykernel.dimensions[1] || this.gpu.canvas.height;
            this.gfxkernels.passthrough(mykernel, w, h);
            return this.present(this.gfxkernels.passthrough, dstCanvas,w,h);
        }
        if (dstCanvas && (dstCanvas != mykernel.canvas)) {
            var ctx = dstCanvas.getContext('2d');
            dstCanvas.width = w;
            dstCanvas.height = h;
            ctx.putImageData(new ImageData(mykernel.getPixels(), w, h), 0, 0);
            return mykernel;
        }
    }
    /*
    grayscale(image, dstCanvas) {
        var mykernel = this.gfxkernels.gray;
        return this.op1Image(image, mykernel, dstCanvas);
    }
    mirror(image, dstCanvas) {
        return this.opsImage(this.gfxkernels.mirror, image, dstCanvas,
    image.width, image.height);
    }
    */
    saturation(image, dstCanvas, level) {
        level = level || 2.9;
        return this.opsImage('saturation', image, dstCanvas, level);
    }
    thresholding(image, dstCanvas, low, high) {
        low = low || 0.25
        high = high || 0.75
        return this.opsImage('thresholding', image, dstCanvas, low, high);
    }
    canny(image, dstCanvas, ...rest) {
        let mykernel = this.cskernels.gradient;
        let w = image.width || this.width;
        let h = image.height || this.height;
        var texGray = this.cskernels.gray(image, w, h);
        var texGuass0 = this.cskernels.conv5x5(texGray, operators.bigGaussian);
        var grad = this.cskernels.gradient(texGuass0);
        var texlap = this.cskernels.conv3x3(texGuass0, operators.laplacian);
        var texnms = this.cskernels.nonMaximumSuppression(texlap, grad);
        var edgs = this.cskernels.thresholding2(texnms, 0.02, 0.6130);
        this.gfxkernels.passthrough(edgs, w, h);
        this.present(this.gfxkernels.passthrough, dstCanvas, w, h);

        return this.gfxkernels.passthrough;
    }
    dct(image, dstCanvas, ...rest) {
        // clang-format off
		let dct_coeffient = [ 
          [0.3535533905932738, 0.3535533905932738, 0.3535533905932738, 0.3535533905932738, 0.3535533905932738, 0.3535533905932738, 0.3535533905932738, 0.3535533905932738],
          [0.4903926402016152, 0.4157348061512726, 0.27778511650980114, 0.09754516100806417, -0.0975451610080641, -0.277785116509801, -0.4157348061512727, -0.4903926402016152],
          [0.46193976625564337, 0.19134171618254492, -0.19134171618254486, -0.46193976625564337, -0.4619397662556434, -0.19134171618254517, 0.191341716182545, 0.46193976625564326],
          [0.4157348061512726, -0.0975451610080641, -0.4903926402016152, -0.2777851165098011, 0.2777851165098009, 0.4903926402016153, 0.09754516100806396, -0.41573480615127206],
          [0.3535533905932738, -0.35355339059327373, -0.35355339059327384, 0.3535533905932737, 0.35355339059327384, -0.35355339059327334, -0.35355339059327356, 0.3535533905932733],
          [0.27778511650980114, -0.4903926402016152, 0.09754516100806415, 0.4157348061512728, -0.41573480615127256, -0.09754516100806489, 0.49039264020161516, -0.27778511650980076],
          [0.19134171618254492, -0.4619397662556434, 0.46193976625564326, -0.19134171618254495, -0.19134171618254528, 0.4619397662556437, -0.46193976625564354, 0.19134171618254314],
          [0.09754516100806417, -0.2777851165098011, 0.4157348061512728, -0.4903926402016153, 0.4903926402016152, -0.415734806151272, 0.2777851165098022, -0.09754516100806254]
        ];
        
        // clang-format on
        let w = image.width || this.width;
        let h = image.height || this.height;
        let rowdct = this.cskernels.dctrow(image,    dct_coeffient);
        let imgdct = this.cskernels.dctcol(rowdct,   dct_coeffient);
        return imgdct;
    }

    idct(image, dstCanvas, ...rest) {
        // clang-format off
        let idct_coeffient = [
             [0.3535533905932738, 0.4903926402016152, 0.46193976625564337, 0.4157348061512726, 0.3535533905932738, 0.27778511650980114, 0.19134171618254492, 0.09754516100806417],
			[0.3535533905932738, 0.4157348061512726, 0.19134171618254492, -0.0975451610080641, -0.35355339059327373, -0.4903926402016152, -0.4619397662556434, -0.2777851165098011],
			[0.3535533905932738, 0.27778511650980114, -0.19134171618254486, -0.4903926402016152, -0.35355339059327384, 0.09754516100806415, 0.46193976625564326, 0.4157348061512728],
			[0.3535533905932738, 0.09754516100806417, -0.46193976625564337, -0.2777851165098011, 0.3535533905932737, 0.4157348061512728, -0.19134171618254495, -0.4903926402016153],
			[0.3535533905932738, -0.0975451610080641, -0.4619397662556434, 0.2777851165098009, 0.35355339059327384, -0.41573480615127256, -0.19134171618254528, 0.4903926402016152],
			[0.3535533905932738, -0.277785116509801, -0.19134171618254517, 0.4903926402016153, -0.35355339059327334, -0.09754516100806489, 0.4619397662556437, -0.415734806151272],
			[0.3535533905932738, -0.4157348061512727, 0.191341716182545, 0.09754516100806396, -0.35355339059327356, 0.49039264020161516, -0.46193976625564354, 0.2777851165098022],
			[0.3535533905932738, -0.4903926402016152, 0.46193976625564326, -0.41573480615127206, 0.3535533905932733, -0.27778511650980076, 0.19134171618254314, -0.09754516100806254]
        ];
        // clang-format on
        let w = image.width || this.width;
        let h = image.height || this.height;
        let colidct = this.cskernels.idctcol(image,  idct_coeffient);
        let imgidct = this.cskernels.idctrow(colidct, idct_coeffient);

        return imgidct;
    }
};

function createFilterfunction(filtername) {
    let filter = operators[filtername];
    return function(image, dstCanvas) {
        return this.convolution(image, filter, dstCanvas);
    }
}

for (var filtername in operators) {
    LenaGPU.prototype[filtername] = createFilterfunction(filtername);
}

function createOp1function(kernelname) {
    return function(image, dstCanvas) {
        return this.opsImage(kernelname, image, dstCanvas);
    }
}
function createOp3whfunction(kernelname) {
    return function(image, dstCanvas) {
        return this.opsImage(
            kernelname, image, dstCanvas, image.width, image.height);
    }
}

for (var fk
         of [['grayscale', 'gray'], ['invert'], ['red'], ['blue'], ['green'],
             ['sepia'], ['mirror'], ['flip']]) {
    let funcname = fk[0];
    let filtername = (fk.length == 1) ? fk[0] : fk[1];
    LenaGPU.prototype[funcname] = createOp3whfunction(filtername);
}
win.LenaGPU = LenaGPU;
})(window);
