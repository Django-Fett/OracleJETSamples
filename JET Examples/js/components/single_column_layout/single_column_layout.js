import * as oj from "ojs/ojcore";
import * as compositeVM from "./view_model";
import * as ojComposite from "ojs/ojcomposite";
import { generateCompositeMetaData } from "../base";

var compositeMetaData = generateCompositeMetaData({
    "name": "single-column-layout",
    "description": "Standard Single Column layout",
    "version": "1.0.0",
    "jetVersion": "^3.0.0",
    "properties": {
        "viewModel": {
            "description": "The View Model to populate the link set",
            "type": "object"
        }
    },
    "slots": {
        "pageBody": {
            "description": "The place to stuff content to be toggled"
        },
        "pageDialogs": {
            "description": "The place to stuff dialogs for your page"
        }
    }
});

var compositeView = `
<div id="bodyWrapper" class="oj-flex">
    <div class="oj-xl-12 oj-lg-12 oj-md-12 oj-flex-item">
        <!-- oj-tab contents, the pattern requires items to be wrapped in divs -->
        <oj-slot name="pageBody"></oj-slot>
    </div>
</div>
<div id="dialogWrapper" data-feature-context="PageDialogs">
    <oj-slot name="pageDialogs"></oj-slot>
</div>
`;

oj.Composite.register("single-column-layout", {
    view: {inline: compositeView},
    viewModel: {inline: compositeVM.default},
    metadata: {inline: compositeMetaData}
});
