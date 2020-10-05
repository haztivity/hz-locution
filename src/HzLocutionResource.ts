/**
 * @license
 * Copyright Davinchi. All Rights Reserved.
 */
import {
    $,
    Resource,
    ResourceController,
    EventEmitterFactory,
    ScormService,
    NavigatorService,
    DataOptions,
    Logger
} from "@haztivity/core";
import {Howl,Howler} from "howler";
export class HzLocutionRuntime{
    static currentAudio:Howl;
}
import { parse, stringify, stringifyVtt, resync, toMS, toSrtTime, toVttTime } from "subtitle";
import {ScoFactory} from "@haztivity/core";
import {HzLocutionSubtitlesBarComponent} from "./HzLocutionSubtitlesBarComponent";
@Resource(
    {
        name: "HzLocution",
        dependencies: [
            $,
            EventEmitterFactory,
            ScormService,
            DataOptions,
            NavigatorService
        ]
    }
)
export class HzLocutionResource extends ResourceController {
    public static readonly NAMESPACE = "hzLocution";
    public static readonly ON_END = `${HzLocutionResource.NAMESPACE}:end`;
    public static readonly ON_LOAD_ERROR = `${HzLocutionResource.NAMESPACE}:loadError`;
    public static readonly ON_LOADED = `${HzLocutionResource.NAMESPACE}:loaded`;
    public static readonly ON_PLAY_ERROR = `${HzLocutionResource.NAMESPACE}:playError`;
    public static readonly ON_PLAY = `${HzLocutionResource.NAMESPACE}:play`;
    public static readonly ON_CUE_CHANGE = `${HzLocutionResource.NAMESPACE}:cueChange`;
    public static readonly ON_SUBTITLES_ENABLED = `${HzLocutionResource.NAMESPACE}:subtitlesEnabled`;
    public static readonly ON_SUBTITLES_DISABLED = `${HzLocutionResource.NAMESPACE}:subtitlesDisabled`;
    protected static readonly PREFIX = "hz-quiz";
    protected static readonly CLASS_COMPONENT = "hz-locution";
    protected static readonly CLASS_HAS_SUBTITLES = "hz-locution--has-subtitles";
    protected static readonly CLASS_SUBTITLES_DISABLED = "hz-locution--subtitles-disabled";
    protected static readonly CLASS_SUBTITLES_EMPTY = "hz-locution--subtitles-empty";
    protected static readonly ATTR_SUBTITLES_BAR = "hz-locution-id";
    protected static readonly DEFAULTS_QUIZ = {

    };
    protected static readonly DEFAULTS = {
        playOn:"auto",
        completeOnPlay:false,
        completeOnStop:false,
        subtitles: null,
        subtitlesDisabled: false
    };
    protected _config:any;
    protected _sound;
    protected _interval;
    protected initializationDefer;
    protected subtitles = [];
    protected $subtitlesContainer;
    protected currentSubtitle;
    protected subtitlesBarComponent: HzLocutionSubtitlesBarComponent;
    public readonly id;
    /**
     * Resource to add locution (audio). Only one locution could be played at the same time
     * @param _$
     * @param _eventEmitterFactory
     * @param _scormService
     * @example
     */
    constructor(_$: JQueryStatic, _eventEmitterFactory,protected _scormService:ScormService, protected _dataOptions, protected _navigatorService) {
        super(_$, _eventEmitterFactory);
    }

    init(options, config?) {
        this._options = this._$.extend(true,{},HzLocutionResource.DEFAULTS,options);
        this.id = this._options.id || this._$element.attr("id") || Date.now().toString();
        this._config = config;
        this._eventEmitter.globalEmitter.on(NavigatorService.ON_CHANGE_PAGE_START+`.locution-${this.id}`,{},this._onChangePageStart.bind(this));
        this.initializationDefer = this._$.Deferred();
        const subtitlesContainer = this._options.subtitlesContainer ? ScoFactory.getCurrentSco()._$context.find(this._options.subtitlesContainer) : $("<div></div>");
        this.$subtitlesContainer = subtitlesContainer;

        const subtitlesPromise = this.processSubtitles();
        subtitlesPromise.always(()=> {
            let sound = new Howl({
                src: this._options.files.split(",")
            });
            sound.on('end',this._onEnd.bind(this));
            sound.on("load",this._onLoad.bind(this));
            sound.on("loaderror",this._onLoadError.bind(this));
            sound.on("playerror",this._onPlayError.bind(this));
            sound.on("play",this._onPlay.bind(this));
            this._sound = sound;
            if (this._options.subtitlesDisabled) {
                this.disableSubtitles();
            }  else {
                this.enableSubtitles();
            }
            this.initializationDefer.resolve();
        });
        if(this._options.playOn != "auto" && this._options.playOn != "none"){
            let config = this._options.playOn,
                playOn = config.split(":"),
                event = playOn[0],
                target = playOn.length > 1 ? this._$(playOn[1]) : this._$element;
            target.on(event,{instance:this},this._onTargetEvent);
        }
    }
    get subtitlesDisabled() {
        return this._options.subtitlesDisabled;
    }
    protected processSubtitles(){
        const subtitlesDeferred = this._$.Deferred();
        if (this._options.subtitles) {
            this._$.get(this._options.subtitles).then((content)=> {
                try {
                    this.subtitles = parse(content);
                    if (this.subtitles && this.subtitles.length > 0) {
                        this._$element.addClass(HzLocutionResource.CLASS_HAS_SUBTITLES);
                    } else {
                        this._$element.removeClass(HzLocutionResource.CLASS_HAS_SUBTITLES);
                    }
                    subtitlesDeferred.resolve();
                } catch (e) {
                    console.error("Error parsing the vtt file "+this._options.subtitles+": "+content,e);
                    this._$element.removeClass(HzLocutionResource.CLASS_HAS_SUBTITLES);
                    subtitlesDeferred.reject();
                }
            }).catch((err) => {
                console.error("Error downloading the vtt file "+this._options.subtitles,err);
                this._$element.removeClass(HzLocutionResource.CLASS_HAS_SUBTITLES);
                subtitlesDeferred.reject();
            })
        } else {
            this._$element.removeClass(HzLocutionResource.CLASS_HAS_SUBTITLES);
            subtitlesDeferred.resolve();
        }
        return subtitlesDeferred.promise();
    }
    protected _onBarEnable (e) {
        const instance = e.data.instance;
        instance.enable();
    }
    protected _onBarDisable (e) {
        const instance = e.data.instance;
        instance.disable();
    }
    protected _onTargetEvent(e){
        let instance = e.data.instance;
        instance._unlock();
        instance.enable();
        instance.initializationDefer.always(()=> {
            instance.play();
        });
    }
    protected _onEnd(){
        this.stop();
        this._markAsCompleted();
        this._eventEmitter.trigger(HzLocutionResource.ON_END,this);
    }
    protected _onLoad(){
        this._eventEmitter.trigger(HzLocutionResource.ON_LOADED,this);
    }
    protected _onLoadError(e,error){
        if (this._interval){
            clearInterval(this._interval);
        }
        this._markAsCompleted();
        Logger.error("HzLocution",error);
        this._eventEmitter.trigger(HzLocutionResource.ON_LOAD_ERROR,[this,error]);
    }
    protected _onPlayError(e,error){
        if (this._interval){
            clearInterval(this._interval);
        }
        this._markAsCompleted();
        Logger.error("HzLocution",arguments);
        this._eventEmitter.trigger(HzLocutionResource.ON_PLAY_ERROR,[this,error]);
    }
    protected _onPlay(){
        this.registerSubtitlesInterval();
        this._eventEmitter.trigger(HzLocutionResource.ON_PLAY,this);
    }
    protected _onChangePageStart(){
        this.initializationDefer.always(()=> {
            this.stop();
        });
        this._eventEmitter.globalEmitter.off(NavigatorService.ON_CHANGE_PAGE_START+`.locution-${this.id}`);
    }
    protected _onFinish(){
        this.stop();
        if(!this.isCompleted()) {
            this._markAsCompleted();
        }
    }
    protected registerSubtitlesInterval() {
        if(this.subtitles && this.subtitles.length > 0 && !this.subtitlesDisabled && this._sound && this.isPlaying) {
            this.clearInterval();
            this._interval = setInterval(this._onTimeInterval.bind(this),100);
        }
    }
    protected clearInterval() {
        if (this._interval){
            clearInterval(this._interval);
            this._interval = null;
        }
    }
    protected _onTimeInterval(){
        this._syncSubtitles();
    }
    protected setCurrentCue(cue) {
        if (this.isPlaying) {
            if (this.currentSubtitle != cue) {
                this.currentSubtitle = cue;
                const cueText = cue ? cue.text.trim() : "";
                this.updateSubtitlesContent(cueText);
                if (cueText.length > 0) {
                    this.$subtitlesContainer.removeClass(HzLocutionResource.CLASS_SUBTITLES_EMPTY);
                } else {
                    this.$subtitlesContainer.addClass(HzLocutionResource.CLASS_SUBTITLES_EMPTY);
                }
                this._eventEmitter.trigger(HzLocutionResource.ON_CUE_CHANGE, [this,cue]);
                this._eventEmitter.globalEmitter.trigger(HzLocutionResource.ON_CUE_CHANGE, [this,cue]);
            }
        }
    }
    protected updateSubtitlesContent(content) {
        this.$subtitlesContainer.html(content);
    }
    public enableSubtitles(){
        this._options.subtitlesDisabled = false;
        this._$element.removeClass(HzLocutionResource.CLASS_SUBTITLES_DISABLED);
        this.syncSubtitles();
        this.registerSubtitlesInterval();
        this._eventEmitter.trigger(HzLocutionResource.ON_SUBTITLES_ENABLED, this);
        this._eventEmitter.globalEmitter.trigger(HzLocutionResource.ON_SUBTITLES_ENABLED, this);
    }
    public disableSubtitles(){
        this.clearInterval();
        this._options.subtitlesDisabled = true;
        this._$element.addClass(HzLocutionResource.CLASS_SUBTITLES_DISABLED);
        this.syncSubtitles();
        this._eventEmitter.trigger(HzLocutionResource.ON_SUBTITLES_DISABLED, this);
        this._eventEmitter.globalEmitter.trigger(HzLocutionResource.ON_SUBTITLES_DISABLED, this);
    }
    public syncSubtitles() {
        if (!this.subtitlesDisabled && this.subtitles) {
            if (this._sound && this.isPlaying) {
                this._syncSubtitles();
            }
        } else {
            this.clearInterval();
            this.setCurrentCue(null);
        }
    }
    protected _syncSubtitles() {
        const currentTime = this._sound.seek() * 1000;
        const cue = this.subtitles.find(s => currentTime >= s.start && currentTime <= s.end);
        this.setCurrentCue(cue);
    }
    public get isPlaying() {
        return this._sound && this._sound.playing();
    }
    public play(force=false){
        if(force){
            this._unlock();
            this.enable();
        }
        if(!this.isDisabled() && this._sound){
            //stop the current audio
            if(HzLocutionRuntime.currentAudio){
                HzLocutionRuntime.currentAudio.stop();
            }
            HzLocutionRuntime.currentAudio = this._sound;
            this.initializationDefer.always(()=> {
                if (this.subtitles && !this.subtitlesDisabled && this.$subtitlesContainer){
                    this.$subtitlesContainer.attr(HzLocutionResource.ATTR_SUBTITLES_BAR,this.id);
                }
                if(this._options.delay){
                    setTimeout(()=>this._sound.play(),this._options.delay);
                }else {
                    this._sound.play();
                }
            });
        }
    }
    public stop(){
        if(this._sound){
            this.clearInterval();
            this.initializationDefer.always(()=> {
                this._sound.stop();
            });
            if (this.$subtitlesContainer){
                this.$subtitlesContainer.removeAttr(HzLocutionResource.ATTR_SUBTITLES_BAR);
            }
            if(this._options.completeOnStop){
                this._markAsCompleted();
            }
        }
    }
    public disable(){
        if(super.disable()){
            this.stop();
        }
    }
    public enable(){
        if(super.enable()){
            this.initializationDefer.always(()=> {
                if(this._options.playOn == "auto"){
                    this.play();
                }
            });
        }
    }
    public destroy(){
        if(this._sound){
            this._sound.unload();
        }
        if (this.subtitlesBarComponent) {
            this.subtitlesBarComponent.off(HzLocutionSubtitlesBarComponent.NAMESPACE+this.id+"."+HzLocutionSubtitlesBarComponent.ON_SUBTITLES_ENABLED);
            this.subtitlesBarComponent.off(HzLocutionSubtitlesBarComponent.NAMESPACE+this.id+"."+HzLocutionSubtitlesBarComponent.ON_SUBTITLES_DISABLED);
        }
        super.destroy();
    }
}
