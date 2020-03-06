var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
        define(["require", "exports", "@haztivity/core", "./HzLocutionResource"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require("@haztivity/core");
    var HzLocutionResource_1 = require("./HzLocutionResource");
    var HzLocutionSubtitlesBarComponent = /** @class */ (function (_super) {
        __extends(HzLocutionSubtitlesBarComponent, _super);
        function HzLocutionSubtitlesBarComponent(_$, _EventEmitterFactory, _Navigator, _PageManager, _DataOptions) {
            var _this = _super.call(this, _$, _EventEmitterFactory) || this;
            _this._Navigator = _Navigator;
            _this._PageManager = _PageManager;
            _this._DataOptions = _DataOptions;
            _this.currentLocutions = [];
            return _this;
        }
        HzLocutionSubtitlesBarComponent_1 = HzLocutionSubtitlesBarComponent;
        HzLocutionSubtitlesBarComponent.prototype.init = function (options, config) {
            this._options = this._$.extend(true, {}, HzLocutionSubtitlesBarComponent_1.DEFAULTS, options);
            this._config = config;
            this._getElements();
            this._assignEvents();
            if (this._options.subtitlesDisabled) {
                this.disable();
            }
            else {
                this.enable();
            }
        };
        HzLocutionSubtitlesBarComponent.prototype._getElements = function () {
            this._$content = this._$element.find(HzLocutionSubtitlesBarComponent_1.QUERY_CUE);
            this._$toggleBtn = this._$element.find(HzLocutionSubtitlesBarComponent_1.QUERY_ACTION_TOGGLE);
        };
        HzLocutionSubtitlesBarComponent.prototype._assignEvents = function () {
            this._eventEmitter.globalEmitter.on(core_1.PageController.ON_SHOW, { instance: this }, this._onPageShown);
            //this._eventEmitter.globalEmitter.on(HzLocutionResource.ON_CUE_CHANGE, {instance: this}, this._onCueChange);
            //this._eventEmitter.globalEmitter.on(HzLocutionResource.ON_END, {instance: this}, this._onLocutionEnd);
            //this._eventEmitter.globalEmitter.on(HzLocutionResource.ON_PLAY, {instance: this}, this._onLocutionPlay);
            this._$toggleBtn.on("click." + HzLocutionSubtitlesBarComponent_1.NAMESPACE, { instance: this }, this._onToggleClick);
        };
        HzLocutionSubtitlesBarComponent.prototype._onPageShown = function (e, $page, $oldPage, oldPageRelativePosition, pageController) {
            var instance = e.data.instance;
            instance.currentLocutions = pageController.getElement().find("[data-hz-resource='HzLocution']").toArray().map(function (l) { return instance._$.data(l, "hzResourceInstance"); });
            instance.currentLocutions.forEach(function (l) {
                l.off("." + HzLocutionSubtitlesBarComponent_1.NAMESPACE);
                l.on(HzLocutionResource_1.HzLocutionResource.ON_PLAY + "." + HzLocutionSubtitlesBarComponent_1.NAMESPACE, { instance: instance }, instance._onLocutionPlay);
                l.on(HzLocutionResource_1.HzLocutionResource.ON_END + "." + HzLocutionSubtitlesBarComponent_1.NAMESPACE, { instance: instance }, instance._onLocutionEnd);
                l.on(HzLocutionResource_1.HzLocutionResource.ON_CUE_CHANGE + "." + HzLocutionSubtitlesBarComponent_1.NAMESPACE, { instance: instance }, instance._onCueChange);
                if (instance.subtitlesDisabled) {
                    l.disableSubtitles();
                }
                else {
                    l.enableSubtitles();
                }
            });
        };
        HzLocutionSubtitlesBarComponent.prototype._onCueChange = function (e, locutionResource, cue) {
            var instance = e.data.instance;
            var text = cue ? cue.text.trim() : "";
            instance._$content.html(text);
            if (text.length == 0 && !instance.subtitlesDisabled) {
                instance._$element.addClass(HzLocutionSubtitlesBarComponent_1.CLASS_EMPTY);
            }
            else {
                instance._$element.removeClass(HzLocutionSubtitlesBarComponent_1.CLASS_EMPTY);
            }
        };
        HzLocutionSubtitlesBarComponent.prototype._onLocutionEnd = function (e, locutionResource) {
            var instance = e.data.instance;
            instance._$element.removeAttr(HzLocutionSubtitlesBarComponent_1.ATTR_SUBTITLES_BAR);
        };
        HzLocutionSubtitlesBarComponent.prototype._onLocutionPlay = function (e, locutionResource) {
            var instance = e.data.instance;
            instance._$element.attr(HzLocutionSubtitlesBarComponent_1.ATTR_SUBTITLES_BAR, locutionResource.id);
        };
        HzLocutionSubtitlesBarComponent.prototype._onToggleClick = function (e) {
            var instance = e.data.instance;
            if (instance.subtitlesDisabled) {
                instance.enable();
            }
            else {
                instance.disable();
            }
        };
        HzLocutionSubtitlesBarComponent.prototype.enable = function () {
            this._options.subtitlesDisabled = false;
            this.currentLocutions.forEach(function (l) { return l.enableSubtitles(); });
            this._$element.removeClass(HzLocutionSubtitlesBarComponent_1.CLASS_DISABLED);
            this._eventEmitter.trigger(HzLocutionSubtitlesBarComponent_1.ON_SUBTITLES_ENABLED);
        };
        HzLocutionSubtitlesBarComponent.prototype.disable = function () {
            this._options.subtitlesDisabled = true;
            this.currentLocutions.forEach(function (l) { return l.disableSubtitles(); });
            this._$element.addClass(HzLocutionSubtitlesBarComponent_1.CLASS_DISABLED);
            this._eventEmitter.trigger(HzLocutionSubtitlesBarComponent_1.ON_SUBTITLES_DISABLED);
        };
        HzLocutionSubtitlesBarComponent.prototype.setContent = function (content) {
            if (content === void 0) { content = ""; }
            this._$content.html(content);
            if (content.trim().length > 0) {
                this._$element.removeClass(HzLocutionSubtitlesBarComponent_1.CLASS_EMPTY);
            }
            else {
                this._$element.addClass(HzLocutionSubtitlesBarComponent_1.CLASS_EMPTY);
            }
        };
        Object.defineProperty(HzLocutionSubtitlesBarComponent.prototype, "subtitlesDisabled", {
            get: function () {
                return this._options.subtitlesDisabled;
            },
            enumerable: true,
            configurable: true
        });
        var HzLocutionSubtitlesBarComponent_1;
        HzLocutionSubtitlesBarComponent.NAMESPACE = "hzLocutionSubtitlesBar";
        HzLocutionSubtitlesBarComponent.ON_SUBTITLES_ENABLED = HzLocutionSubtitlesBarComponent_1.NAMESPACE + ":subtitlesEnabled";
        HzLocutionSubtitlesBarComponent.ON_SUBTITLES_DISABLED = HzLocutionSubtitlesBarComponent_1.NAMESPACE + ":subtitlesDisabled";
        HzLocutionSubtitlesBarComponent.PREFIX = "hz-locution-subtitles-bar";
        HzLocutionSubtitlesBarComponent.QUERY_ACTION_TOGGLE = "[data-" + HzLocutionSubtitlesBarComponent_1.PREFIX + "-toggler]";
        HzLocutionSubtitlesBarComponent.QUERY_CUE = "[data-" + HzLocutionSubtitlesBarComponent_1.PREFIX + "-cue]";
        HzLocutionSubtitlesBarComponent.CLASS_DISABLED = "hz-locution-subtitles-bar--disabled";
        HzLocutionSubtitlesBarComponent.CLASS_EMPTY = "hz-locution-subtitles-bar--empty";
        HzLocutionSubtitlesBarComponent.ATTR_SUBTITLES_BAR = "hz-locution-id";
        HzLocutionSubtitlesBarComponent.DEFAULTS = {
            subtitlesDisabled: false
        };
        HzLocutionSubtitlesBarComponent = HzLocutionSubtitlesBarComponent_1 = __decorate([
            core_1.Component({
                name: "HzLocutionSubtitlesBar",
                dependencies: [
                    core_1.$,
                    core_1.EventEmitterFactory,
                    core_1.Navigator,
                    core_1.PageManager,
                    core_1.DataOptions
                ]
            })
        ], HzLocutionSubtitlesBarComponent);
        return HzLocutionSubtitlesBarComponent;
    }(core_1.ComponentController));
    exports.HzLocutionSubtitlesBarComponent = HzLocutionSubtitlesBarComponent;
});
//# sourceMappingURL=HzLocutionSubtitlesBarComponent.js.map