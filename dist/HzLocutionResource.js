var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
        define(["require", "exports", "@haztivity/core", "howler", "subtitle", "@haztivity/core", "./HzLocutionSubtitlesBarComponent"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HzLocutionResource = exports.HzLocutionRuntime = void 0;
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
    var subtitle_1 = require("subtitle");
    var core_2 = require("@haztivity/core");
    var HzLocutionSubtitlesBarComponent_1 = require("./HzLocutionSubtitlesBarComponent");
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
            _this.subtitles = [];
            return _this;
        }
        HzLocutionResource_1 = HzLocutionResource;
        HzLocutionResource.prototype.init = function (options, config) {
            var _this = this;
            this._options = this._$.extend(true, {}, HzLocutionResource_1.DEFAULTS, options);
            this.id = this._options.id || this._$element.attr("id") || Date.now().toString();
            this._config = config;
            this._eventEmitter.globalEmitter.on(core_1.NavigatorService.ON_CHANGE_PAGE_START + (".locution-" + this.id), {}, this._onChangePageStart.bind(this));
            this.initializationDefer = this._$.Deferred();
            var subtitlesContainer = this._options.subtitlesContainer ? core_2.ScoFactory.getCurrentSco()._$context.find(this._options.subtitlesContainer) : core_1.$("<div></div>");
            this.$subtitlesContainer = subtitlesContainer;
            var subtitlesPromise = this.processSubtitles();
            subtitlesPromise.always(function () {
                var sound = new howler_1.Howl({
                    src: _this._options.files.split(",")
                });
                sound.on('end', _this._onEnd.bind(_this));
                sound.on("load", _this._onLoad.bind(_this));
                sound.on("loaderror", _this._onLoadError.bind(_this));
                sound.on("playerror", _this._onPlayError.bind(_this));
                sound.on("play", _this._onPlay.bind(_this));
                _this._sound = sound;
                if (_this._options.subtitlesDisabled) {
                    _this.disableSubtitles();
                }
                else {
                    _this.enableSubtitles();
                }
                _this.initializationDefer.resolve();
            });
            if (this._options.playOn != "auto" && this._options.playOn != "none") {
                var config_1 = this._options.playOn, playOn = config_1.split(":"), event_1 = playOn[0], target = playOn.length > 1 ? this._$(playOn[1]) : this._$element;
                target.on(event_1, { instance: this }, this._onTargetEvent);
            }
        };
        Object.defineProperty(HzLocutionResource.prototype, "subtitlesDisabled", {
            get: function () {
                return this._options.subtitlesDisabled;
            },
            enumerable: false,
            configurable: true
        });
        HzLocutionResource.prototype.processSubtitles = function () {
            var _this = this;
            var subtitlesDeferred = this._$.Deferred();
            if (this._options.subtitles) {
                this._$.get(this._options.subtitles).then(function (content) {
                    try {
                        _this.subtitles = subtitle_1.parse(content);
                        if (_this.subtitles && _this.subtitles.length > 0) {
                            _this._$element.addClass(HzLocutionResource_1.CLASS_HAS_SUBTITLES);
                        }
                        else {
                            _this._$element.removeClass(HzLocutionResource_1.CLASS_HAS_SUBTITLES);
                        }
                        subtitlesDeferred.resolve();
                    }
                    catch (e) {
                        console.error("Error parsing the vtt file " + _this._options.subtitles + ": " + content, e);
                        _this._$element.removeClass(HzLocutionResource_1.CLASS_HAS_SUBTITLES);
                        subtitlesDeferred.reject();
                    }
                }).catch(function (err) {
                    console.error("Error downloading the vtt file " + _this._options.subtitles, err);
                    _this._$element.removeClass(HzLocutionResource_1.CLASS_HAS_SUBTITLES);
                    subtitlesDeferred.reject();
                });
            }
            else {
                this._$element.removeClass(HzLocutionResource_1.CLASS_HAS_SUBTITLES);
                subtitlesDeferred.resolve();
            }
            return subtitlesDeferred.promise();
        };
        HzLocutionResource.prototype._onBarEnable = function (e) {
            var instance = e.data.instance;
            instance.enable();
        };
        HzLocutionResource.prototype._onBarDisable = function (e) {
            var instance = e.data.instance;
            instance.disable();
        };
        HzLocutionResource.prototype._onTargetEvent = function (e) {
            var instance = e.data.instance;
            instance._unlock();
            instance.enable();
            instance.initializationDefer.always(function () {
                instance.play();
            });
        };
        HzLocutionResource.prototype._onEnd = function () {
            this.stop();
            this._markAsCompleted();
            this._eventEmitter.trigger(HzLocutionResource_1.ON_END, this);
        };
        HzLocutionResource.prototype._onLoad = function () {
            this._eventEmitter.trigger(HzLocutionResource_1.ON_LOADED, this);
        };
        HzLocutionResource.prototype._onLoadError = function (e, error) {
            if (this._interval) {
                clearInterval(this._interval);
            }
            this._markAsCompleted();
            core_1.Logger.error("HzLocution", error);
            this._eventEmitter.trigger(HzLocutionResource_1.ON_LOAD_ERROR, [this, error]);
        };
        HzLocutionResource.prototype._onPlayError = function (e, error) {
            if (this._interval) {
                clearInterval(this._interval);
            }
            this._markAsCompleted();
            core_1.Logger.error("HzLocution", arguments);
            this._eventEmitter.trigger(HzLocutionResource_1.ON_PLAY_ERROR, [this, error]);
        };
        HzLocutionResource.prototype._onPlay = function () {
            this.registerSubtitlesInterval();
            this._eventEmitter.trigger(HzLocutionResource_1.ON_PLAY, this);
        };
        HzLocutionResource.prototype._onChangePageStart = function () {
            var _this = this;
            this.initializationDefer.always(function () {
                _this.stop();
            });
            this._eventEmitter.globalEmitter.off(core_1.NavigatorService.ON_CHANGE_PAGE_START + (".locution-" + this.id));
        };
        HzLocutionResource.prototype._onFinish = function () {
            this.stop();
            if (!this.isCompleted()) {
                this._markAsCompleted();
            }
        };
        HzLocutionResource.prototype.registerSubtitlesInterval = function () {
            if (this.subtitles && this.subtitles.length > 0 && !this.subtitlesDisabled && this._sound && this.isPlaying) {
                this.clearInterval();
                this._interval = setInterval(this._onTimeInterval.bind(this), 100);
            }
        };
        HzLocutionResource.prototype.clearInterval = function () {
            if (this._interval) {
                clearInterval(this._interval);
                this._interval = null;
            }
        };
        HzLocutionResource.prototype._onTimeInterval = function () {
            this._syncSubtitles();
        };
        HzLocutionResource.prototype.setCurrentCue = function (cue) {
            if (this.isPlaying) {
                if (this.currentSubtitle != cue) {
                    this.currentSubtitle = cue;
                    var cueText = cue ? cue.text.trim() : "";
                    this.updateSubtitlesContent(cueText);
                    if (cueText.length > 0) {
                        this.$subtitlesContainer.removeClass(HzLocutionResource_1.CLASS_SUBTITLES_EMPTY);
                    }
                    else {
                        this.$subtitlesContainer.addClass(HzLocutionResource_1.CLASS_SUBTITLES_EMPTY);
                    }
                    this._eventEmitter.trigger(HzLocutionResource_1.ON_CUE_CHANGE, [this, cue]);
                    this._eventEmitter.globalEmitter.trigger(HzLocutionResource_1.ON_CUE_CHANGE, [this, cue]);
                }
            }
        };
        HzLocutionResource.prototype.updateSubtitlesContent = function (content) {
            this.$subtitlesContainer.html(content);
        };
        HzLocutionResource.prototype.enableSubtitles = function () {
            this._options.subtitlesDisabled = false;
            this._$element.removeClass(HzLocutionResource_1.CLASS_SUBTITLES_DISABLED);
            this.syncSubtitles();
            this.registerSubtitlesInterval();
            this._eventEmitter.trigger(HzLocutionResource_1.ON_SUBTITLES_ENABLED, this);
            this._eventEmitter.globalEmitter.trigger(HzLocutionResource_1.ON_SUBTITLES_ENABLED, this);
        };
        HzLocutionResource.prototype.disableSubtitles = function () {
            this.clearInterval();
            this._options.subtitlesDisabled = true;
            this._$element.addClass(HzLocutionResource_1.CLASS_SUBTITLES_DISABLED);
            this.syncSubtitles();
            this._eventEmitter.trigger(HzLocutionResource_1.ON_SUBTITLES_DISABLED, this);
            this._eventEmitter.globalEmitter.trigger(HzLocutionResource_1.ON_SUBTITLES_DISABLED, this);
        };
        HzLocutionResource.prototype.syncSubtitles = function () {
            if (!this.subtitlesDisabled && this.subtitles) {
                if (this._sound && this.isPlaying) {
                    this._syncSubtitles();
                }
            }
            else {
                this.clearInterval();
                this.setCurrentCue(null);
            }
        };
        HzLocutionResource.prototype._syncSubtitles = function () {
            var currentTime = this._sound.seek() * 1000;
            var cue = this.subtitles.find(function (s) { return currentTime >= s.start && currentTime <= s.end; });
            this.setCurrentCue(cue);
        };
        Object.defineProperty(HzLocutionResource.prototype, "isPlaying", {
            get: function () {
                return this._sound && this._sound.playing();
            },
            enumerable: false,
            configurable: true
        });
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
                this.initializationDefer.always(function () {
                    if (_this.subtitles && !_this.subtitlesDisabled && _this.$subtitlesContainer) {
                        _this.$subtitlesContainer.attr(HzLocutionResource_1.ATTR_SUBTITLES_BAR, _this.id);
                    }
                    if (_this._options.delay) {
                        setTimeout(function () { return _this._sound.play(); }, _this._options.delay);
                    }
                    else {
                        _this._sound.play();
                    }
                });
            }
        };
        HzLocutionResource.prototype.stop = function () {
            var _this = this;
            if (this._sound) {
                this.clearInterval();
                this.initializationDefer.always(function () {
                    _this._sound.stop();
                });
                if (this.$subtitlesContainer) {
                    this.$subtitlesContainer.removeAttr(HzLocutionResource_1.ATTR_SUBTITLES_BAR);
                }
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
            var _this = this;
            if (_super.prototype.enable.call(this)) {
                this.initializationDefer.always(function () {
                    if (_this._options.playOn == "auto") {
                        _this.play();
                    }
                });
            }
        };
        HzLocutionResource.prototype.destroy = function () {
            if (this._sound) {
                this._sound.unload();
            }
            if (this.subtitlesBarComponent) {
                this.subtitlesBarComponent.off(HzLocutionSubtitlesBarComponent_1.HzLocutionSubtitlesBarComponent.NAMESPACE + this.id + "." + HzLocutionSubtitlesBarComponent_1.HzLocutionSubtitlesBarComponent.ON_SUBTITLES_ENABLED);
                this.subtitlesBarComponent.off(HzLocutionSubtitlesBarComponent_1.HzLocutionSubtitlesBarComponent.NAMESPACE + this.id + "." + HzLocutionSubtitlesBarComponent_1.HzLocutionSubtitlesBarComponent.ON_SUBTITLES_DISABLED);
            }
            _super.prototype.destroy.call(this);
        };
        var HzLocutionResource_1;
        HzLocutionResource.NAMESPACE = "hzLocution";
        HzLocutionResource.ON_END = HzLocutionResource_1.NAMESPACE + ":end";
        HzLocutionResource.ON_LOAD_ERROR = HzLocutionResource_1.NAMESPACE + ":loadError";
        HzLocutionResource.ON_LOADED = HzLocutionResource_1.NAMESPACE + ":loaded";
        HzLocutionResource.ON_PLAY_ERROR = HzLocutionResource_1.NAMESPACE + ":playError";
        HzLocutionResource.ON_PLAY = HzLocutionResource_1.NAMESPACE + ":play";
        HzLocutionResource.ON_CUE_CHANGE = HzLocutionResource_1.NAMESPACE + ":cueChange";
        HzLocutionResource.ON_SUBTITLES_ENABLED = HzLocutionResource_1.NAMESPACE + ":subtitlesEnabled";
        HzLocutionResource.ON_SUBTITLES_DISABLED = HzLocutionResource_1.NAMESPACE + ":subtitlesDisabled";
        HzLocutionResource.PREFIX = "hz-quiz";
        HzLocutionResource.CLASS_COMPONENT = "hz-locution";
        HzLocutionResource.CLASS_HAS_SUBTITLES = "hz-locution--has-subtitles";
        HzLocutionResource.CLASS_SUBTITLES_DISABLED = "hz-locution--subtitles-disabled";
        HzLocutionResource.CLASS_SUBTITLES_EMPTY = "hz-locution--subtitles-empty";
        HzLocutionResource.ATTR_SUBTITLES_BAR = "hz-locution-id";
        HzLocutionResource.DEFAULTS_QUIZ = {};
        HzLocutionResource.DEFAULTS = {
            playOn: "auto",
            completeOnPlay: false,
            completeOnStop: false,
            subtitles: null,
            subtitlesDisabled: false
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
    }(core_1.ResourceController));
    exports.HzLocutionResource = HzLocutionResource;
});
//# sourceMappingURL=HzLocutionResource.js.map