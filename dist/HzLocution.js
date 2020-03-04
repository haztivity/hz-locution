(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./HzLocutionResource"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Davinchi. All Rights Reserved.
     */
    var HzLocutionResource_1 = require("./HzLocutionResource");
    exports.HzLocutionResource = HzLocutionResource_1.HzLocutionResource;
});
//# sourceMappingURL=HzLocution.js.map