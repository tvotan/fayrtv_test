"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPlaylistVideoByUrl = void 0;
exports.findPlaylistVideoByUrl = function (playlist, url) {
    if (!url)
        return;
    return playlist.find(function (video) { return video.url === url; });
};
