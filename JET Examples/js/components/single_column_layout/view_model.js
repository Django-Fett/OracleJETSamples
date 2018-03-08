import * as ko from "knockout";
import { generateCompositeBaseVM } from "../base";

var model = function (context) {
    var self = this;
    generateCompositeBaseVM.call(self, context);
};

export default model;
