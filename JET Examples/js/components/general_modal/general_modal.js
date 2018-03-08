import * as oj from "ojs/ojcore";
import * as compositeVM from "./view_model";
import * as ojComposite from "ojs/ojcomposite";
import { generateCompositeMetaData } from "../base";

var compositeMetaData = generateCompositeMetaData({
    "name": "General Modal",
    "description": "A Modal builder using ojModule. Removes the view from the dom when modal is not displayed.",
    "version": "0.0.1",
    "properties": {
        "viewModel": {
            "description": "The view model to be used to populate general modal attributes",
            "type": "object",
            "writeback": true,
            "properties": {
                "primaryLabel": {
                    "description": "The label text we're using to describe our widget.",
                    "type": "string",
                    "writeback": true
                },
                "factory": {
                    "description": "Factory object that has a method generateViewModel(), that can spawn new dialog viewmodels",
                    "type": "object",
                    "writeback": true
                },
                "viewModel": {
                    "description": "Is populated by the result of the factory.generateViewModel call. It should contain all the methods required to build JET modals and it's submit/cancel buttons (eg, the json for html bindings).",
                    "type": "object",
                    "writeback": true
                }
            }
        }
    },
    "slots": {
        "modalBody": {
            "description": "The body of the modal that contains markup and content"
        }
    },
    "events": {
        "save": {
            "bubbles": true,
            "detail": {
                "value": {
                    "description": "The value",
                    "type": "object"
                }
            }
        },
        "cancel": {
            "bubbles": true,
            "detail": {
                "value": {
                    "description": "The value",
                    "type": "object"
                }
            }
        }
    }
});

var compositeView = `
<!-- ko with: viewModel -->
<div data-bind='attr: {id: id + "-wrapper"}'>
    <div data-bind='attr: {id: id + "-body",
                        "data-feature-context": debugMode && debugContextId ? debugContextId : debugMode ? "Dialog": null},
                        ojComponent: viewModel().ojDialogConfig' data-modal-body='true' style="display:none">
        <div data-bind='attr: {"aria-labelledby": id + "-TitleId",
                                "data-feature-context": debugMode ? "DialogHeader": null}'  class="oj-dialog-header oj-helper-clearfix">
            <span data-bind='attr: {"id": id + "-TitleId",
                                    "title": primaryLabel,
                                    "data-feature-component": debugMode ? "Title": null}, text: primaryLabel' class="oj-dialog-title"></span>
        </div>

        <div data-bind='attr: {"data-feature-context": debugMode ? "DialogBody": null}' class="oj-dialog-body">
            <oj-slot name="modalBody"></oj-slot>
        </div>

        <div data-bind='attr: {"data-feature-context": debugMode ? "DialogFooter": null}' class="oj-dialog-footer">
            <button data-bind='attr: {id: id + "-cancel-button",
                                "data-feature-component": debugMode ? "CancelButton": null},
                                click: viewModel().dismissDialog,
                                ojComponent: viewModel().ojCancelDialogButtonConfig()' class="oj-button-secondary"></button>

            <button data-bind='attr: {id: id + "ok-button",
                                "data-feature-component": debugMode ? "OkButton": null},
            click: viewModel().okDialog,
            ojComponent: viewModel().ojOkDialogButtonConfig()' class="oj-button-primary"></button>
        </div>
    </div>
</div>
<!-- /ko -->
`;

oj.Composite.register("general-modal", {
    view: {inline: compositeView},
    viewModel: {inline: compositeVM.default},
    metadata: {inline: compositeMetaData}
});
