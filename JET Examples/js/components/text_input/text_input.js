import * as oj from "ojs/ojcore";
import * as compositeVM from "./view_model";
import * as ojComposite from "ojs/ojcomposite";
import { generateCompositeMetaData } from "../base";

import * as dateTimeInput from "ojs/ojdatetimepicker";
import * as comboInput from "ojs/ojselectcombobox";
import * as timeZoneData from "ojs/ojtimezonedata";
import * as textInput from "ojs/ojinputtext";

var compositeMetaData = generateCompositeMetaData({
    "name": "text-input",
    "description": "Generic Text Inputs that use JET",
    "version": "1.0.0",
    "jetVersion": "^3.0.0",
    "properties": {
        "viewModel": {
            "description": "The View Model Generator Function, can return an ojComponent of type Text, DateTime, Password, InputNumber, etc",
            "type": "object",
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
                    "description": "A getter that returns the json-formatted JET config needed for the html binding of oj input text fields (can be used for type Text, DateTime, Password, InputNumber, etc)",
                    "type": "object"
                }
            }
        }
    }
});

var compositeView = `
<!-- ko with: viewModel -->
<div data-bind='attr: {"data-feature-context": debugMode() && debugContextId() ? debugContextId() : debugMode() ? "TextInputComposite" : null}'>
    <label data-bind='attr: {"for": id, "data-feature-component": debugMode() ? "Label" : null}, text: primaryLabel'></label>
    <input data-bind='attr: {"id": id, "data-feature-component": debugMode() ? "Input" : null}, ojComponent: config'></input>
</div>
<!-- /ko -->
`;

oj.Composite.register("text-input", {
    metadata: {inline: compositeMetaData},
    viewModel: {inline: compositeVM.default},
    view: {inline: compositeView}
});
