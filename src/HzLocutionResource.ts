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
    protected static readonly PREFIX = "hz-quiz";
    protected static readonly CLASS_COMPONENT = HzLocutionResource.PREFIX;
    protected static readonly DEFAULTS_QUIZ = {

    };
    protected static readonly DEFAULTS = {
        playOn:"auto",
        completeOnPlay:false,
        completeOnStop:false
    };
    protected _config:any;
    protected _sound;
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
        this._config = config;
        this._navigatorService.on(NavigatorService.ON_CHANGE_PAGE_START,this._onChangePageStart.bind(this));
        let sound = new Howl({
            src: this._options.files.split(",")
        });
        sound.on('end',this._onEnd.bind(this));
        sound.on("load",this._onLoad.bind(this));
        sound.on("loaderror",this._onLoadError.bind(this));
        sound.on("playerror",this._onPlayError.bind(this));
        sound.on("play",this._onPlay.bind(this));
        this._sound = sound;
        if(this._options.playOn != "auto" && this._options.playOn != "none"){
            let config = this._options.playOn,
                playOn = config.split(":"),
                event = playOn[0],
                target = playOn.length > 1 ? this._$(playOn[1]) : this._$element;
            target.on(event,{instance:this},this._onTargetEvent);
        }
    }
    protected _onTargetEvent(e){
        let instance = e.data.instance;
        instance._unlock();
        instance.enable();
        instance.play();
    }
    protected _onEnd(){
        this._markAsCompleted();
        this._eventEmitter.trigger(HzLocutionResource.ON_END);
    }
    protected _onLoad(){
        this._eventEmitter.trigger(HzLocutionResource.ON_LOADED);
    }
    protected _onLoadError(e,error){
        this._markAsCompleted();
        Logger.error("HzLocution",error);
        this._eventEmitter.trigger(HzLocutionResource.ON_LOAD_ERROR,error);
    }
    protected _onPlayError(e,error){
        this._markAsCompleted();
        Logger.error("HzLocution",arguments);
        this._eventEmitter.trigger(HzLocutionResource.ON_PLAY_ERROR);
    }
    protected _onPlay(){
        this._eventEmitter.trigger(HzLocutionResource.ON_PLAY);
    }
    protected _onChangePageStart(){
        this.stop();
    }
    protected _onFinish(){
        if(!this.isCompleted()) {
            this._markAsCompleted();
        }
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
            if(this._options.delay){
                setTimeout(()=>this._sound.play(),this._options.delay);
            }else {
                this._sound.play();
            }
        }
    }
    public stop(){
        if(this._sound){
            this._sound.stop();
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
            if(this._options.playOn == "auto"){
                this.play();
            }
        }
    }
    public destroy(){
        if(this._sound){
            this._sound.unload();
        }
        super.destroy();
    }
}
