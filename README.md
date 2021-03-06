# hz-locution
hz-locution is an haztivity resource to add locutions.\
hz-locution uses [howler js](https://github.com/goldfire/howler.js) under the hood.
## Install
### NPM
```npm i --save @haztivity/hz-locution```
## Dependencies
- JQuery
- howler
- @haztivity/core
## Usage
1. Import @haztivity/hz-locution
2. Add HzQuizLocution to the page
3. Set ```data-hz-resource-files="file1.mp3,file1.wav"```
### Ts
```typescript
import {PageFactory, Page, PageController, PageRegister} from "@haztivity/core";
import template from "./page.pug";
import {HzQuizLocution} from "@haztivity/hz-locution";
export let page: PageRegister = PageFactory.createPage(
    {
        name: "myPage",
        resources: [
            HzQuizLocution
        ],
        template: template
    }
);
```
### Pug
```pug
//- By default the audio is played automatically but sequentially
h1(data-hz-resource="HzLocution", data-opt-hz-locution-files="./assets/locution1.mp3") This will be reproduced on the haztivity page show
p(data-hz-resource="HzLocution", data-opt-hz-locution-files="./assets/locution2.mp3") This will be reproduced after the first locution
//- Some other resource
p(data-hz-resource="HzLocution", data-opt-hz-locution-files="./assets/locution3.mp3") This will be reproduced when the previous resource has been completed
button(data-hz-resource="HzLocution", data-opt-hz-locution-files="./assets/locution4.mp3", data-opt-hz-locution-play-on="click") This will be reproduced when this element fires a click event. This element ignores the sequence of resources
```
or
### HTML
```html
<!-- By default the audio is played automatically but sequentially -->
<h1 data-hz-resource="HzLocution" data-opt-hz-locution-files="./assets/locution1.mp3"> This will be reproduced on the haztivity page show</h1>
<p data-hz-resource="HzLocution" data-opt-hz-locution-files="./assets/locution2.mp3"> This will be reproduced after the first locution</p>
<!-- Some other resource -->
<p data-hz-resource="HzLocution" data-opt-hz-locution-files="./assets/locution3.mp3"> This will be reproduced when the previous resource has been completed</p>
<button data-hz-resource="HzLocution" data-opt-hz-locution-files="./assets/locution4.mp3" data-opt-hz-locution-play-on="click">This will be reproduced when this element fires a click event. This element ignores the sequence of resources</button>
```
## Options
### HzLocution options
HzLocution provides specific options

| Option            | Default | Description |
| ----------------- | ------- | ----------- |
| files             | null    | The files to use. Multiple items could be specified separated by comma. For example: "audio1.mp3,audio1.wav"|
| playOn            | auto    | Play the audio when the expression is true. By default, the audio is played when the resource is enabled. The option could be specified byt "event:selector", if the selector is not provided, the event will be listened in the element inself. For example play-on="click", the audio will be played when the element of the resource is clicked. play-on="click:.someItem", the audio will be played when the item that matches with the selector ".someItem" is clicked.|
| delay             | 0       | Delay in milliseconds to wait after playing the audio |
| locutionSubtitles | null    | Link to a .vtt file with the subtitles for the audio |
| subtitlesContainer| null    | jQuery valid query to the element in which to show the cues from the subtitles. You can also use the HzLocutionSubtitlesBarComponent component |

## HzLocutionSubtitlesBarComponent
The subtitles could be displayed independently on each screen by providing an specific element in each screen or using a global component
```html
<!-- In each screen -->
<h1 data-hz-resource="HzLocution"
    data-opt-hz-locution-files="./assets/locution1.mp3"
    data-opt-hz-locution-subtitles="./assets/locution1.vtt"
    data-opt-hz-subtitles-container="#subtitles"
>This will be reproduced on the haztivity page show</h1>
<p id="subtitles"></p><!-- Subtitles will be displayed here -->
```
```html
<!-- Using the component -->
<!-- sco.html -->
<div data-hz-pages></div>
<div class="hz-locution-subtitles-bar" data-hz-component="HzLocutionSubtitlesBar">
        <p class="hz-locution-subtitles-bar__cue" data-hz-locution-subtitles-bar-cue></p>
        <button class="hz-locution-subtitles-bar__toggler" data-hz-locution-subtitles-bar-toggler>
            Toggle subtitles
        </button>
</div>
<!-- page.html-->
<!-- Navbar -->
<h1 data-hz-resource="HzLocution"
    data-opt-hz-locution-files="./assets/locution1.mp3"
    data-opt-hz-locution-subtitles="./assets/locution1.vtt"
>This will be reproduced on the haztivity page show</h1>
```
