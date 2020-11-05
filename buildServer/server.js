"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("./config"));
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var compression_1 = __importDefault(require("compression"));
var moniker_1 = __importDefault(require("moniker"));
var os_1 = __importDefault(require("os"));
var cors_1 = __importDefault(require("cors"));
var ioredis_1 = __importDefault(require("ioredis"));
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = __importDefault(require("socket.io"));
var youtube_1 = require("./utils/youtube");
var room_1 = require("./room");
var redis_1 = require("./utils/redis");
var hetzner_1 = require("./vm/hetzner");
var docker_1 = require("./vm/docker");
var stripe_1 = require("./utils/stripe");
var firebase_1 = require("./utils/firebase");
var path_1 = __importDefault(require("path"));
var pg_1 = require("pg");
var app = express_1.default();
var server = null;
if (config_1.default.HTTPS) {
    var key = fs_1.default.readFileSync(config_1.default.SSL_KEY_FILE);
    var cert = fs_1.default.readFileSync(config_1.default.SSL_CRT_FILE);
    server = https_1.default.createServer({ key: key, cert: cert }, app);
}
else {
    server = new http_1.default.Server(app);
}
var io = socket_io_1.default(server, { origins: '*:*', transports: ['websocket'] });
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
var names = moniker_1.default.generator([
    moniker_1.default.adjective,
    moniker_1.default.noun,
    moniker_1.default.verb,
]);
var launchTime = Number(new Date());
var rooms = new Map();
// Start the VM manager
var vmManager;
var vmManagerLarge;
if (config_1.default.REDIS_URL && config_1.default.SCW_SECRET_KEY && config_1.default.SCW_ORGANIZATION_ID) {
    // new Scaleway(rooms, 0);
    // new Scaleway(rooms, 0, true)
}
if (config_1.default.REDIS_URL && config_1.default.HETZNER_TOKEN) {
    vmManager = new hetzner_1.Hetzner(rooms);
    vmManagerLarge = new hetzner_1.Hetzner(rooms, undefined, true);
}
if (config_1.default.REDIS_URL && config_1.default.DO_TOKEN) {
    // new DigitalOcean(rooms, 0);
    // new DigitalOcean(rooms, 0, true);
}
if (config_1.default.REDIS_URL && config_1.default.DOCKER_VM_HOST) {
    vmManager = new docker_1.Docker(rooms, undefined, false);
}
var vmManagers = { standard: vmManager, large: vmManagerLarge };
init();
function saveRooms() {
    return __awaiter(this, void 0, void 0, function () {
        var roomArr, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 6];
                    roomArr = Array.from(rooms.values());
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < roomArr.length)) return [3 /*break*/, 4];
                    if (!roomArr[i].roster.length) return [3 /*break*/, 3];
                    return [4 /*yield*/, roomArr[i].saveToRedis()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: 
                // console.timeEnd('roomSave');
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 5:
                    // console.timeEnd('roomSave');
                    _a.sent();
                    return [3 /*break*/, 0];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var keys, i, key, roomData, postgresRooms, i, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!redis) return [3 /*break*/, 7];
                    // Load rooms from Redis
                    console.log('loading rooms from redis');
                    return [4 /*yield*/, redis.keys('/*')];
                case 1:
                    keys = _a.sent();
                    console.log(util_1.default.format('found %s rooms in redis', keys.length));
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < keys.length)) return [3 /*break*/, 5];
                    key = keys[i];
                    return [4 /*yield*/, redis.get(key)];
                case 3:
                    roomData = _a.sent();
                    // console.log(key, roomData);
                    try {
                        rooms.set(key, new room_1.Room(io, vmManagers, key, roomData));
                    }
                    catch (e) {
                        console.error(e);
                    }
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, postgres.query('SELECT * from room')];
                case 6:
                    postgresRooms = (_a.sent()).rows;
                    console.log(util_1.default.format('found %s rooms in postgres', postgresRooms.length));
                    for (i = 0; i < postgresRooms.length; i++) {
                        key = postgresRooms[i].roomId;
                        if (!rooms.has(key)) {
                            rooms.set(key, new room_1.Room(io, vmManagers, key, JSON.stringify(postgresRooms[i])));
                        }
                    }
                    // Start saving rooms
                    saveRooms();
                    _a.label = 7;
                case 7:
                    if (!rooms.has('/default')) {
                        rooms.set('/default', new room_1.Room(io, vmManagers, '/default'));
                    }
                    server.listen(config_1.default.PORT);
                    return [2 /*return*/];
            }
        });
    });
}
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.get('/ping', function (req, res) {
    res.json('pong');
});
// Data's already compressed so go before the compression middleware
app.get('/subtitle/:hash', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var gzipped;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, redis.getBuffer('subtitle:' + req.params.hash)];
            case 1:
                gzipped = _a.sent();
                if (!gzipped) {
                    return [2 /*return*/, res.status(404).end('not found')];
                }
                res.setHeader('Content-Encoding', 'gzip');
                res.end(gzipped);
                return [2 /*return*/];
        }
    });
}); });
app.use(compression_1.default());
app.get('/stats', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(req.query.key && req.query.key === config_1.default.STATS_KEY)) return [3 /*break*/, 2];
                return [4 /*yield*/, getStats()];
            case 1:
                stats = _a.sent();
                if (stats.availableVBrowsers.length === 0) {
                    res.status(500);
                }
                res.json(stats);
                return [3 /*break*/, 3];
            case 2: return [2 /*return*/, res.status(403).json({ error: 'Access Denied' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/timeSeries', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var timeSeriesData, timeSeries;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(req.query.key && req.query.key === config_1.default.STATS_KEY)) return [3 /*break*/, 2];
                return [4 /*yield*/, redis.lrange('timeSeries', 0, -1)];
            case 1:
                timeSeriesData = _a.sent();
                timeSeries = timeSeriesData.map(function (entry) { return JSON.parse(entry); });
                res.json(timeSeries);
                return [3 /*break*/, 3];
            case 2: return [2 /*return*/, res.status(403).json({ error: 'Access Denied' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/youtube', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var items, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(typeof req.query.q === 'string')) return [3 /*break*/, 5];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, youtube_1.searchYoutube(req.query.q)];
            case 2:
                items = _b.sent();
                res.json(items);
                return [3 /*break*/, 4];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: 'youtube error' })];
            case 4: return [3 /*break*/, 6];
            case 5: return [2 /*return*/, res.status(500).json({ error: 'query must be a string' })];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post('/createRoom', function (req, res) {
    var _a;
    var name = names.choose();
    // Keep retrying until no collision
    while (rooms.has(name)) {
        name = names.choose();
    }
    console.log('createRoom: ', name);
    var newRoom = new room_1.Room(io, vmManagers, '/' + name);
    newRoom.video = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.video) || '';
    rooms.set('/' + name, newRoom);
    res.json({ name: name });
});
app.get('/settings', function (req, res) {
    if (req.hostname === config_1.default.CUSTOM_SETTINGS_HOSTNAME) {
        return res.json({
            mediaPath: config_1.default.MEDIA_PATH,
            streamPath: config_1.default.STREAM_PATH,
        });
    }
    return res.json({});
});
app.post('/manageSub', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var decoded, customer, session;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, firebase_1.validateUserToken((_a = req.body) === null || _a === void 0 ? void 0 : _a.uid, (_b = req.body) === null || _b === void 0 ? void 0 : _b.token)];
            case 1:
                decoded = _d.sent();
                if (!decoded) {
                    return [2 /*return*/, res.status(400).json({ error: 'invalid user token' })];
                }
                if (!decoded.email) {
                    return [2 /*return*/, res.status(400).json({ error: 'no email found' })];
                }
                return [4 /*yield*/, stripe_1.getCustomerByEmail(decoded.email)];
            case 2:
                customer = _d.sent();
                if (!customer) {
                    return [2 /*return*/, res.status(400).json({ error: 'customer not found' })];
                }
                return [4 /*yield*/, stripe_1.createSelfServicePortal(customer.id, (_c = req.body) === null || _c === void 0 ? void 0 : _c.return_url)];
            case 3:
                session = _d.sent();
                return [2 /*return*/, res.json(session)];
        }
    });
}); });
app.get('/metadata', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var decoded, customer, isSubscriber;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, firebase_1.validateUserToken((_a = req.query) === null || _a === void 0 ? void 0 : _a.uid, (_b = req.query) === null || _b === void 0 ? void 0 : _b.token)];
            case 1:
                decoded = _f.sent();
                if (!decoded) {
                    return [2 /*return*/, res.status(400).json({ error: 'invalid user token' })];
                }
                if (!decoded.email) {
                    return [2 /*return*/, res.status(400).json({ error: 'no email found' })];
                }
                return [4 /*yield*/, stripe_1.getCustomerByEmail(decoded.email)];
            case 2:
                customer = _f.sent();
                if (!customer) {
                    return [2 /*return*/, res.status(400).json({ error: 'customer not found' })];
                }
                isSubscriber = Boolean(((_e = (_d = (_c = customer.subscriptions) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.status) === 'active');
                return [2 /*return*/, res.json({ isSubscriber: isSubscriber })];
        }
    });
}); });
app.get('/resolveRoom/:vanity', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vanity, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                vanity = req.params.vanity;
                return [4 /*yield*/, postgres.query("SELECT roomId as \"roomId\", vanity from room WHERE LOWER(vanity) = $1", [(_a = vanity === null || vanity === void 0 ? void 0 : vanity.toLowerCase()) !== null && _a !== void 0 ? _a : ''])];
            case 1:
                result = _b.sent();
                // console.log(vanity, result.rows);
                // We also use this for checking name availability, so just return empty response if it doesn't exist (http 200)
                return [2 /*return*/, res.json(result.rows[0])];
        }
    });
}); });
app.get('/listRooms', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var decoded, result;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, firebase_1.validateUserToken((_a = req.query) === null || _a === void 0 ? void 0 : _a.uid, (_b = req.query) === null || _b === void 0 ? void 0 : _b.token)];
            case 1:
                decoded = _c.sent();
                if (!decoded) {
                    return [2 /*return*/, res.status(400).json({ error: 'invalid user token' })];
                }
                return [4 /*yield*/, postgres.query("SELECT roomId as \"roomId\", vanity from room WHERE owner = $1", [decoded.uid])];
            case 2:
                result = _c.sent();
                return [2 /*return*/, res.json(result.rows)];
        }
    });
}); });
app.delete('/deleteRoom', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var decoded, result;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, firebase_1.validateUserToken((_a = req.query) === null || _a === void 0 ? void 0 : _a.uid, (_b = req.query) === null || _b === void 0 ? void 0 : _b.token)];
            case 1:
                decoded = _c.sent();
                if (!decoded) {
                    return [2 /*return*/, res.status(400).json({ error: 'invalid user token' })];
                }
                return [4 /*yield*/, postgres.query("DELETE from room WHERE owner = $1 and roomId = $2", [decoded.uid, req.query.roomId])];
            case 2:
                result = _c.sent();
                return [2 /*return*/, res.json(result.rows)];
        }
    });
}); });
app.get('/kv', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!(req.query.key === config_1.default.KV_KEY)) return [3 /*break*/, 2];
                _b = (_a = res).end;
                return [4 /*yield*/, redis.get(('kv:' + req.query.k))];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            case 2: return [2 /*return*/, res.status(403).json({ error: 'Access Denied' })];
        }
    });
}); });
app.post('/kv', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!(req.query.key === config_1.default.KV_KEY)) return [3 /*break*/, 2];
                _b = (_a = res).end;
                return [4 /*yield*/, redis.setex('kv:' + req.query.k, 24 * 60 * 60, req.query.v)];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            case 2: return [2 /*return*/, res.status(403).json({ error: 'Access Denied' })];
        }
    });
}); });
app.use(express_1.default.static('build'));
// Send index.html for all other requests (SPA)
app.use('/*', function (req, res) {
    res.sendFile(path_1.default.resolve(__dirname + '/../build/index.html'));
});
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    var stats;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getStats()];
            case 1:
                stats = _a.sent();
                return [4 /*yield*/, redis.lpush('timeSeries', JSON.stringify({
                        time: new Date(),
                        availableVBrowsers: stats.availableVBrowsers.length,
                        availableVBrowsersLarge: stats.availableVBrowsersLarge.length,
                        currentUsers: stats.currentUsers,
                        currentVBrowser: stats.currentVBrowser,
                        currentVBrowserLarge: stats.currentVBrowserLarge,
                        currentHttp: stats.currentHttp,
                        currentScreenShare: stats.currentScreenShare,
                        currentFileShare: stats.currentFileShare,
                        currentVideoChat: stats.currentVideoChat,
                        chatMessages: stats.chatMessages,
                        roomCount: stats.roomCount,
                        redisUsage: stats.redisUsage,
                        avgStartMS: stats.vBrowserStartMS.reduce(function (a, b) { return Number(a) + Number(b); }, 0) /
                            stats.vBrowserStartMS.length,
                    }))];
            case 2:
                _a.sent();
                return [4 /*yield*/, redis.ltrim('timeSeries', 0, 250)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }, 5 * 60 * 1000);
function getStats() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var roomData, now, currentUsers, currentHttp, currentVBrowser, currentVBrowserLarge, currentScreenShare, currentFileShare, currentVideoChat, uptime, cpuUsage, redisUsage, availableVBrowsers, stagingVBrowsers, availableVBrowsersLarge, stagingVBrowsersLarge, numPermaRooms, chatMessages, vBrowserStarts, vBrowserLaunches, vBrowserStartMS, vBrowserSessionMS, vBrowserVMLifetime, vBrowserTerminateTimeout, vBrowserTerminateEmpty, vBrowserTerminateManual, recaptchaRejectsLowScore, recaptchaRejectsOther, urlStarts, screenShareStarts, fileShareStarts, videoChatStarts, connectStarts, connectStartsDistinct, subUploads, vBrowserClientIDs, vBrowserUIDs, vBrowserClientIDMinutes, vBrowserUIDMinutes, vBrowserClientIDsCard, vBrowserUIDsCard;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    roomData = [];
                    now = Number(new Date());
                    currentUsers = 0;
                    currentHttp = 0;
                    currentVBrowser = 0;
                    currentVBrowserLarge = 0;
                    currentScreenShare = 0;
                    currentFileShare = 0;
                    currentVideoChat = 0;
                    rooms.forEach(function (room) {
                        var _a, _b, _c, _d, _e;
                        var obj = {
                            creationTime: room.creationTime,
                            roomId: room.roomId,
                            video: room.video,
                            videoTS: room.videoTS,
                            rosterLength: room.roster.length,
                            videoChats: room.roster.filter(function (p) { return p.isVideoChat; }).length,
                            vBrowser: room.vBrowser,
                            vBrowserElapsed: ((_a = room.vBrowser) === null || _a === void 0 ? void 0 : _a.assignTime) && now - ((_b = room.vBrowser) === null || _b === void 0 ? void 0 : _b.assignTime),
                            lock: room.lock || undefined,
                        };
                        currentUsers += obj.rosterLength;
                        currentVideoChat += obj.videoChats;
                        if (obj.vBrowser) {
                            currentVBrowser += 1;
                        }
                        if (obj.vBrowser && obj.vBrowser.large) {
                            currentVBrowserLarge += 1;
                        }
                        if (((_c = obj.video) === null || _c === void 0 ? void 0 : _c.startsWith('http')) && obj.rosterLength) {
                            currentHttp += 1;
                        }
                        if (((_d = obj.video) === null || _d === void 0 ? void 0 : _d.startsWith('screenshare://')) && obj.rosterLength) {
                            currentScreenShare += 1;
                        }
                        if (((_e = obj.video) === null || _e === void 0 ? void 0 : _e.startsWith('fileshare://')) && obj.rosterLength) {
                            currentFileShare += 1;
                        }
                        if (obj.video) {
                            roomData.push(obj);
                        }
                    });
                    // Sort newest first
                    roomData.sort(function (a, b) { return b.creationTime - a.creationTime; });
                    uptime = Number(new Date()) - launchTime;
                    cpuUsage = os_1.default.loadavg();
                    return [4 /*yield*/, redis.info()];
                case 1:
                    redisUsage = (_a = (_b.sent())
                        .split('\n')
                        .find(function (line) { return line.startsWith('used_memory:'); })) === null || _a === void 0 ? void 0 : _a.split(':')[1].trim();
                    return [4 /*yield*/, redis.lrange((vmManager === null || vmManager === void 0 ? void 0 : vmManager.getRedisQueueKey()) || 'availableList', 0, -1)];
                case 2:
                    availableVBrowsers = _b.sent();
                    return [4 /*yield*/, redis.lrange((vmManager === null || vmManager === void 0 ? void 0 : vmManager.getRedisStagingKey()) || 'stagingList', 0, -1)];
                case 3:
                    stagingVBrowsers = _b.sent();
                    return [4 /*yield*/, redis.lrange((vmManagerLarge === null || vmManagerLarge === void 0 ? void 0 : vmManagerLarge.getRedisQueueKey()) || 'availableList', 0, -1)];
                case 4:
                    availableVBrowsersLarge = _b.sent();
                    return [4 /*yield*/, redis.lrange((vmManagerLarge === null || vmManagerLarge === void 0 ? void 0 : vmManagerLarge.getRedisStagingKey()) || 'stagingList', 0, -1)];
                case 5:
                    stagingVBrowsersLarge = _b.sent();
                    return [4 /*yield*/, postgres.query('SELECT count(1) from room')];
                case 6:
                    numPermaRooms = (_b.sent())
                        .rows[0].count;
                    return [4 /*yield*/, redis_1.getRedisCountDay('chatMessages')];
                case 7:
                    chatMessages = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('vBrowserStarts')];
                case 8:
                    vBrowserStarts = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('vBrowserLaunches')];
                case 9:
                    vBrowserLaunches = _b.sent();
                    return [4 /*yield*/, redis.lrange('vBrowserStartMS', 0, -1)];
                case 10:
                    vBrowserStartMS = _b.sent();
                    return [4 /*yield*/, redis.lrange('vBrowserSessionMS', 0, -1)];
                case 11:
                    vBrowserSessionMS = _b.sent();
                    return [4 /*yield*/, redis.lrange('vBrowserVMLifetime', 0, -1)];
                case 12:
                    vBrowserVMLifetime = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('vBrowserTerminateTimeout')];
                case 13:
                    vBrowserTerminateTimeout = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('vBrowserTerminateEmpty')];
                case 14:
                    vBrowserTerminateEmpty = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('vBrowserTerminateManual')];
                case 15:
                    vBrowserTerminateManual = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('recaptchaRejectsLowScore')];
                case 16:
                    recaptchaRejectsLowScore = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('recaptchaRejectsOther')];
                case 17:
                    recaptchaRejectsOther = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('urlStarts')];
                case 18:
                    urlStarts = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('screenShareStarts')];
                case 19:
                    screenShareStarts = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('fileShareStarts')];
                case 20:
                    fileShareStarts = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('videoChatStarts')];
                case 21:
                    videoChatStarts = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('connectStarts')];
                case 22:
                    connectStarts = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDayDistinct('connectStartsDistinct')];
                case 23:
                    connectStartsDistinct = _b.sent();
                    return [4 /*yield*/, redis_1.getRedisCountDay('subUploads')];
                case 24:
                    subUploads = _b.sent();
                    return [4 /*yield*/, redis.zrevrangebyscore('vBrowserClientIDs', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20)];
                case 25:
                    vBrowserClientIDs = _b.sent();
                    return [4 /*yield*/, redis.zrevrangebyscore('vBrowserUIDs', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20)];
                case 26:
                    vBrowserUIDs = _b.sent();
                    return [4 /*yield*/, redis.zrevrangebyscore('vBrowserClientIDMinutes', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20)];
                case 27:
                    vBrowserClientIDMinutes = _b.sent();
                    return [4 /*yield*/, redis.zrevrangebyscore('vBrowserUIDMinutes', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20)];
                case 28:
                    vBrowserUIDMinutes = _b.sent();
                    return [4 /*yield*/, redis.zcard('vBrowserClientIDs')];
                case 29:
                    vBrowserClientIDsCard = _b.sent();
                    return [4 /*yield*/, redis.zcard('vBrowserUIDs')];
                case 30:
                    vBrowserUIDsCard = _b.sent();
                    return [2 /*return*/, {
                            uptime: uptime,
                            roomCount: rooms.size,
                            cpuUsage: cpuUsage,
                            redisUsage: redisUsage,
                            availableVBrowsers: availableVBrowsers,
                            stagingVBrowsers: stagingVBrowsers,
                            availableVBrowsersLarge: availableVBrowsersLarge,
                            stagingVBrowsersLarge: stagingVBrowsersLarge,
                            currentUsers: currentUsers,
                            currentVBrowser: currentVBrowser,
                            currentVBrowserLarge: currentVBrowserLarge,
                            currentHttp: currentHttp,
                            currentScreenShare: currentScreenShare,
                            currentFileShare: currentFileShare,
                            currentVideoChat: currentVideoChat,
                            chatMessages: chatMessages,
                            urlStarts: urlStarts,
                            screenShareStarts: screenShareStarts,
                            fileShareStarts: fileShareStarts,
                            subUploads: subUploads,
                            videoChatStarts: videoChatStarts,
                            connectStarts: connectStarts,
                            connectStartsDistinct: connectStartsDistinct,
                            vBrowserStarts: vBrowserStarts,
                            vBrowserLaunches: vBrowserLaunches,
                            vBrowserTerminateManual: vBrowserTerminateManual,
                            vBrowserTerminateEmpty: vBrowserTerminateEmpty,
                            vBrowserTerminateTimeout: vBrowserTerminateTimeout,
                            recaptchaRejectsLowScore: recaptchaRejectsLowScore,
                            recaptchaRejectsOther: recaptchaRejectsOther,
                            vBrowserStartMS: vBrowserStartMS,
                            vBrowserSessionMS: vBrowserSessionMS,
                            vBrowserVMLifetime: vBrowserVMLifetime,
                            vBrowserClientIDs: vBrowserClientIDs,
                            vBrowserClientIDsCard: vBrowserClientIDsCard,
                            vBrowserClientIDMinutes: vBrowserClientIDMinutes,
                            vBrowserUIDs: vBrowserUIDs,
                            vBrowserUIDsCard: vBrowserUIDsCard,
                            vBrowserUIDMinutes: vBrowserUIDMinutes,
                            numPermaRooms: numPermaRooms,
                            rooms: roomData,
                        }];
            }
        });
    });
}
