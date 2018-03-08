import * as ko from "knockout";
import { generateCompositeBaseVM } from "../base";
import Router from "cpm/Router";
var model = function (context) {
    var self = this;
    generateCompositeBaseVM.call(self, context);
};

export default model;
