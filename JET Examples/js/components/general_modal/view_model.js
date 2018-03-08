import * as ko from "knockout";
import * as underscore from "lodash";
//import * as BaseViewModel from ".app/core/BaseViewModel";
import { generateCompositeBaseVM } from "../base";

var model = function (context) {
    var self = this;
    generateCompositeBaseVM.call(self, context);

    context.props.then(function(properties) {
        var viewModelProps = properties.viewModel;

        var dialogVM = viewModelProps.factory.generateViewModel($(context.element));
        self.viewModel().viewModel(dialogVM);
    });
};

export default model;
