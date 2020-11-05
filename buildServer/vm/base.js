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
exports.VMManager = void 0;
var config_1 = __importDefault(require("../config"));
var ioredis_1 = __importDefault(require("ioredis"));
var axios_1 = __importDefault(require("axios"));
var uuid_1 = require("uuid");
var redis_1 = require("../utils/redis");
var time_1 = require("../utils/time");
var releaseInterval = 5 * 60 * 1000;
var VMManager = /** @class */ (function () {
    function VMManager(rooms, vmBufferSize, large) {
        var _this = this;
        this.vmBufferSize = 0;
        this.tag = config_1.default.VBROWSER_TAG || 'vbrowser';
        this.isLarge = false;
        this.redis = new ioredis_1.default(config_1.default.REDIS_URL);
        this.redis2 = new ioredis_1.default(config_1.default.REDIS_URL);
        this.redis3 = new ioredis_1.default(config_1.default.REDIS_URL);
        this.getFixedSize = function () {
            return _this.isLarge
                ? Number(config_1.default.VM_POOL_FIXED_SIZE_LARGE)
                : Number(config_1.default.VM_POOL_FIXED_SIZE);
        };
        this.getRedisQueueKey = function () {
            return _this.redisQueueKey + (_this.isLarge ? 'Large' : '');
        };
        this.getRedisStagingKey = function () {
            return _this.redisStagingKey + (_this.isLarge ? 'Large' : '');
        };
        this.assignVM = function () { return __awaiter(_this, void 0, void 0, function () {
            var assignStart, selected, availableCount, stagingCount, fixedSize, resp, id, lock, candidate, assignEnd, assignElapsed, retVal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assignStart = Number(new Date());
                        selected = null;
                        _a.label = 1;
                    case 1:
                        if (!!selected) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.redis.llen(this.getRedisQueueKey())];
                    case 2:
                        availableCount = _a.sent();
                        return [4 /*yield*/, this.redis.llen(this.getRedisStagingKey())];
                    case 3:
                        stagingCount = _a.sent();
                        fixedSize = this.getFixedSize();
                        if (!(availableCount + stagingCount === 0 && !fixedSize)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.startVMWrapper()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.redis2.brpop(this.getRedisQueueKey(), 0)];
                    case 6:
                        resp = _a.sent();
                        id = resp[1];
                        console.log('[ASSIGN]', id);
                        return [4 /*yield*/, this.redis.set('vbrowser:' + id, '1', 'NX', 'EX', 300)];
                    case 7:
                        lock = _a.sent();
                        if (!lock) {
                            console.log('failed to acquire lock on VM:', id);
                            return [3 /*break*/, 1];
                        }
                        return [4 /*yield*/, this.getVM(id)];
                    case 8:
                        candidate = _a.sent();
                        selected = candidate;
                        return [3 /*break*/, 1];
                    case 9:
                        assignEnd = Number(new Date());
                        assignElapsed = assignEnd - assignStart;
                        return [4 /*yield*/, this.redis.lpush('vBrowserStartMS', assignElapsed)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.redis.ltrim('vBrowserStartMS', 0, 99)];
                    case 11:
                        _a.sent();
                        console.log('[ASSIGN]', selected.id, assignElapsed + 'ms');
                        retVal = __assign(__assign({}, selected), { assignTime: Number(new Date()) });
                        return [2 /*return*/, retVal];
                }
            });
        }); };
        this.resetVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[RESET]', id);
                        // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
                        // Otherwise terminating them is simpler but more expensive since they're billed for an hour
                        return [4 /*yield*/, this.rebootVM(id)];
                    case 1:
                        // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
                        // Otherwise terminating them is simpler but more expensive since they're billed for an hour
                        _a.sent();
                        // Delete any locks
                        return [4 /*yield*/, this.redis.del('vbrowser:' + id)];
                    case 2:
                        // Delete any locks
                        _a.sent();
                        // We wait to give the VM time to shut down (if it's restarting)
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                    case 3:
                        // We wait to give the VM time to shut down (if it's restarting)
                        _a.sent();
                        // Add the VM back to the pool
                        return [4 /*yield*/, this.redis.lpush(this.getRedisStagingKey(), id)];
                    case 4:
                        // Add the VM back to the pool
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.resizeVMGroupIncr = function () { return __awaiter(_this, void 0, void 0, function () {
            var maxAvailable, availableCount, stagingCount, launch, fixedSize, listVMs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxAvailable = this.vmBufferSize;
                        return [4 /*yield*/, this.redis.llen(this.getRedisQueueKey())];
                    case 1:
                        availableCount = _a.sent();
                        return [4 /*yield*/, this.redis.llen(this.getRedisStagingKey())];
                    case 2:
                        stagingCount = _a.sent();
                        launch = false;
                        fixedSize = this.getFixedSize();
                        if (!fixedSize) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.listVMs()];
                    case 3:
                        listVMs = _a.sent();
                        launch = listVMs.length + stagingCount < fixedSize;
                        return [3 /*break*/, 5];
                    case 4:
                        launch = availableCount + stagingCount < maxAvailable;
                        _a.label = 5;
                    case 5:
                        if (launch) {
                            console.log('[RESIZE-LAUNCH]', 'desired:', maxAvailable, 'available:', availableCount, 'staging:', stagingCount);
                            this.startVMWrapper();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.resizeVMGroupDecr = function () { return __awaiter(_this, void 0, void 0, function () {
            var unlaunch, fixedSize, allVMs, maxAvailable, availableCount, now_1, sortedVMs, id;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        unlaunch = false;
                        fixedSize = this.getFixedSize();
                        return [4 /*yield*/, this.listVMs()];
                    case 1:
                        allVMs = _b.sent();
                        if (!fixedSize) return [3 /*break*/, 2];
                        unlaunch = allVMs.length > fixedSize;
                        return [3 /*break*/, 4];
                    case 2:
                        maxAvailable = this.vmBufferSize;
                        return [4 /*yield*/, this.redis.llen(this.getRedisQueueKey())];
                    case 3:
                        availableCount = _b.sent();
                        unlaunch = availableCount > maxAvailable;
                        _b.label = 4;
                    case 4:
                        if (!unlaunch) return [3 /*break*/, 7];
                        now_1 = Date.now();
                        sortedVMs = allVMs.sort(function (a, b) { var _a; return -((_a = a.creation_date) === null || _a === void 0 ? void 0 : _a.localeCompare(b.creation_date)); });
                        sortedVMs = sortedVMs.filter(function (vm) { return now_1 - Number(new Date(vm.creation_date)) > 45 * 60 * 1000; });
                        id = (_a = sortedVMs[0]) === null || _a === void 0 ? void 0 : _a.id;
                        if (!id) return [3 /*break*/, 7];
                        console.log('[RESIZE-UNLAUNCH]', id);
                        return [4 /*yield*/, this.redis.lrem(this.getRedisQueueKey(), 1, id)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.terminateVMWrapper(id)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.cleanupVMGroup = function () { return __awaiter(_this, void 0, void 0, function () {
            var allVMs, usedKeys, availableKeys, stagingKeys, dontDelete, i, server;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listVMs()];
                    case 1:
                        allVMs = _a.sent();
                        return [4 /*yield*/, this.redis.keys('vbrowser:*')];
                    case 2:
                        usedKeys = (_a.sent()).map(function (key) {
                            return key.slice('vbrowser:'.length);
                        });
                        return [4 /*yield*/, this.redis.lrange(this.getRedisQueueKey(), 0, -1)];
                    case 3:
                        availableKeys = _a.sent();
                        return [4 /*yield*/, this.redis.lrange(this.getRedisStagingKey(), 0, -1)];
                    case 4:
                        stagingKeys = _a.sent();
                        dontDelete = new Set(__spreadArrays(usedKeys, availableKeys, stagingKeys));
                        // console.log(allVMs, dontDelete);
                        for (i = 0; i < allVMs.length; i++) {
                            server = allVMs[i];
                            if (!dontDelete.has(server.id)) {
                                // this.terminateVMWrapper(server.id);
                                this.resetVM(server.id);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.checkStaging = function () { return __awaiter(_this, void 0, void 0, function () {
            var id, ready, candidate, e_1, retryCount;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.redis3.brpoplpush(this.getRedisStagingKey(), this.getRedisStagingKey(), 0)];
                    case 1:
                        id = _b.sent();
                        ready = false;
                        candidate = undefined;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.getVM(id)];
                    case 3:
                        candidate = _b.sent();
                        return [4 /*yield*/, this.checkVMReady(candidate.host)];
                    case 4:
                        ready = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _b.sent();
                        console.log('[CHECKSTAGING-ERROR]', id, (_a = e_1 === null || e_1 === void 0 ? void 0 : e_1.response) === null || _a === void 0 ? void 0 : _a.status);
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this.redis.incr(this.getRedisStagingKey() + ':' + id)];
                    case 7:
                        retryCount = _b.sent();
                        if (retryCount % 20 === 0) {
                            this.powerOn(id);
                        }
                        if (!ready) return [3 /*break*/, 9];
                        console.log('[CHECKSTAGING] ready:', id, candidate === null || candidate === void 0 ? void 0 : candidate.host, retryCount);
                        // If it is, move it to available list
                        return [4 /*yield*/, this.redis
                                .multi()
                                .lrem(this.getRedisStagingKey(), 1, id)
                                .lpush(this.getRedisQueueKey(), id)
                                .del(this.getRedisStagingKey() + ':' + id)
                                .exec()];
                    case 8:
                        // If it is, move it to available list
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        console.log('[CHECKSTAGING] not ready:', id, candidate === null || candidate === void 0 ? void 0 : candidate.host, retryCount);
                        if (!(retryCount > 600)) return [3 /*break*/, 11];
                        console.log('[CHECKSTAGING] giving up:', id);
                        return [4 /*yield*/, this.redis.del(this.getRedisStagingKey() + ':' + id)];
                    case 10:
                        _b.sent();
                        // this.resetVM(id);
                        this.terminateVMWrapper(id);
                        _b.label = 11;
                    case 11: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 0];
                    case 13: return [2 /*return*/];
                }
            });
        }); };
        this.checkVMReady = function (host) { return __awaiter(_this, void 0, void 0, function () {
            var url, response4, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = 'https://' + host + '/healthz';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'GET',
                                url: url,
                                timeout: 1000,
                            })];
                    case 2:
                        response4 = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/, true];
                }
            });
        }); };
        this.startVMWrapper = function () { return __awaiter(_this, void 0, void 0, function () {
            var password, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        password = uuid_1.v4();
                        return [4 /*yield*/, this.startVM(password)];
                    case 1:
                        id = _a.sent();
                        return [4 /*yield*/, this.redis.lpush(this.getRedisStagingKey(), id)];
                    case 2:
                        _a.sent();
                        redis_1.redisCount('vBrowserLaunches');
                        return [2 /*return*/, id];
                }
            });
        }); };
        this.terminateVMWrapper = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var lifetime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[TERMINATE]', id);
                        // Remove from lists, if it exists
                        return [4 /*yield*/, this.redis.lrem(this.getRedisQueueKey(), 1, id)];
                    case 1:
                        // Remove from lists, if it exists
                        _a.sent();
                        return [4 /*yield*/, this.redis.lrem(this.getRedisStagingKey(), 1, id)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.terminateVMMetrics(id)];
                    case 3:
                        lifetime = _a.sent();
                        return [4 /*yield*/, this.terminateVM(id)];
                    case 4:
                        _a.sent();
                        if (!lifetime) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.redis.lpush('vBrowserVMLifetime', lifetime)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.redis.ltrim('vBrowserVMLifetime', 0, 49)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.terminateVMMetrics = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var vm, lifetime, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getVM(id)];
                    case 1:
                        vm = _a.sent();
                        lifetime = Number(new Date()) - Number(new Date(vm.creation_date));
                        return [2 /*return*/, lifetime];
                    case 2:
                        e_3 = _a.sent();
                        console.warn(e_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, 0];
                }
            });
        }); };
        if (vmBufferSize !== undefined) {
            this.vmBufferSize = vmBufferSize;
        }
        else {
            if (large) {
                this.vmBufferSize = Number(config_1.default.VBROWSER_VM_BUFFER_LARGE) || 0;
            }
            else {
                this.vmBufferSize = Number(config_1.default.VBROWSER_VM_BUFFER) || 0;
            }
        }
        if (large) {
            this.tag += 'Large';
            this.isLarge = true;
        }
        var release = function () { return __awaiter(_this, void 0, void 0, function () {
            var roomArr, i, room, maxTime, elapsed, isTimedOut, isAlmostTimedOut, isRoomEmpty;
            return __generator(this, function (_a) {
                roomArr = Array.from(rooms.values());
                for (i = 0; i < roomArr.length; i++) {
                    room = roomArr[i];
                    if (room.vBrowser &&
                        room.vBrowser.assignTime &&
                        (!room.vBrowser.provider ||
                            room.vBrowser.provider === this.getRedisQueueKey())) {
                        maxTime = room.vBrowser.large
                            ? 12 * 60 * 60 * 1000
                            : 3 * 60 * 60 * 1000;
                        elapsed = Number(new Date()) - room.vBrowser.assignTime;
                        isTimedOut = elapsed > maxTime;
                        isAlmostTimedOut = elapsed > maxTime - releaseInterval;
                        isRoomEmpty = room.roster.length === 0;
                        if (isTimedOut || isRoomEmpty) {
                            console.log('[RELEASE] VM in room:', room.roomId);
                            room.stopVBrowser();
                            if (isTimedOut) {
                                room.addChatMessage(undefined, {
                                    id: '',
                                    system: true,
                                    cmd: 'vBrowserTimeout',
                                    msg: '',
                                });
                                redis_1.redisCount('vBrowserTerminateTimeout');
                            }
                            else if (isRoomEmpty) {
                                redis_1.redisCount('vBrowserTerminateEmpty');
                            }
                        }
                        else if (isAlmostTimedOut) {
                            room.addChatMessage(undefined, {
                                id: '',
                                system: true,
                                cmd: 'vBrowserAlmostTimeout',
                                msg: '',
                            });
                        }
                    }
                }
                return [2 /*return*/];
            });
        }); };
        var renew = function () { return __awaiter(_this, void 0, void 0, function () {
            var roomArr, i, room, expireTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roomArr = Array.from(rooms.values());
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < roomArr.length)) return [3 /*break*/, 9];
                        room = roomArr[i];
                        if (!(room.vBrowser &&
                            room.vBrowser.id &&
                            (!room.vBrowser.provider ||
                                room.vBrowser.provider === this.getRedisQueueKey()))) return [3 /*break*/, 8];
                        console.log('[RENEW] VM in room:', room.roomId, room.vBrowser.id);
                        // Renew the lock on the VM
                        return [4 /*yield*/, this.redis.expire('vbrowser:' + room.vBrowser.id, 300)];
                    case 2:
                        // Renew the lock on the VM
                        _a.sent();
                        expireTime = time_1.getStartOfDay() / 1000 + 86400;
                        if (!room.vBrowser.creatorClientID) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.redis.zincrby('vBrowserClientIDMinutes', 1, room.vBrowser.creatorClientID)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.redis.expireat('vBrowserClientIDMinutes', expireTime)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!room.vBrowser.creatorUID) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.redis.zincrby('vBrowserUIDMinutes', 1, room.vBrowser.creatorUID)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.redis.expireat('vBrowserUIDMinutes', expireTime)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        setInterval(this.resizeVMGroupIncr, 10 * 1000);
        setInterval(this.resizeVMGroupDecr, 3 * 60 * 1000);
        setInterval(this.cleanupVMGroup, 3 * 60 * 1000);
        setInterval(renew, 60 * 1000);
        setInterval(release, releaseInterval);
        setTimeout(this.checkStaging, 100); // Add some delay to make sure the object is constructed first
    }
    return VMManager;
}());
exports.VMManager = VMManager;
