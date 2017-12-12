/**
 * @license
 * Copyright Davinchi. All Rights Reserved.
 */
import "./main.scss";
import "./markdown.scss";
import "./prism-github.scss";
import {ScoFactory, Sco, ISco} from "@haztivity/core";
import {HzNavbarComponent} from "@haztivity/hz-navbar";
import {page as page6611} from "./pages/6611/page";
import {page as page6612} from "./pages/6612/page";
import {page as page6613} from "./pages/6613/page";
import {page as page6614} from "./pages/6614/page";
import template from "./sco.pug";
let sco: ISco = ScoFactory.createSco(
    {
        name: "1221",
        template: template,
        pages: [
            page6611,
            page6612,
            page6614,
            page6613
        ],
        components: [
            HzNavbarComponent
        ]
    }
);

//error
sco.on();
sco.run();
