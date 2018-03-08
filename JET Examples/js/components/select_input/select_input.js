import * as oj from "ojs/ojcore";
import * as compositeVM from "./view_model";
import * as ojComposite from "ojs/ojcomposite";
import { generateCompositeMetaData } from "../base";
import * as ojComboInput from "ojs/ojselectcombobox";

var compositeMetaData = generateCompositeMetaData({
    "name": "select-input",
    "description": "Generic Select Inputs that use JET",
    "version": "1.0.0",
    "jetVersion": "^3.0.0",
    "properties": {
        "viewModel": {
            "properties": {
                "primaryLabel": {
                    "description": "Primary label for panel",
                    "type": "string"
                },
                "secondaryLabel": {
                    "description": "Secondary label for panel",
                    "type": "string"
                },
                "config": {
                    "description": "A getter that returns the json-formatted JET config needed for the html binding of ojSelect",
                    "type": "object"
                }
            }
        }
    }
});

var compositeView = `
<!-- ko with: viewModel -->
<div class="oj-flex-item" data-bind='attr: {"data-feature-context": debugMode() && debugContextId() ? debugContextId() : debugMode() ? "SelectInputComposite" : null}'>
    <label data-bind='attr: {"for": id, "data-feature-component": debugMode() ? "Label" : null}, text: primaryLabel'></label>
    <select data-bind='attr: {"id": id, "data-feature-component": debugMode() ? "Input" : null}, ojComponent: config'>
    </select>
</div>
<!-- /ko -->
`;

oj.Composite.register("select-input", {
    metadata: {inline: compositeMetaData},
    viewModel: {inline: compositeVM.default},
    view: {inline: compositeView}
});


