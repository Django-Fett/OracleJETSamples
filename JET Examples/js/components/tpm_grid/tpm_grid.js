import * as oj from "ojs/ojcore";
import * as compositeVM from "./view_model";
import * as ojComposite from "ojs/ojcomposite";
import { generateCompositeMetaData } from "../base";

var compositeMetaData = generateCompositeMetaData({
    "name": "grid",
    "description": "Yet another Grid!",
    "version": "1.0.0",
    "jetVersion": "^3.0.0",
    "properties": {
        "viewModel": {
            "description": "The View Model to populate the tpm grid",
            "type": "object",
            "properties": {
                "metaRequest": {
                    "description": "Function to load any page level metadata before loading grid data",
                    "type": "function",
                    "writeback": true
                },
                "parentContext": {
                    "description": "JQuery reference to the parent context holding the grid",
                    "type": "object",
                    "writeback": true
                },
                "factory": {
                    "description": "Factory object that has a method generateViewModel(). This method sets the config() getter that can return the config object needed for the LUX grid",
                    "type": "object",
                    "writeback": true
                },
                "requestParams": {
                    "description": "optional | JSON object that has name/value pairs that will be sent to the server for the initial request when the grid first loads.",
                    "type": "object",
                    "writeback": true
                }
            }
        }
    },
    "slots": {
        "supplementalWidgets": {
            "description": "The place to stuff optional widgets to support the grid (ie, a toolbar)"
        }
    },
    "events": {
        "gridReady": {
            "description": "Triggered when the lux grid renders the first time, returns a object that has the bindings for the lux grid and a object with any supplemental response data from the server",
            "bubbles": true
        }
    }
});


// debugMode = true adds a selenium id to the grid, if debugContextId isn't given for the id, "Grid" is used
var compositeView = `
<!-- ko with: viewModel -->
<section class="tpm-section">
    <h3 data-bind='attr: {"class": "oj-flex oj-sm-align-items-center tpm-section-header " + (("componentLabelCSS" in $data) && componentLabelCSS() || "")}'>
    <!-- ko if: "componentLabelIcon" in $data -->
    <i data-bind='attr: {"class": "oj-flex-item oj-sm-flex-0 " + componentLabelIcon() + " tpm-section-header-icon"}'></i>
    <!-- /ko -->
    <span class="oj-flex-item" data-bind='{text: componentLabel}'></span>
    </h3>
    <div class="tpm-section-body">
        <oj-slot name="supplementalWidgets"></oj-slot>
        <div data-bind='
            attr: {"data-feature-context": debugMode() && debugContextId() ? debugContextId() : debugMode() ? "Grid" : null}
            luxComponent: config
        '>
        </div>
    </div>
</section>
<!-- /ko -->
`;

oj.Composite.register("tpm-grid", {
    metadata: {inline: compositeMetaData},
    viewModel: {inline: compositeVM.default},
    view: {inline: compositeView}
});


