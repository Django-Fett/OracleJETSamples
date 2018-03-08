import * as ko from "knockout";
import * as underscore from "lodash";
import * as ojTable from "ojs/ojtable";
import * as arrayTableDataSource from "ojs/ojarraytabledatasource";
import { generateCompositeBaseVM } from "../base";

var model = function (context) {
    var self = this;
    generateCompositeBaseVM.call(self, context);
    self.uniqueLabelId = "tableLabel" + context.unique;
};

export default model;
