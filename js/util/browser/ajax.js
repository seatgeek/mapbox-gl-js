'use strict';

exports.getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onerror = function(e) {
        callback(e);
    };
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            var data;
            try {
                data = JSON.parse(xhr.response);
            } catch (err) {
                return callback(err);
            }
            callback(null, data);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};

exports.getArrayBuffer = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function(e) {
        callback(e);
    };
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, xhr.response);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};

function sameOrigin(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.protocol === document.location.protocol && a.host === document.location.host;
}

exports.getImage = function(url, callback, isRaster) {
    // SUPERHACK: block tile loads outside of certain bounds
    if (isRaster) {
        var params = url.match(/(.*)\/(\d*)\/(\d*)\/(\d*)\.(.*)/i);
        var z = params[2],
            x = params[3],
            y = params[4];

        var base = 3.5;
        var zoomOffset = z - 2;
        var tilesMapCovers = Math.pow(2, zoomOffset - 1);
        var minTile = Math.floor(zoomOffset * base);
        var maxTile = Math.ceil(minTile + tilesMapCovers);
        var isInBounds = z >= 3 && z <= 9 && x >= minTile && x <= maxTile && y >= minTile && y <= maxTile;

        if (!isInBounds) {
            return;
        }
    }

    return exports.getArrayBuffer(url, function(err, imgData) {
        if (err) return callback(err);
        var img = new Image();
        img.onload = function() {
            callback(null, img);
            (window.URL || window.webkitURL).revokeObjectURL(img.src);
        };
        var blob = new Blob([new Uint8Array(imgData)], { type: 'image/png' });
        img.src = (window.URL || window.webkitURL).createObjectURL(blob);
        img.getData = function() {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            return context.getImageData(0, 0, img.width, img.height).data;
        };
        return img;
    });
};

exports.getVideo = function(urls, callback) {
    var video = document.createElement('video');
    video.onloadstart = function() {
        callback(null, video);
    };
    for (var i = 0; i < urls.length; i++) {
        var s = document.createElement('source');
        if (!sameOrigin(urls[i])) {
            video.crossOrigin = 'Anonymous';
        }
        s.src = urls[i];
        video.appendChild(s);
    }
    video.getData = function() { return video; };
    return video;
};
