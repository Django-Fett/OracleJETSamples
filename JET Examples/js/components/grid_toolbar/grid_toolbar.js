import * as ko from "knockout";
import * as underscore from "lodash";
import * as textColumn from "gridapi.columns/textColumn";
import * as DefaultMediator from "gridapi.grid/boilerplateArrayMediator";
import * as gridWidget from "gridapi.grid/gridWidget";
import { generateCompositeBaseVM } from "../base";

/*

define(["ojs/ojcore",
        "knockout",
        "jquery",
        "ojs/ojknockout",
        "gridapi.columns/textColumn",
        "luxCCA/lux-grid-and-toolbar/loader",
        "ojs/ojbutton"
    ],
    function(oj, ko, $, ojKO, textColumn) {
        "use strict";

        var gridConfig_ccaToolbarDemo = {
            editable: true,
            locale: {
                gridLabel: "Grid-And-Toolbar Demo (CCA)"
            },
            search : {
                showAll: false,
                showParents: false,
                columnFilter: true // NOTE: without specifying columnFilter:true here, toolbar columns search will not work properly!
            },
            layout: {
                width: "100%",
                height: "500px",
                rowsets: [{
                    id: "foo6",
                    type: "flex"
                }],
                columnGroups: [{
                    type: "flex",
                    id: "bar6",
                    columns: [
                        "name", "office", "email_address", "organization", "location", "manager"
                    ]
                }]
            },
            selectionMode: "check",
            methodDefaults: {
                pasteRows: false
            },
            contextMenu: {
                enabled: false,
                populate: false
            },
            columnMenu: false,
            columns: {
                "name": {
                    title: "Name",
                    width: "135px",
                    type: "string",
                    sortable: true,
                    resizable: true
                },
                "office": {
                    title: "Office",
                    displayType: "number",
                    width: "98px",
                    formattedSearch: true,
                    sortable: true,
                    resizable: true
                },
                "email_address": {
                    title: "Email Address",
                    width: "195px",
                    type: "string",
                    sortable: true,
                    resizable: true
                },
                "organization": {
                    title: "Organization",
                    width: "160px",
                    type: "dropDown",
                    values: [{
                        id: 0,
                        name: "PPMGBU - Development"
                    }, {
                        id: 1,
                        name: "PPMGBU - License Local"
                    }],
                    sortable: true,
                    resizable: true,
                    formattedSearch: true
                },
                "location": {
                    title: "Location",
                    width: "140px",
                    type: "string",
                    sortable: true,
                    resizable: true
                },
                "manager": {
                    title: "Manager",
                    width: "145px",
                    type: "string",
                    sortable: true,
                    resizable: true
                }
            } //endof columns
        };


        function VM_gridCCA_demo() {
            var self = this;
            var gridTag;

            _.each(gridConfig_ccaToolbarDemo, function(value, key, list) {
                self[key] = ko.observable(value);
            });

            self.handleTransitionCompleted = function() {
                $.getJSON("./js/employee_data.json", function(data) {
                    gridTag = document.getElementById("divId_GridAndToolbarCCA_demo");
                    gridTag.setStore(data);
                });
            };
        }

        return VM_gridCCA_demo;
    });

*/
var compositeView = `
 <div data-bind="
luxComponent: {
    component: "luxToolbarGrid",
    elementId: {{ elementId }},
    showTopBorder: {{ showTopBorder }},
    showBottomBorder: {{ showBottomBorder }},
    grid: grid,
    customize: customize
}"></div>
`;
