import * as ko from "knockout";
import { generateCompositeBaseVM } from "../base";

var model = function (context) {
    var self = this;
    generateCompositeBaseVM.call(self, context);

    self.primaryLabel = ko.observable();
    self.secondaryLabel = ko.observable();
    self.options = ko.observableArray();
    self.viewModel = ko.observable();

    // Retrieve attributes passed into composite tag and turn them into viewModel members
    context.props.then(function (properties) {
        self.primaryLabel(properties.primaryLabel);
        self.secondaryLabel(properties.secondaryLabel);
        self.options(properties.options);
        self.viewModel(properties.viewModel);
    });
};

export default model;
