import {
    $,
    Navigator,
    INavigatorPageData,
    Component,
    ComponentController,
    EventEmitterFactory,
    PageManager,
    PageController,
    DataOptions,
    ScoFactory,
    ResourceController
} from "@haztivity/core";
import {HzLocutionResource} from "./HzLocutionResource";
@Component(
    {
        name: "HzLocutionSubtitlesBar",
        dependencies: [
            $,
            EventEmitterFactory,
            Navigator,
            PageManager,
            DataOptions
        ]
    }
)
export class HzLocutionSubtitlesBarComponent extends ComponentController {
    public static readonly NAMESPACE = "hzLocutionSubtitlesBar";
    public static readonly ON_SUBTITLES_ENABLED = `${HzLocutionSubtitlesBarComponent.NAMESPACE}:subtitlesEnabled`;
    public static readonly ON_SUBTITLES_DISABLED = `${HzLocutionSubtitlesBarComponent.NAMESPACE}:subtitlesDisabled`;
    protected static readonly PREFIX = "hz-locution-subtitles-bar";
    public static readonly QUERY_ACTION_TOGGLE = `[data-${HzLocutionSubtitlesBarComponent.PREFIX}-toggler]`;
    public static readonly QUERY_CUE = `[data-${HzLocutionSubtitlesBarComponent.PREFIX}-cue]`;
    public static readonly CLASS_DISABLED = "hz-locution-subtitles-bar--disabled";
    public static readonly CLASS_EMPTY= "hz-locution-subtitles-bar--empty";
    protected static readonly ATTR_SUBTITLES_BAR = "hz-locution-id";
    protected _config:any;
    protected _$content: JQuery;
    protected _$toggleBtn: JQuery;
    protected currentLocutions = [];
    protected static readonly DEFAULTS = {
        subtitlesDisabled: false
    };
    constructor(_$: JQueryStatic, _EventEmitterFactory, protected _Navigator: Navigator, protected _PageManager: PageManager, protected _DataOptions) {
        super(_$, _EventEmitterFactory);
    }
    init(options, config?) {
        this._options = this._$.extend(true,{},HzLocutionSubtitlesBarComponent.DEFAULTS,options);
        this._config = config;
        this._getElements();
        this._assignEvents();
        if (this._options.subtitlesDisabled){
            this.disable();
        } else {
            this.enable();
        }
    }
    protected _getElements() {
        this._$content = this._$element.find(HzLocutionSubtitlesBarComponent.QUERY_CUE);
        this._$toggleBtn = this._$element.find(HzLocutionSubtitlesBarComponent.QUERY_ACTION_TOGGLE);
    }
    protected _assignEvents() {
        this._eventEmitter.globalEmitter.on(PageController.ON_SHOW, {instance: this}, this._onPageShown);
        //this._eventEmitter.globalEmitter.on(HzLocutionResource.ON_CUE_CHANGE, {instance: this}, this._onCueChange);
        //this._eventEmitter.globalEmitter.on(HzLocutionResource.ON_END, {instance: this}, this._onLocutionEnd);
        //this._eventEmitter.globalEmitter.on(HzLocutionResource.ON_PLAY, {instance: this}, this._onLocutionPlay);
        this._$toggleBtn.on(`click.${HzLocutionSubtitlesBarComponent.NAMESPACE}`, {instance: this}, this._onToggleClick);
    }
    protected _onPageShown(e,$page, $oldPage, oldPageRelativePosition, pageController:PageController){
        let instance = e.data.instance;
        instance.currentLocutions = pageController.getElement().find("[data-hz-resource='HzLocution']").toArray().map(l => instance._$.data(l,"hzResourceInstance"));
        instance.currentLocutions.forEach((l:HzLocutionResource) => {
            l.off("."+HzLocutionSubtitlesBarComponent.NAMESPACE);
            l.on(HzLocutionResource.ON_PLAY+"."+HzLocutionSubtitlesBarComponent.NAMESPACE, {instance}, instance._onLocutionPlay);
            l.on(HzLocutionResource.ON_END+"."+HzLocutionSubtitlesBarComponent.NAMESPACE, {instance}, instance._onLocutionEnd);
            l.on(HzLocutionResource.ON_CUE_CHANGE+"."+HzLocutionSubtitlesBarComponent.NAMESPACE, {instance}, instance._onCueChange);
            if (instance.subtitlesDisabled) {
                l.disableSubtitles();
            } else {
                l.enableSubtitles();
            }
        });
    }
    protected _onCueChange (e,locutionResource,cue) {
        const instance = e.data.instance;
        const text = cue ? cue.text.trim() : "";
        instance._$content.html(text);
        if (text.length == 0 && !instance.subtitlesDisabled)  {
            instance._$element.addClass(HzLocutionSubtitlesBarComponent.CLASS_EMPTY);
        } else {
            instance._$element.removeClass(HzLocutionSubtitlesBarComponent.CLASS_EMPTY);
        }
    }
    protected _onLocutionEnd (e,locutionResource) {
        const instance = e.data.instance;
        instance._$element.removeAttr(HzLocutionSubtitlesBarComponent.ATTR_SUBTITLES_BAR);
    }
    protected _onLocutionPlay (e,locutionResource) {
        const instance = e.data.instance;
        instance._$element.attr(HzLocutionSubtitlesBarComponent.ATTR_SUBTITLES_BAR,locutionResource.id);
    }
    protected _onToggleClick(e) {
        const instance = e.data.instance;
        if (instance.subtitlesDisabled) {
            instance.enable();
        } else {
            instance.disable();
        }
    }
    enable(){
        this._options.subtitlesDisabled = false;
        this.currentLocutions.forEach(l=> l.enableSubtitles());
        this._$element.removeClass(HzLocutionSubtitlesBarComponent.CLASS_DISABLED);
        this._eventEmitter.trigger(HzLocutionSubtitlesBarComponent.ON_SUBTITLES_ENABLED);
    }
    disable(){
        this._options.subtitlesDisabled = true;
        this.currentLocutions.forEach(l=> l.disableSubtitles());
        this._$element.addClass(HzLocutionSubtitlesBarComponent.CLASS_DISABLED);
        this._eventEmitter.trigger(HzLocutionSubtitlesBarComponent.ON_SUBTITLES_DISABLED);
    }
    setContent(content = "") {
        this._$content.html(content);
        if (content.trim().length > 0) {
            this._$element.removeClass(HzLocutionSubtitlesBarComponent.CLASS_EMPTY);
        } else {
            this._$element.addClass(HzLocutionSubtitlesBarComponent.CLASS_EMPTY);
        }
    }
    get subtitlesDisabled() {
        return this._options.subtitlesDisabled;
    }
}
