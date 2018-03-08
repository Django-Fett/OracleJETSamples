import * as ko from "knockout";
import * as luxUtilsCustomBinding from "luxBindingBridge";
import * as underscore from "lodash";
import * as textColumn from "gridapi.columns/textColumn";
import * as gridApi from "gridapi";
import * as DefaultMediator from "gridapi.grid/boilerplateArrayMediator";
import * as gridWidget from "gridapi.grid/gridWidget";
import { generateCompositeBaseVM } from "../base";
import * as logger from "gridapi.logger";

var model = function (context) {
    var self = this;
    generateCompositeBaseVM.call(self, context);

    // Retrieve attributes passed into composite tag and turn them into viewModel members
    context.props.then(function (properties) {
        var viewModelProps = properties.viewModel;
        var metaPromise = viewModelProps.metaRequest || function () {return Promise.resolve(); };

        metaPromise().then(function (newParams = null) {
            var gridVMPromise = viewModelProps.factory.generateViewModel($(viewModelProps.parentContext), $(context.element), newParams || viewModelProps.requestParams);

            gridVMPromise.then(function(retVM){
                var gridVM = retVM.gridBindings;

                _.extend(self, {
                    get luxGridConfig(){
                        return {
                            component: "grid",
                            editable: gridVM.editable,
                            editOnClick: gridVM.editOnClick,
                            focusOnSelection: gridVM.focusOnSelection,
                            locale: gridVM.locale,
                            layout: gridVM.layout,
                            columns: gridVM.columns,
                            columnMenu: gridVM.columnMenu,
                            recordKeys: gridVM.recordKeys
                        };
                    }
                }, gridVM);

                context.element.dispatchEvent(new CustomEvent("gridReady", {
                    "bubbles": true,
                    "detail": {
                        "gridBindings": self,
                        "relatedData": retVM.relatedData
                    }
                }));
            });
        }).catch(function (error) {
            logger.error("Metadata failed to load " + error);
        });
    });
};

export default model;
