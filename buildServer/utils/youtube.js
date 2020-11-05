"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoDuration = exports.fetchYoutubeVideo = exports.getYoutubeVideoID = exports.searchYoutube = exports.mapYoutubeListResult = exports.mapYoutubeSearchResult = void 0;
var config_1 = __importDefault(require("../config"));
var youtube_api_1 = __importDefault(require("youtube-api"));
var regex_1 = require("./regex");
if (config_1.default.YOUTUBE_API_KEY) {
    youtube_api_1.default.authenticate({
        type: 'key',
        key: config_1.default.YOUTUBE_API_KEY,
    });
}
exports.mapYoutubeSearchResult = function (video) {
    return {
        channel: video.snippet.channelTitle,
        url: 'https://www.youtube.com/watch?v=' + video.id.videoId,
        name: video.snippet.title,
        img: video.snippet.thumbnails.default.url,
    };
};
exports.mapYoutubeListResult = function (video) {
    var videoId = video.id;
    return {
        url: 'https://www.youtube.com/watch?v=' + videoId,
        name: video.snippet.title,
        img: video.snippet.thumbnails.default.url,
        channel: video.snippet.channelTitle,
        duration: exports.getVideoDuration(video.contentDetails.duration),
    };
};
exports.searchYoutube = function (query) {
    return new Promise(function (resolve, reject) {
        youtube_api_1.default.search.list({ part: 'snippet', type: 'video', maxResults: 25, q: query }, function (err, data) {
            console.log(err);
            if (data && data.items) {
                var response = data.items.map(exports.mapYoutubeSearchResult);
                resolve(response);
            }
            else {
                console.error(data);
                reject();
            }
        });
    });
};
exports.getYoutubeVideoID = function (url) {
    var idParts = regex_1.YOUTUBE_VIDEO_ID_REGEX.exec(url);
    if (!idParts) {
        return;
    }
    var id = idParts[1];
    if (!id) {
        return;
    }
    return id;
};
exports.fetchYoutubeVideo = function (id) {
    return new Promise(function (resolve, reject) {
        youtube_api_1.default.videos.list({ part: 'snippet,contentDetails', id: id }, function (err, data) {
            if (data) {
                var video = data.items[0];
                resolve(exports.mapYoutubeListResult(video));
            }
            else {
                console.error(err);
                console.log(err);
                reject('unknown youtube api error');
            }
        });
    });
};
exports.getVideoDuration = function (string) {
    var hoursParts = regex_1.PT_HOURS_REGEX.exec(string);
    var minutesParts = regex_1.PT_MINUTES_REGEX.exec(string);
    var secondsParts = regex_1.PT_SECONDS_REGEX.exec(string);
    var hours = hoursParts ? parseInt(hoursParts[1]) : 0;
    var minutes = minutesParts ? parseInt(minutesParts[1]) : 0;
    var seconds = secondsParts ? parseInt(secondsParts[1]) : 0;
    var totalSeconds = seconds + minutes * 60 + hours * 60 * 60;
    return totalSeconds;
};
