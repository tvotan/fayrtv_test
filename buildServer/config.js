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
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var defaults = {
    REDIS_URL: '',
    DATABASE_URL: '',
    YOUTUBE_API_KEY: '',
    NODE_ENV: '',
    FIREBASE_ADMIN_SDK_CONFIG: '',
    FIREBASE_DATABASE_URL: '',
    STRIPE_SECRET_KEY: '',
    VBROWSER_VM_BUFFER_LARGE: 0,
    VBROWSER_VM_BUFFER: 0,
    VM_POOL_FIXED_SIZE_LARGE: 0,
    VM_POOL_FIXED_SIZE: 0,
    VBROWSER_TAG: '',
    DO_TOKEN: '',
    HETZNER_TOKEN: '',
    SCW_SECRET_KEY: '',
    SCW_ORGANIZATION_ID: '',
    DOCKER_VM_HOST: '',
    DOCKER_VM_HOST_SSH_USER: '',
    DOCKER_VM_HOST_SSH_KEY_BASE64: '',
    RECAPTCHA_SECRET_KEY: '',
    HTTPS: '',
    SSL_KEY_FILE: '',
    SSL_CRT_FILE: '',
    PORT: 8080,
    STATS_KEY: '',
    CUSTOM_SETTINGS_HOSTNAME: '',
    MEDIA_PATH: '',
    STREAM_PATH: '',
    KV_KEY: '',
};
exports.default = __assign(__assign({}, defaults), process.env);
