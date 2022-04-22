/* eslint-disable */
import LZString from 'lz-string'

String.prototype.splic = function (f) {
    return LZString.decompressFromBase64(this).split(f)
}
// fake "SMH" struct to extract the image data
var SMH = {
    imgData: function (imageData) {
        return {
            preInit: function () {
                imageInfo = imageData;
            },
        }
    },
}

export const evalManHuaGui = (input) => {
    return eval(input)
}
