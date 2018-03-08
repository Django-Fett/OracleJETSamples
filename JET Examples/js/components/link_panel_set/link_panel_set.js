import * as oj from "ojs/ojcore";
import * as compositeVM from "./view_model";
import * as ojComposite from "ojs/ojcomposite";
import { generateCompositeMetaData } from "../base";

var compositeMetaData = generateCompositeMetaData({
    "name": "link-panel-set",
    "description": "Fancy panels with only a link in them",
    "version": "1.0.0",
    "jetVersion": "^3.0.0",
    "properties": {
        "writeback": true,
        "viewModel": {
            "description": "The View Model to populate the link set",
            "type": "object",
            "properties": {
                "links": {
                    "description": "The array of card objects containing keys for 'primaryLabel', 'secondaryLabel' and 'url'.",
                    "type": "array",
                    "writeback": true,
                    "properties": {
                        "primaryLabel": {
                            "description": "Primary label for panel",
                            "type": "string"
                        },
                        "secondaryLabel": {
                            "description": "Secondary label for panel",
                            "type": "string"
                        },
                        "url": {
                            "description": "Url used for hyperlink",
                            "type": "string"
                        },
                        "target": {
                            "description": "Browser window destination for navigation",
                            "type": "string"
                        }
                    }
                }
            }
        }
    }
});

var compositeView = `
<!-- ko with: viewModel -->
<section class="tpm-section">
    <h3 class="oj-flex oj-sm-align-items-center tpm-section-header tpm-section-header-underlined">
        <!-- ko if: "componentLabelIcon" in $data -->
        <i data-bind='attr: {"class": "oj-flex-item oj-sm-flex-0 " + componentLabelIcon() + " tpm-section-header-icon"}'>
        </i>
        <!-- /ko -->
        <span class="oj-flex-item" data-bind='{text: componentLabel}'></span>
    </h3>
    <div class="tpm-section-body">
        <div class="oj-flex oj-sm-flex-items-initial tpm-link-panel-set">
            <!-- ko foreach: links -->
            <a class="oj-flex-item" role="link" data-bind='click: $parent.click.bind($data), attr: { title: primaryLabel }'>
                <div class="oj-panel oj-margin oj-flex oj-sm-align-items-center tpm-link-panel">
                    <i class="oj-flex-item oj-sm-flex-0 snap-icon-projects-enclosed tpm-link-panel-icon"></i>
                    <div class="oj-flex-item">
                        <span class="tpm-link-panel-label" data-bind='{ text: primaryLabel}'></span>
                        <abbr class="tpm-link-panel-label" data-bind='{ text: secondaryLabel}'></abbr>
                    </div>
                </div>
            </a>

            <!-- /ko -->
        </div>
    </div>
</section>
<!-- /ko -->
`;

oj.Composite.register("link-panel-set", {
    metadata: {inline: compositeMetaData},
    viewModel: {inline: compositeVM.default},
    view: {inline: compositeView}
});


