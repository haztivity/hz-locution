var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@haztivity/core", "howler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Davinchi. All Rights Reserved.
     */
    var core_1 = require("@haztivity/core");
    var howler_1 = require("howler");
    var HzLocutionRuntime = /** @class */ (function () {
        function HzLocutionRuntime() {
        }
        return HzLocutionRuntime;
    }());
    exports.HzLocutionRuntime = HzLocutionRuntime;
    var HzLocutionResource = /** @class */ (function (_super) {
        __extends(HzLocutionResource, _super);
        /**
         * Resource to add locution (audio). Only one locution could be played at the same time
         * @param _$
         * @param _eventEmitterFactory
         * @param _scormService
         * @example
         */
        function HzLocutionResource(_$, _eventEmitterFactory, _scormService, _dataOptions, _navigatorService) {
            var _this = _super.call(this, _$, _eventEmitterFactory) || this;
            _this._scormService = _scormService;
            _this._dataOptions = _dataOptions;
            _this._navigatorService = _navigatorService;
            return _this;
        }
        HzLocutionResource_1 = HzLocutionResource;
        HzLocutionResource.prototype.init = function (options, config) {
            this._options = this._$.extend(true, {}, HzLocutionResource_1.DEFAULTS, options);
            this._config = config;
            this._navigatorService.on(core_1.NavigatorService.ON_CHANGE_PAGE_START, this._onChangePageStart.bind(this));
            var sound = new howler_1.Howl({
                src: this._options.files.split(",")
            });
            sound.on('end', this._onEnd.bind(this));
            sound.on("load", this._onLoad.bind(this));
            sound.on("loaderror", this._onLoadError.bind(this));
            sound.on("playerror", this._onPlayError.bind(this));
            sound.on("play", this._onPlay.bind(this));
            this._sound = sound;
            if (this._options.playOn != "auto" && this._options.playOn != "none") {
                var config_1 = this._options.playOn, playOn = config_1.split(":"), event_1 = playOn[0], target = playOn.length > 1 ? this._$(playOn[1]) : this._$element;
                target.on(event_1, { instance: this }, this._onTargetEvent);
            }
        };
        HzLocutionResource.prototype._onTargetEvent = function (e) {
            var instance = e.data.instance;
            instance._unlock();
            instance.enable();
            instance.play();
        };
        HzLocutionResource.prototype._onEnd = function () {
            this._markAsCompleted();
            this._eventEmitter.trigger(HzLocutionResource_1.ON_END);
        };
        HzLocutionResource.prototype._onLoad = function () {
            this._eventEmitter.trigger(HzLocutionResource_1.ON_LOADED);
        };
        HzLocutionResource.prototype._onLoadError = function (e, error) {
            this._markAsCompleted();
            core_1.Logger.error("HzLocution", error);
            this._eventEmitter.trigger(HzLocutionResource_1.ON_LOAD_ERROR, error);
        };
        HzLocutionResource.prototype._onPlayError = function (e, error) {
            this._markAsCompleted();
            core_1.Logger.error("HzLocution", arguments);
            this._eventEmitter.trigger(HzLocutionResource_1.ON_PLAY_ERROR);
        };
        HzLocutionResource.prototype._onPlay = function () {
            this._eventEmitter.trigger(HzLocutionResource_1.ON_PLAY);
        };
        HzLocutionResource.prototype._onChangePageStart = function () {
            this.stop();
        };
        HzLocutionResource.prototype._onFinish = function () {
            if (!this.isCompleted()) {
                this._markAsCompleted();
            }
        };
        HzLocutionResource.prototype.play = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            if (force) {
                this._unlock();
                this.enable();
            }
            if (!this.isDisabled() && this._sound) {
                //stop the current audio
                if (HzLocutionRuntime.currentAudio) {
                    HzLocutionRuntime.currentAudio.stop();
                }
                HzLocutionRuntime.currentAudio = this._sound;
                if (this._options.delay) {
                    setTimeout(function () { return _this._sound.play(); }, this._options.delay);
                }
                else {
                    this._sound.play();
                }
            }
        };
        HzLocutionResource.prototype.stop = function () {
            if (this._sound) {
                this._sound.stop();
                if (this._options.completeOnStop) {
                    this._markAsCompleted();
                }
            }
        };
        HzLocutionResource.prototype.disable = function () {
            if (_super.prototype.disable.call(this)) {
                this.stop();
            }
        };
        HzLocutionResource.prototype.enable = function () {
            if (_super.prototype.enable.call(this)) {
                if (this._options.playOn == "auto") {
                    this.play();
                }
            }
        };
        HzLocutionResource.prototype.destroy = function () {
            if (this._sound) {
                this._sound.unload();
            }
            _super.prototype.destroy.call(this);
        };
        HzLocutionResource.NAMESPACE = "hzLocution";
        HzLocutionResource.ON_END = HzLocutionResource_1.NAMESPACE + ":end";
        HzLocutionResource.ON_LOAD_ERROR = HzLocutionResource_1.NAMESPACE + ":loadError";
        HzLocutionResource.ON_LOADED = HzLocutionResource_1.NAMESPACE + ":loaded";
        HzLocutionResource.ON_PLAY_ERROR = HzLocutionResource_1.NAMESPACE + ":playError";
        HzLocutionResource.ON_PLAY = HzLocutionResource_1.NAMESPACE + ":play";
        HzLocutionResource.PREFIX = "hz-quiz";
        HzLocutionResource.CLASS_COMPONENT = HzLocutionResource_1.PREFIX;
        HzLocutionResource.DEFAULTS_QUIZ = {};
        HzLocutionResource.DEFAULTS = {
            playOn: "auto",
            completeOnPlay: false,
            completeOnStop: false
        };
        HzLocutionResource = HzLocutionResource_1 = __decorate([
            core_1.Resource({
                name: "HzLocution",
                dependencies: [
                    core_1.$,
                    core_1.EventEmitterFactory,
                    core_1.ScormService,
                    core_1.DataOptions,
                    core_1.NavigatorService
                ]
            })
        ], HzLocutionResource);
        return HzLocutionResource;
        var HzLocutionResource_1;
    }(core_1.ResourceController));
    exports.HzLocutionResource = HzLocutionResource;
});
//# sourceMappingURL=HzLocutionResource.js.map