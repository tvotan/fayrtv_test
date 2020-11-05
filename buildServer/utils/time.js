"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartOfMinute = exports.getStartOfHour = exports.getStartOfDay = void 0;
function getStartOfDay() {
    var now = Number(new Date());
    return now - (now % 86400000);
}
exports.getStartOfDay = getStartOfDay;
function getStartOfHour() {
    var now = Number(new Date());
    return now - (now % 3600000);
}
exports.getStartOfHour = getStartOfHour;
function getStartOfMinute() {
    var now = Number(new Date());
    return now - (now % 60000);
}
exports.getStartOfMinute = getStartOfMinute;
