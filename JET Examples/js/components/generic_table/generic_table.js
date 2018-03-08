import * as oj from "ojs/ojcore";
import * as compositeVM from "./view_model";
import * as ojComposite from "ojs/ojcomposite";
import { generateCompositeMetaData } from "../base";

var compositeMetaData = generateCompositeMetaData({
    "name": "generic-table",
    "description": "JET table for read-only content",
    "version": "1.0.0",
    "jetVersion": "^3.0.0",
    "properties": {
        "primaryLabel": {
            "description": "Primary label for the table",
            "type": "string"
        },
        "secondaryLabel": {
            "description": "Secondary label for table",
            "type": "string"
        },
        "viewModel": {
            "description": "General object for the population of the composite elements",
            "type": "object",
            "properties": {
                "config": {
                    "description": "A getter that returns the json-formatted JET config needed for the html binding of ojTable",
                    "type": "object"
                }
            }
        }
    }
});

// debugMode = true adds a selenium id to the table, if debugContextId isn't given for the id, "Static" is used
var compositeView = `
<!-- ko with: viewModel -->
<section class="tpm-section">
    <h3 data-bind='attr: {"class": "oj-flex oj-sm-align-items-center tpm-section-header " + (("componentLabelCSS" in $data) && componentLabelCSS() || "")}'>
    <!-- ko if: "componentLabelIcon" in $data -->
    <i data-bind='attr: {"class": "oj-flex-item oj-sm-flex-0 " + componentLabelIcon() + " tpm-section-header-icon"}'></i>
    <!-- /ko -->
    <span class="oj-flex-item" data-bind='attr: {id: $parent.uniqueLabelId}, text: componentLabel'></span></h3>
    <div class="tpm-section-body">
        <table
               data-bind='attr: {id: $parent.id, "aria-labelledby": $parent.uniqueLabelId, "data-feature-context": debugMode() && debugContextId() ? debugContextId() : debugMode() ? "StaticTable" : null}, ojComponent: config'>
            <caption class="oj-helper-hidden-accessible" data-bind="{text: componentLabel}"></caption>
        </table>
    </div>
</section>
<!-- /ko -->
`;

oj.Composite.register("generic-table", {
    metadata: {inline: compositeMetaData},
    viewModel: {inline: compositeVM.default},
    view: {inline: compositeView}
});


