import * as ko from "knockout";

var generateCompositeMetaData = function(customMetaData){
    var tempMetaData, baseMetaData;
    var i, k;

    tempMetaData = {};
    baseMetaData = {
        "viewModel": {
            "description": "The View Model to populate the link set",
            "type": "object",
            "properties": {
                "id": {
                    "description": "The HTML id for the component",
                    "type": "string",
                    "writeback": true
                },
                "componentLabel": {
                    "description": "The label for the entire set of controls/applies to aria as well",
                    "type": "string",
                    "writeback": true
                },
                "componentLabelIcon": {
                    "description": "The css class that represents the icon to display next to the componentLabel",
                    "type": "string",
                    "writeback": true
                },
                "componentLabelCSS": {
                    "description": "The CSS class that will be attached to the component label",
                    "type": "string",
                    "writeback": true
                },
                "debugMode": {
                    "description": "Flag to turn on selenium attributes for components",
                    "type": "boolean",
                    "writeback": true
                },
                "debugContextId": {
                    "description": "Unique selenium id to use for debug mode (optional)",
                    "type": "string",
                    "writeback": true
                }
            }
        }
    };

    _.extend(tempMetaData, customMetaData.properties.viewModel);
    _.defaults(tempMetaData.properties, baseMetaData.viewModel.properties);

    customMetaData.properties.viewModel = tempMetaData;

    return customMetaData;
};

var generateCompositeBaseVM = function(context){
    var self = this;
    var element = context.element;
    var initProps;

    self.id = ko.observable();
    self.viewModel = ko.observable();

    context.props.then(function (properties) {
        var viewModel = properties.viewModel;

        self.id(properties.id ? properties.id : viewModel && viewModel.id ? viewModel.id : "");

        if (viewModel) {
            self.viewModel(viewModel);
            initProps = properties;
        }
    });
};

export { generateCompositeMetaData, generateCompositeBaseVM };
