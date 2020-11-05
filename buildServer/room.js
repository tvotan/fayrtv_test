"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
var config_1 = __importDefault(require("./config"));
var crypto_1 = __importDefault(require("crypto"));
var zlib_1 = __importDefault(require("zlib"));
var util_1 = __importDefault(require("util"));
var axios_1 = __importDefault(require("axios"));
var ioredis_1 = __importDefault(require("ioredis"));
var pg_1 = require("pg");
var firebase_1 = require("./utils/firebase");
var redis_1 = require("./utils/redis");
var stripe_1 = require("./utils/stripe");
var time_1 = require("./utils/time");
var gzip = util_1.default.promisify(zlib_1.default.gzip);
var redis = undefined;
if (config_1.default.REDIS_URL) {
    redis = new ioredis_1.default(config_1.default.REDIS_URL);
}
var postgres = undefined;
if (config_1.default.DATABASE_URL) {
    postgres = new pg_1.Client({
        connectionString: config_1.default.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    postgres.connect();
}
var Room = /** @class */ (function () {
    function Room(io, vmManagers, roomId, roomData) {
        var _this = this;
        // Serialized state
        this.video = '';
        this.videoTS = 0;
        this.subtitle = '';
        this.paused = false;
        this.chat = [];
        this.nameMap = {};
        this.pictureMap = {};
        this.vBrowser = undefined;
        this.creationTime = new Date();
        this.lock = undefined; // uid of the user who locked the room
        this.roster = [];
        this.tsMap = {};
        this.isAssigningVM = false;
        this.clientIdMap = {};
        this.uidMap = {};
        this.serialize = function () {
            // Get the set of IDs with messages in chat
            // Only serialize roster and picture ID for those people, to save space
            var chatIDs = new Set(_this.chat.map(function (msg) { return msg.id; }));
            var abbrNameMap = {};
            Object.keys(_this.nameMap).forEach(function (id) {
                if (chatIDs.has(id)) {
                    abbrNameMap[id] = _this.nameMap[id];
                }
            });
            var abbrPictureMap = {};
            Object.keys(_this.pictureMap).forEach(function (id) {
                if (chatIDs.has(id)) {
                    abbrPictureMap[id] = _this.pictureMap[id];
                }
            });
            return JSON.stringify({
                video: _this.video,
                videoTS: _this.videoTS,
                subtitle: _this.subtitle,
                paused: _this.paused,
                chat: _this.chat,
                nameMap: abbrNameMap,
                pictureMap: abbrPictureMap,
                vBrowser: _this.vBrowser,
                creationTime: _this.creationTime,
                lock: _this.lock,
            });
        };
        this.deserialize = function (roomData) {
            var roomObj = JSON.parse(roomData);
            _this.video = roomObj.video;
            _this.videoTS = roomObj.videoTS;
            if (roomObj.subtitle) {
                _this.subtitle = roomObj.subtitle;
            }
            if (roomObj.paused) {
                _this.paused = roomObj.paused;
            }
            if (roomObj.chat) {
                _this.chat = roomObj.chat;
            }
            if (roomObj.nameMap) {
                _this.nameMap = roomObj.nameMap;
            }
            if (roomObj.pictureMap) {
                _this.pictureMap = roomObj.pictureMap;
            }
            if (roomObj.vBrowser) {
                _this.vBrowser = roomObj.vBrowser;
            }
            if (roomObj.creationTime) {
                _this.creationTime = new Date(roomObj.creationTime);
            }
            if (roomObj.lock) {
                _this.lock = roomObj.lock;
            }
        };
        this.saveToRedis = function () { return __awaiter(_this, void 0, void 0, function () {
            var roomString, key, permanent, result, owner, e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        roomString = this.serialize();
                        key = this.roomId;
                        permanent = false;
                        if (!postgres) return [3 /*break*/, 2];
                        return [4 /*yield*/, postgres.query("SELECT owner FROM room where roomId = $1", [this.roomId])];
                    case 1:
                        result = _b.sent();
                        owner = (_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.owner;
                        permanent = Boolean(owner);
                        _b.label = 2;
                    case 2:
                        if (!permanent) return [3 /*break*/, 5];
                        return [4 /*yield*/, redis.set(key, roomString)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, redis.persist(key)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, redis.setex(key, 24 * 60 * 60, roomString)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        e_1 = _b.sent();
                        console.error(e_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        this.getHostState = function () {
            // Reverse lookup the clientid to the socket id
            var match = _this.roster.find(function (user) { var _a; return _this.clientIdMap[user.id] === ((_a = _this.vBrowser) === null || _a === void 0 ? void 0 : _a.controllerClient); });
            return {
                video: _this.video,
                videoTS: _this.videoTS,
                subtitle: _this.subtitle,
                paused: _this.paused,
                isVBrowserLarge: Boolean(_this.vBrowser && _this.vBrowser.large),
                controller: match === null || match === void 0 ? void 0 : match.id,
            };
        };
        this.stopVBrowser = function () { return __awaiter(_this, void 0, void 0, function () {
            var assignTime, id, isLarge, vmManager, e_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.isAssigningVM = false;
                        assignTime = this.vBrowser && this.vBrowser.assignTime;
                        id = this.vBrowser && this.vBrowser.id;
                        isLarge = (_a = this.vBrowser) === null || _a === void 0 ? void 0 : _a.large;
                        this.vBrowser = undefined;
                        this.cmdHost(undefined, '');
                        this.saveToRedis();
                        if (!(redis && assignTime)) return [3 /*break*/, 3];
                        return [4 /*yield*/, redis.lpush('vBrowserSessionMS', Number(new Date()) - assignTime)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, redis.ltrim('vBrowserSessionMS', 0, 49)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        if (!id) return [3 /*break*/, 7];
                        _d.label = 4;
                    case 4:
                        _d.trys.push([4, 6, , 7]);
                        vmManager = isLarge
                            ? (_b = this.vmManagers) === null || _b === void 0 ? void 0 : _b.large : (_c = this.vmManagers) === null || _c === void 0 ? void 0 : _c.standard;
                        return [4 /*yield*/, (vmManager === null || vmManager === void 0 ? void 0 : vmManager.resetVM(id))];
                    case 5:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _d.sent();
                        console.error(e_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.cmdHost = function (socket, data) {
            _this.video = data;
            _this.videoTS = 0;
            _this.paused = false;
            _this.subtitle = '';
            _this.tsMap = {};
            _this.io.of(_this.roomId).emit('REC:tsMap', _this.tsMap);
            _this.io.of(_this.roomId).emit('REC:host', _this.getHostState());
            if (socket && data) {
                var chatMsg = { id: socket.id, cmd: 'host', msg: data };
                _this.addChatMessage(socket, chatMsg);
            }
        };
        this.addChatMessage = function (socket, chatMsg) {
            var chatWithTime = __assign(__assign({}, chatMsg), { timestamp: new Date().toISOString(), videoTS: socket ? _this.tsMap[socket.id] : undefined });
            _this.chat.push(chatWithTime);
            _this.chat = _this.chat.splice(-100);
            _this.io.of(_this.roomId).emit('REC:chat', chatWithTime);
        };
        this.validateLock = function (socketId) {
            if (!_this.lock) {
                return true;
            }
            var result = _this.uidMap[socketId] === _this.lock;
            if (!result) {
                console.log('[VALIDATELOCK] failed', socketId);
            }
            return result;
        };
        this.changeUserName = function (socket, data) {
            if (!data) {
                return;
            }
            if (data && data.length > 50) {
                return;
            }
            _this.nameMap[socket.id] = data;
            _this.io.of(_this.roomId).emit('REC:nameMap', _this.nameMap);
        };
        this.changeUserPicture = function (socket, data) {
            if (data && data.length > 10000) {
                return;
            }
            _this.pictureMap[socket.id] = data;
            _this.io.of(_this.roomId).emit('REC:pictureMap', _this.pictureMap);
        };
        this.changeUserID = function (socket, data) { return __awaiter(_this, void 0, void 0, function () {
            var decoded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, firebase_1.validateUserToken(data.uid, data.token)];
                    case 1:
                        decoded = _a.sent();
                        if (!decoded) {
                            return [2 /*return*/];
                        }
                        this.uidMap[socket.id] = decoded.uid;
                        return [2 /*return*/];
                }
            });
        }); };
        this.startHosting = function (socket, data) {
            if (data && data.length > 20000) {
                return;
            }
            if (!_this.validateLock(socket.id)) {
                return;
            }
            var sharer = _this.roster.find(function (user) { return user.isScreenShare; });
            if (sharer || _this.vBrowser) {
                // Can't update the video while someone is screensharing/filesharing or vbrowser is running
                return;
            }
            redis_1.redisCount('urlStarts');
            _this.cmdHost(socket, data);
        };
        this.playVideo = function (socket) {
            var _a;
            if (!_this.validateLock(socket.id)) {
                return;
            }
            socket.broadcast.emit('REC:play', _this.video);
            var chatMsg = {
                id: socket.id,
                cmd: 'play',
                msg: (_a = _this.tsMap[socket.id]) === null || _a === void 0 ? void 0 : _a.toString(),
            };
            _this.paused = false;
            _this.addChatMessage(socket, chatMsg);
        };
        this.pauseVideo = function (socket) {
            var _a;
            if (!_this.validateLock(socket.id)) {
                return;
            }
            socket.broadcast.emit('REC:pause');
            var chatMsg = {
                id: socket.id,
                cmd: 'pause',
                msg: (_a = _this.tsMap[socket.id]) === null || _a === void 0 ? void 0 : _a.toString(),
            };
            _this.paused = true;
            _this.addChatMessage(socket, chatMsg);
        };
        this.seekVideo = function (socket, data) {
            if (String(data).length > 100) {
                return;
            }
            if (!_this.validateLock(socket.id)) {
                return;
            }
            _this.videoTS = data;
            socket.broadcast.emit('REC:seek', data);
            var chatMsg = { id: socket.id, cmd: 'seek', msg: data.toString() };
            _this.addChatMessage(socket, chatMsg);
        };
        this.setTimestamp = function (socket, data) {
            if (String(data).length > 100) {
                return;
            }
            if (data > _this.videoTS) {
                _this.videoTS = data;
            }
            _this.tsMap[socket.id] = data;
        };
        this.sendChatMessage = function (socket, data) {
            if (data && data.length > 10000) {
                return;
            }
            if (config_1.default.NODE_ENV === 'development' && data === '/clear') {
                _this.chat.length = 0;
                _this.io.of(_this.roomId).emit('chatinit', _this.chat);
                return;
            }
            redis_1.redisCount('chatMessages');
            var chatMsg = { id: socket.id, msg: data };
            _this.addChatMessage(socket, chatMsg);
        };
        this.joinVideo = function (socket) {
            var match = _this.roster.find(function (user) { return user.id === socket.id; });
            if (match) {
                match.isVideoChat = true;
                redis_1.redisCount('videoChatStarts');
            }
            _this.io.of(_this.roomId).emit('roster', _this.roster);
        };
        this.leaveVideo = function (socket) {
            var match = _this.roster.find(function (user) { return user.id === socket.id; });
            if (match) {
                match.isVideoChat = false;
            }
            _this.io.of(_this.roomId).emit('roster', _this.roster);
        };
        this.joinScreenSharing = function (socket, data) {
            if (!_this.validateLock(socket.id)) {
                return;
            }
            var sharer = _this.roster.find(function (user) { return user.isScreenShare; });
            if (sharer) {
                // Someone's already sharing
                return;
            }
            if (data && data.file) {
                _this.cmdHost(socket, 'fileshare://' + socket.id);
                redis_1.redisCount('fileShareStarts');
            }
            else {
                _this.cmdHost(socket, 'screenshare://' + socket.id);
                redis_1.redisCount('screenShareStarts');
            }
            var match = _this.roster.find(function (user) { return user.id === socket.id; });
            if (match) {
                match.isScreenShare = true;
            }
            _this.io.of(_this.roomId).emit('roster', _this.roster);
        };
        this.leaveScreenSharing = function (socket) {
            var sharer = _this.roster.find(function (user) { return user.isScreenShare; });
            if (!sharer || (sharer === null || sharer === void 0 ? void 0 : sharer.id) !== socket.id) {
                return;
            }
            sharer.isScreenShare = false;
            _this.cmdHost(socket, '');
            _this.io.of(_this.roomId).emit('roster', _this.roster);
        };
        this.startVBrowser = function (socket, data) { return __awaiter(_this, void 0, void 0, function () {
            var clientId, uid, expireTime, clientCount, clientMinutes, uidCount, uidMinutes, isLarge, decoded, customer, validation, isLowScore, failed, e_3, vmManager, assignment;
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (this.vBrowser || this.isAssigningVM) {
                            return [2 /*return*/];
                        }
                        if (!this.validateLock(socket.id)) {
                            return [2 /*return*/];
                        }
                        if (!data) {
                            return [2 /*return*/];
                        }
                        clientId = this.clientIdMap[socket.id];
                        uid = this.uidMap[socket.id];
                        if (!redis) return [3 /*break*/, 6];
                        expireTime = time_1.getStartOfDay() / 1000 + 86400;
                        if (!clientId) return [3 /*break*/, 3];
                        return [4 /*yield*/, redis.zincrby('vBrowserClientIDs', 1, clientId)];
                    case 1:
                        clientCount = _j.sent();
                        redis.expireat('vBrowserClientIDs', expireTime);
                        return [4 /*yield*/, redis.zincrby('vBrowserClientIDMinutes', 1, clientId)];
                    case 2:
                        clientMinutes = _j.sent();
                        redis.expireat('vBrowserClientIDMinutes', expireTime);
                        _j.label = 3;
                    case 3:
                        if (!uid) return [3 /*break*/, 6];
                        return [4 /*yield*/, redis.zincrby('vBrowserUIDs', 1, uid)];
                    case 4:
                        uidCount = _j.sent();
                        redis.expireat('vBrowserUIDs', expireTime);
                        return [4 /*yield*/, redis.zincrby('vBrowserUIDMinutes', 1, uid)];
                    case 5:
                        uidMinutes = _j.sent();
                        redis.expireat('vBrowserUIDMinutes', expireTime);
                        _j.label = 6;
                    case 6:
                        this.isAssigningVM = true;
                        isLarge = false;
                        if (!(config_1.default.STRIPE_SECRET_KEY && data && data.uid && data.token)) return [3 /*break*/, 9];
                        return [4 /*yield*/, firebase_1.validateUserToken(data.uid, data.token)];
                    case 7:
                        decoded = _j.sent();
                        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.email)) return [3 /*break*/, 9];
                        return [4 /*yield*/, stripe_1.getCustomerByEmail(decoded.email)];
                    case 8:
                        customer = _j.sent();
                        if (((_c = (_b = (_a = customer === null || customer === void 0 ? void 0 : customer.subscriptions) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.status) === 'active') {
                            console.log('found active sub for ', customer === null || customer === void 0 ? void 0 : customer.email);
                            isLarge = ((_d = data.options) === null || _d === void 0 ? void 0 : _d.size) === 'large';
                        }
                        _j.label = 9;
                    case 9:
                        if (!config_1.default.RECAPTCHA_SECRET_KEY) return [3 /*break*/, 13];
                        _j.label = 10;
                    case 10:
                        _j.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, axios_1.default({
                                url: "https://www.google.com/recaptcha/api/siteverify?secret=" + config_1.default.RECAPTCHA_SECRET_KEY + "&response=" + data.rcToken,
                                method: 'POST',
                            })];
                    case 11:
                        validation = _j.sent();
                        console.log(validation === null || validation === void 0 ? void 0 : validation.data);
                        isLowScore = ((_e = validation === null || validation === void 0 ? void 0 : validation.data) === null || _e === void 0 ? void 0 : _e.score) < 0.12;
                        failed = ((_f = validation === null || validation === void 0 ? void 0 : validation.data) === null || _f === void 0 ? void 0 : _f.success) === false;
                        if (failed || isLowScore) {
                            if (isLowScore) {
                                redis_1.redisCount('recaptchaRejectsLowScore');
                            }
                            else {
                                redis_1.redisCount('recaptchaRejectsOther');
                            }
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 13];
                    case 12:
                        e_3 = _j.sent();
                        // if Recaptcha is down or other network issues, allow continuing
                        console.warn(e_3);
                        return [3 /*break*/, 13];
                    case 13:
                        redis_1.redisCount('vBrowserStarts');
                        this.cmdHost(socket, 'vbrowser://');
                        vmManager = isLarge
                            ? (_g = this.vmManagers) === null || _g === void 0 ? void 0 : _g.large : (_h = this.vmManagers) === null || _h === void 0 ? void 0 : _h.standard;
                        return [4 /*yield*/, (vmManager === null || vmManager === void 0 ? void 0 : vmManager.assignVM())];
                    case 14:
                        assignment = _j.sent();
                        if (!this.isAssigningVM) {
                            // Maybe the user cancelled the request before assignment finished
                            return [2 /*return*/];
                        }
                        this.isAssigningVM = false;
                        if (!assignment) {
                            this.cmdHost(socket, '');
                            this.vBrowser = undefined;
                            return [2 /*return*/];
                        }
                        this.vBrowser = assignment;
                        this.vBrowser.controllerClient = clientId;
                        this.vBrowser.creatorUID = uid;
                        this.vBrowser.creatorClientID = clientId;
                        this.cmdHost(undefined, 'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host);
                        return [2 /*return*/];
                }
            });
        }); };
        this.leaveVBrowser = function (socket) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.vBrowser && !this.isAssigningVM && this.video !== 'vbrowser://') {
                            return [2 /*return*/];
                        }
                        if (!this.validateLock(socket.id)) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.stopVBrowser()];
                    case 1:
                        _a.sent();
                        redis_1.redisCount('vBrowserTerminateManual');
                        return [2 /*return*/];
                }
            });
        }); };
        this.changeController = function (socket, data) {
            if (data && data.length > 100) {
                return;
            }
            if (!_this.validateLock(socket.id)) {
                return;
            }
            if (_this.vBrowser) {
                _this.vBrowser.controllerClient = _this.clientIdMap[data];
                _this.io.of(_this.roomId).emit('REC:changeController', data);
            }
        };
        this.addSubtitles = function (socket, data) { return __awaiter(_this, void 0, void 0, function () {
            var hash, gzipData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (data && data.length > 1000000) {
                            return [2 /*return*/];
                        }
                        if (!this.validateLock(socket.id)) {
                            return [2 /*return*/];
                        }
                        if (!redis) {
                            return [2 /*return*/];
                        }
                        hash = crypto_1.default
                            .createHash('sha256')
                            .update(data, 'utf8')
                            .digest()
                            .toString('hex');
                        return [4 /*yield*/, gzip(data)];
                    case 1:
                        gzipData = (_a.sent());
                        // console.log(data.length, gzipData.length);
                        return [4 /*yield*/, redis.setex('subtitle:' + hash, 3 * 60 * 60, gzipData)];
                    case 2:
                        // console.log(data.length, gzipData.length);
                        _a.sent();
                        this.subtitle = hash;
                        this.io.of(this.roomId).emit('REC:subtitle', this.subtitle);
                        redis_1.redisCount('subUploads');
                        return [2 /*return*/];
                }
            });
        }); };
        this.lockRoom = function (socket, data) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, chatMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, firebase_1.validateUserToken(data.uid, data.token)];
                    case 1:
                        decoded = _a.sent();
                        if (!decoded) {
                            return [2 /*return*/];
                        }
                        if (!this.validateLock(socket.id)) {
                            return [2 /*return*/];
                        }
                        this.lock = data.locked ? decoded.uid : '';
                        this.io.of(this.roomId).emit('REC:lock', this.lock);
                        chatMsg = {
                            id: socket.id,
                            cmd: data.locked ? 'lock' : 'unlock',
                            msg: '',
                        };
                        this.addChatMessage(socket, chatMsg);
                        return [2 /*return*/];
                }
            });
        }); };
        this.setRoomOwner = function (socket, data) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, customer, isSubscriber, owner, roomCount, limit, roomObj, columns, values, query, result, row;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!postgres) {
                            socket.emit('errorMessage', 'Database is not available');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, firebase_1.validateUserToken(data === null || data === void 0 ? void 0 : data.uid, data === null || data === void 0 ? void 0 : data.token)];
                    case 1:
                        decoded = _d.sent();
                        if (!decoded) {
                            socket.emit('errorMessage', 'Failed to authenticate user');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stripe_1.getCustomerByEmail(decoded.email)];
                    case 2:
                        customer = _d.sent();
                        isSubscriber = Boolean(((_c = (_b = (_a = customer === null || customer === void 0 ? void 0 : customer.subscriptions) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.status) === 'active');
                        owner = decoded.uid;
                        if (!data.undo) return [3 /*break*/, 4];
                        return [4 /*yield*/, postgres.query('DELETE from room where roomId = $1', [this.roomId])];
                    case 3:
                        _d.sent();
                        socket.emit('REC:getRoomState', {});
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, postgres.query('SELECT count(1) from room where owner = $1 AND roomId != $2', [owner, this.roomId])];
                    case 5:
                        roomCount = (_d.sent()).rows[0].count;
                        limit = isSubscriber ? 10 : 1;
                        // console.log(roomCount, limit, isSubscriber);
                        if (roomCount >= limit) {
                            socket.emit('errorMessage', 'Room limit exceeded');
                            return [2 /*return*/];
                        }
                        roomObj = {
                            roomId: this.roomId,
                            creationTime: this.creationTime,
                            owner: owner,
                        };
                        columns = Object.keys(roomObj);
                        values = Object.values(roomObj);
                        query = "INSERT INTO room(" + columns.join(',') + ")\n    VALUES (" + values.map(function (_, i) { return '$' + (i + 1); }).join(',') + ")\n    RETURNING *";
                        return [4 /*yield*/, postgres.query(query, values)];
                    case 6:
                        result = _d.sent();
                        row = result.rows[0];
                        socket.emit('REC:getRoomState', {
                            password: row === null || row === void 0 ? void 0 : row.password,
                            vanity: row === null || row === void 0 ? void 0 : row.vanity,
                            owner: row === null || row === void 0 ? void 0 : row.owner,
                        });
                        _d.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.getRoomState = function (socket) { return __awaiter(_this, void 0, void 0, function () {
            var result, first;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!postgres) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, postgres.query("SELECT password, vanity, owner FROM room where roomId = $1", [this.roomId])];
                    case 1:
                        result = _a.sent();
                        first = result.rows[0];
                        socket.emit('REC:getRoomState', {
                            password: first === null || first === void 0 ? void 0 : first.password,
                            vanity: first === null || first === void 0 ? void 0 : first.vanity,
                            owner: first === null || first === void 0 ? void 0 : first.owner,
                        });
                        return [2 /*return*/];
                }
            });
        }); };
        this.setRoomState = function (socket, data) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, customer, isSubscriber, password, vanity, roomObj, query, result, row, e_4;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!postgres) {
                            socket.emit('errorMessage', 'Database is not available');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, firebase_1.validateUserToken(data === null || data === void 0 ? void 0 : data.uid, data === null || data === void 0 ? void 0 : data.token)];
                    case 1:
                        decoded = _d.sent();
                        if (!decoded) {
                            socket.emit('errorMessage', 'Failed to authenticate user');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stripe_1.getCustomerByEmail(decoded.email)];
                    case 2:
                        customer = _d.sent();
                        isSubscriber = Boolean(((_c = (_b = (_a = customer === null || customer === void 0 ? void 0 : customer.subscriptions) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.status) === 'active');
                        password = data.password, vanity = data.vanity;
                        if (password) {
                            if (password.length > 100) {
                                socket.emit('errorMessage', 'Password too long');
                                return [2 /*return*/];
                            }
                        }
                        if (vanity) {
                            if (vanity.length > 100) {
                                socket.emit('errorMessage', 'Custom URL too long');
                                return [2 /*return*/];
                            }
                        }
                        roomObj = {
                            roomId: this.roomId,
                            password: password,
                        };
                        if (isSubscriber) {
                            // user must be sub to set vanity
                            roomObj.vanity = vanity;
                        }
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        query = "UPDATE room\n        SET " + Object.keys(roomObj).map(function (k, i) { return k + " = $" + (i + 1); }) + "\n        WHERE roomId = $" + (Object.keys(roomObj).length + 1) + "\n        AND owner = $" + (Object.keys(roomObj).length + 2) + "\n        RETURNING *";
                        return [4 /*yield*/, postgres.query(query, __spreadArrays(Object.values(roomObj), [
                                this.roomId,
                                decoded.uid,
                            ]))];
                    case 4:
                        result = _d.sent();
                        row = result.rows[0];
                        socket.emit('REC:getRoomState', {
                            password: row === null || row === void 0 ? void 0 : row.password,
                            vanity: row === null || row === void 0 ? void 0 : row.vanity,
                            owner: row === null || row === void 0 ? void 0 : row.owner,
                        });
                        socket.emit('successMessage', 'Saved admin settings');
                        return [3 /*break*/, 6];
                    case 5:
                        e_4 = _d.sent();
                        console.error(e_4);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        this.sendSignal = function (socket, data) {
            if (!data) {
                return;
            }
            _this.io
                .of(_this.roomId)
                .to(data.to)
                .emit('signal', { from: socket.id, msg: data.msg });
        };
        this.signalSS = function (socket, data) {
            if (!data) {
                return;
            }
            _this.io.of(_this.roomId).to(data.to).emit('signalSS', {
                from: socket.id,
                sharer: data.sharer,
                msg: data.msg,
            });
        };
        this.disconnectUser = function (socket) {
            var index = _this.roster.findIndex(function (user) { return user.id === socket.id; });
            var removed = _this.roster.splice(index, 1)[0];
            _this.io.of(_this.roomId).emit('roster', _this.roster);
            if (removed.isScreenShare) {
                // Reset the room state since we lost the screen sharer
                _this.cmdHost(socket, '');
            }
            delete _this.tsMap[socket.id];
            // delete nameMap[socket.id];
        };
        this.roomId = roomId;
        this.io = io;
        this.vmManagers = vmManagers;
        if (roomData) {
            this.deserialize(roomData);
        }
        setInterval(function () {
            // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
            if (_this.video) {
                io.of(roomId).emit('REC:tsMap', _this.tsMap);
            }
        }, 1000);
        io.of(roomId).use(function (socket, next) { return __awaiter(_this, void 0, void 0, function () {
            var password, result, roomPassword;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        password = (_a = socket.handshake.query) === null || _a === void 0 ? void 0 : _a.password;
                        if (!postgres) return [3 /*break*/, 2];
                        return [4 /*yield*/, postgres.query("SELECT password FROM room where roomId = $1", [this.roomId])];
                    case 1:
                        result = _c.sent();
                        roomPassword = (_b = result.rows[0]) === null || _b === void 0 ? void 0 : _b.password;
                        if (roomPassword && password !== roomPassword) {
                            next(new Error('not authorized'));
                            return [2 /*return*/];
                        }
                        _c.label = 2;
                    case 2:
                        next();
                        return [2 /*return*/];
                }
            });
        }); });
        io.of(roomId).on('connection', function (socket) {
            var _a;
            var clientId = (_a = socket.handshake.query) === null || _a === void 0 ? void 0 : _a.clientId;
            _this.roster.push({ id: socket.id });
            _this.clientIdMap[socket.id] = clientId;
            redis_1.redisCount('connectStarts');
            redis_1.redisCountDistinct('connectStartsDistinct', clientId);
            socket.emit('REC:host', _this.getHostState());
            socket.emit('REC:nameMap', _this.nameMap);
            socket.emit('REC:pictureMap', _this.pictureMap);
            socket.emit('REC:tsMap', _this.tsMap);
            socket.emit('REC:lock', _this.lock);
            socket.emit('chatinit', _this.chat);
            io.of(roomId).emit('roster', _this.roster);
            socket.on('CMD:name', function (data) { return _this.changeUserName(socket, data); });
            socket.on('CMD:picture', function (data) { return _this.changeUserPicture(socket, data); });
            socket.on('CMD:uid', function (data) { return _this.changeUserID(socket, data); });
            socket.on('CMD:host', function (data) { return _this.startHosting(socket, data); });
            socket.on('CMD:play', function () { return _this.playVideo(socket); });
            socket.on('CMD:pause', function () { return _this.pauseVideo(socket); });
            socket.on('CMD:seek', function (data) { return _this.seekVideo(socket, data); });
            socket.on('CMD:ts', function (data) { return _this.setTimestamp(socket, data); });
            socket.on('CMD:chat', function (data) { return _this.sendChatMessage(socket, data); });
            socket.on('CMD:joinVideo', function () { return _this.joinVideo(socket); });
            socket.on('CMD:leaveVideo', function () { return _this.leaveVideo(socket); });
            socket.on('CMD:joinScreenShare', function (data) {
                return _this.joinScreenSharing(socket, data);
            });
            socket.on('CMD:leaveScreenShare', function () { return _this.leaveScreenSharing(socket); });
            socket.on('CMD:startVBrowser', function (data) {
                return _this.startVBrowser(socket, data);
            });
            socket.on('CMD:stopVBrowser', function () { return _this.leaveVBrowser(socket); });
            socket.on('CMD:changeController', function (data) {
                return _this.changeController(socket, data);
            });
            socket.on('CMD:subtitle', function (data) { return _this.addSubtitles(socket, data); });
            socket.on('CMD:lock', function (data) { return _this.lockRoom(socket, data); });
            socket.on('CMD:askHost', function () {
                socket.emit('REC:host', _this.getHostState());
            });
            socket.on('CMD:getRoomState', function (data) { return _this.getRoomState(socket); });
            socket.on('CMD:setRoomState', function (data) { return _this.setRoomState(socket, data); });
            socket.on('CMD:setRoomOwner', function (data) { return _this.setRoomOwner(socket, data); });
            socket.on('signal', function (data) { return _this.sendSignal(socket, data); });
            socket.on('signalSS', function (data) { return _this.signalSS(socket, data); });
            socket.on('disconnect', function () { return _this.disconnectUser(socket); });
        });
    }
    return Room;
}());
exports.Room = Room;
