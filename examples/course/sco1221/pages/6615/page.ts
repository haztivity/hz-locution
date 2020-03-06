/**
 * @license
 * Copyright Davinchi. All Rights Reserved.
 */
import {PageFactory, PageRegister, PageController} from "@haztivity/core";
import template from "./page.pug";
import {HzLocutionResource} from "../../../resources/hz-locution/HzLocution";
export let page: PageRegister = PageFactory.createPage(
    {
        name: "6615",
        resources: [
            HzLocutionResource
        ],
        template: template
    }
);
page.on(
    PageController.ON_RENDERING, null, (eventObject, template, pageController) => {
        console.log(`${pageController.options.name} rendering`);
    }
);
page.on(
    PageController.ON_RENDERED, null, (eventObject, $page: JQuery, pageController: PageController) => {
        console.log(`${pageController.options.name} rendered`);
        const toggle = $page.find("#toggle");
        const locutions = $page.find(".locution");
        //locutions.on(HzLocutionResource.ON_PLAY,(e, instance)=>{
        //    console.log("play",instance.id);
        //});
        //locutions.on(HzLocutionResource.ON_SUBTITLES_DISABLED,(e, instance)=>{
        //    console.log("disabled",instance.id);
        //});
        //locutions.on(HzLocutionResource.ON_CUE_CHANGE,(e, instance, cue)=>{
        //    console.log("cue change",instance.id, cue);
        //});
        toggle.on("click",()=> {
            locutions.each((i,l)=>{
                const instance = $.data(l,"hzResourceInstance");
                if (!instance.subtitlesDisabled) {
                    instance.disableSubtitles();
                } else {
                    instance.enableSubtitles();
                }
            })
        });
    }
);
page.on(
    PageController.ON_SHOW, null, (eventObject, $page, $oldPage, oldPageRelativePosition, pageController) => {
        console.log(`${pageController.options.name} show start`);
    }
);
page.on(
    PageController.ON_SHOWN, null, (eventObject, $page, $oldPage, oldPageRelativePosition, pageController) => {
        console.log(`${pageController.options.name} show end`);
    }
);
page.on(
    PageController.ON_COMPLETE_CHANGE, null, (eventObject, isCompleted, $page, pageController) => {
        console.log(`${pageController.options.name} complete change`);
    }
);
page.on(
    PageController.ON_DESTROY, null, (eventObject, $page, pageController) => {
        console.log(`${pageController.options.name} destroy`);
    }
);
