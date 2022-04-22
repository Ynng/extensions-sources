/* eslint-disable */
import LZString from 'lz-string'

String.prototype.splic = function (f) {
    return LZString.decompressFromBase64(this).split(f)
}
// fake "SMH" struct to extract the image data
let SMH = {
    imgData: function (imageInfo) {
        return {
            preInit: function () {
                console.log(imageInfo)
                return imageInfo
            },
        }
    },
}

export const evalManHuaGui = (input) => {
    return eval(input)
}
