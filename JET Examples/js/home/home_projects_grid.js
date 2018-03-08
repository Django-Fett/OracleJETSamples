import * as constants from "gridapi.grid/constants";
import * as boilerplateTreeMediator from "gridapi.grid/boilerplateTreeMediator";
import * as textColumn from "gridapi.columns/textColumn";
import {default as gridSorters} from "gridapi.grid/sorters";
import * as gridWidget from "gridapi";
import * as CpmUtils from "cpm/utils/common";
import * as GridColumnUtils from "cpm/utils/gridColumnUtils";
import * as BaseViewModel from "cpm/BaseViewModel";
import * as ko from "knockout";
import * as _ from "lodash";

var generateViewModel = function (rootContext, gridContext, gridParams = {orgId: null}) {
    var newRow; // Current reference to any new row created by this grid, used for client-side add / delete operations
    let self = _.extend(this, new BaseViewModel.default());
    const STATUS_OPTIONS = [
        {
            "id": "All",
            "name": self.nl("projects.grid.advancedFilters.all", {"value": "All"})
        },
        {
            "id": "Active",
            "name": self.nl("projects.grid.advancedFilters.status.active", {"value": "Active"})
        },
        {
            "id": "Inactive",
            "name": self.nl("projects.grid.advancedFilters.status.inactive", {"value": "Inactive"})
        }
    ];

    let segmentFilterOptions = {
        field: "type",
        gridContext: gridContext,
        dropdownItems: [],
        isRequired: false
    };

    var gridConfig = {
        search: {
            showAll: false,
            showParents: false,
            columnFilter: true,
            columnFilterMatchAllColumns: true
        },
        dataExporter: function (grid, options) {
            grid.view.exportToCSV(options);
        },
        recordKeys: {
            id: "id"
        },
        performance: {
            minimumSearchCharacters: 3
        },
        advancedFilters: {
            enabled: true,
            client: false
        },
        columnMenu: {
            enabled: true,
            // leaving this as an empty
            // object will just create a
            // flat list of columns
            columnToggleMenu: {
                label: "", // has no
                // affect at this level
                // because the menu is
                // label "Columns"
                dataIndexes: ["projectName", "message", "projectNumber", "segmentId", "taskCount", "status", "users"]

            }
        },
        editable: true,
        focusOnSelection: false,
        tree: true,
        lazyload: true,
        locale: {
            gridLabel: self.nl("projects.grid.title", {"value": "My Projects"})
        },
        layout: {
            width: "99%",
            //125 for header height 100 for toolbar + pagination footer + padding
            height: ($(window).height() - 225) + "px",
            autoResize: true,
            rowsets: [{
                id: constants.NO_GROUP,
                type: constants.GROUP_TYPE.FLEX
            }],
            columnGroups: [{
                id: constants.NO_GROUP,
                type: constants.GROUP_TYPE.FLEX,
                columns: [ "projectName", "message", "projectNumber", "segmentId", "taskCount", "status", "users"]
            }]
        },
        mediatorFns: _.extend({
            addRule: function (gridVM) {
                newRow = this.newRecord({"id": constants.DUMMY_RECORD_ID});

                gridVM.addRowHack({
                    "id": newRow.id,
                    "projectType": "",
                    "key": CpmUtils.newGridRowKey(),
                    "projectNumber": null,
                    "projectName": "",
                    "message": "",
                    "segmentId": "",
                    "status": "",
                    "users": ""
                });
            },
            abortNewRule: function (gridVM) {
                if (newRow) {
                    gridVM.gridData.shift();
                    gridVM.renderGrid();
                    newRow = "";
                }
            },
            init: function () {
                // Loading spinner always requires the grid to be loaded, so we'll load the grid with an empty dataset first
                let vm = CpmUtils.gridBindings({
                    context: gridContext,
                    config: gridConfig,
                    data: {"rows": []},
                    dataRowsKey: "rows", // The dataset for this page is in the "rules" field of the above "data" object
                    autoResize: false
                });

                return this.fetchData({previousGridVM: vm, requestParams: gridParams, firstLoad: true});  // Return the promise associated with the fetch call
            },
            fetchData: function ({previousGridVM = null, requestParams = {}, firstLoad = false} = {}) {
                //var orgId = gridParams.orgId;
                return new Promise(function (resolve, reject) {
                    CpmUtils.ajaxReloadGrid({
                        "gridContext": gridContext,
                        "type": "POST",
                        "dataType": "json",
                        "contentType": "application/json; charset=utf-8",
                        "data": JSON.stringify(requestParams),
                        "cache": false,
                        "url": `${_Textura.foyr_url}home/apis/projects`,
                        success: function (data, status, xhr) {
                            var resolvableObj;
                            var dataRow;
                            if($("#myProjectsGrid").length) {
                                let gridData = data.projects.reportData;
                                resolvableObj = {
                                    relatedData: data.relatedData
                                };

                                if (firstLoad) {
                                    segmentFilterOptions.dropdownItems = _.union([{
                                        "id": "All",
                                        "name": self.nl("projects.grid.advancedFilters.all", {"value": "All"})
                                    }], _.sortBy(resolvableObj.relatedData.segmentIdOptions, "name"));
                                    gridContext.grid(gridConfig);
                                }
                                previousGridVM.renderGrid({gridMetaData: gridData.metaData, gridData: gridData.rows});
                                resolvableObj.gridBindings = previousGridVM;
                                CpmUtils.tajax({
                                    "type": "GET",
                                    "dataType": "json",
                                    "cache": false,
                                    "url": `${_Textura.foyr_url}home/apis/actions_project_counts`,
                                    success: function (_data, _status, _xhr) {
                                         var gridVM, formattedItems, record;
                                         if($("#myProjectsGrid").length) {
                                             formattedItems = _data;
                                             gridVM = resolvableObj.gridBindings;

                                             _.each(gridData.rows, function (project) {
                                                 record = gridVM.gridObject.widget._getRecord(project.id);
                                                 let projectsIdsWithTasks = _.map(formattedItems, "projectId");
                                                 let taskCount = "0";
                                                 if (_.contains(projectsIdsWithTasks, project.id)) {
                                                     let item = _.find(formattedItems, {projectId: project.id});
                                                     taskCount = {label: item.actionCount, href: "/tasks=" + item.actionCount};
                                                 }
                                                 gridVM.gridObject.setRecordValue(record, "taskCount", taskCount);
                                                 gridVM.gridObject.widget._recordUpdated(record, "taskCount");
                                            });
                                        }
                                    }
                                });

                                gridContext.trigger("data-loaded", data);
                                resolve(resolvableObj);
                            }
                        }
                    });
                });
            },
            applyAdvancedFilters: function (filters) {
                gridContext.trigger("refresh-grid-view", {filters: filters});
            }
        }),
        columns: {
            "projectType": {
                title: self.nl("projects.grid.columnLabels.projectType", {"value": "Project Type"}),
                align: "center",
                headerAlign: "center",
                width: "200px",
                type: "string",
                resizable: true,
                readOnly: true
            },
            "projectName": _.extend({
                title: self.nl("projects.grid.columnLabels.projectName", {"value": "Project Name"}),
                groupTitle: true,
                expandable: true,
                sortable: true,
                filterable: true,
                width: "500px",
                displayType: "link",
                type: "string",
                resizable: true,
                readOnly: true,
                required: true
            }, GridColumnUtils.linkColumn.call(this)),
            "message": {
                align: "center",
                title: self.nl("projects.grid.columnLabels.messages", {"value": "Messages"}),
                width: "70px",
                type: "string",
                advancedFilters: {
                    enabled: false
                },
                headerRendererFns: {
                    getHeaderMarkup: function (column) {
                        return "";
                    }
                },
                editorFns: {
                    formatValueForInput: function () {
                        return "";
                    }
                },
                renderer: textColumn.renderer.extend({
                    getValueMarkup: function (renderOptions) {
                        var linkData, url, label, read;

                        if(!renderOptions.record.message){
                            return "";
                        }

                        linkData = renderOptions.record.message;
                        url = linkData.href;
                        label = linkData.label;
                        read = linkData.read;

                        return `<a href="${url}" class="${read}"title="${label}">
                                    <i class="snap-icon-email snap-lg-icon"></i>
                                    <span class="oj-helper-hidden-accessible">${label}</span>
                                </a>`;
                    }
                }),
                sorter: function (valueA, valueB, asc, options){
                    var formattedValueA, formattedValueB;

                    formattedValueA = valueA.href ? valueA.label : valueA;
                    formattedValueB = valueB.href ? valueB.label : valueB;

                    return gridSorters("string").call(this, formattedValueA, formattedValueB, asc, options);
                },
                resizable: true,
                readOnly: true
            },
            "projectNumber": _.extend({
                type: "string",
                sortable: true,
                filterable: true,
                title: self.nl("projects.grid.columnLabels.projectNumber", {"value": "Project Number"}),
                width: "150px",
                displayType: "link",
                formattedSearch: true,
                resizable: true,
                readOnly: true
            }, GridColumnUtils.linkColumn.call(this)),

            "segmentId": {
                title: self.nl("projects.grid.columnLabels.segmentId", {"value": "Segment ID"}),
                type: "string",
                width: "200px",
                formattedSearch: true,
                resizable: true,
                readOnly: true,
                sortable: true,
                required: true,
                advancedFilters: {
                    enabled: true,
                    advancedFilterEditorFns: GridColumnUtils.checkboxAdvancedFilterEditor.call(this, segmentFilterOptions)
                }
            },
            "status": {
                title: self.nl("projects.grid.columnLabels.status", {"value": "Status"}),
                align: "center",
                headerAlign: "left",
                width: "100px",
                type: "string",
                resizable: true,
                readOnly: true,
                advancedFilters: {
                    enabled: true,
                    advancedFilterEditorFns: _.extend(GridColumnUtils.checkboxAdvancedFilterEditor.call(this, {
                        field: "status",
                        gridContext: gridContext,
                        isRequired: true,
                        dropdownItems: STATUS_OPTIONS,
                        customizeFilter: function () {
                            let that = this;
                            gridContext.on("status-filter-defaults", function (event) {
                                that.setFilterData(["Active"]);
                            });
                        }
                    }), {
                        getFilterData: function () {
                            if(this.currentSelection().length === this.availableOptions.length) {
                                return null;
                            }
                            //can only be 1 option selected
                            return _.first(_.without(this.currentSelection(), "All"));
                        }
                    })
                }
            },
            "taskCount": {
                title: self.nl("projects.grid.columnLabels.task", {"value": "My Tasks"}),
                align: "right",
                headerAlign: "right",
                width: "100px",
                type: "string",
                resizable: false,
                readOnly: true,
                advancedFilters: {
                    enabled: false
                },
                sortable: true,
                searchable: false,
                renderer: textColumn.renderer.extend({
                    getValueMarkup: function (renderOptions) {
                        var linkData, url, label;
                        linkData = renderOptions.data;

                        if(linkData && linkData.href){
                            url = linkData.href;
                            label = linkData.label;
                            return `<a id="${renderOptions.id}-link" role="link" tabindex="-1" data-trigger="link-clicked" class="cell-descendant tpm-grid-labeled-pill cell-link" title="${label}">${label}</a>`;
                        }
                        else {
                            return `<span class="tpm-grid-labeled-pill">${linkData}</span>`;
                        }
                    }
                }),
                sorter: function (valueA, valueB, asc, options){
                    var formattedValueA, formattedValueB;

                    formattedValueA = _.isObject(valueA) ? valueA.label : (valueA || 0);
                    formattedValueB = _.isObject(valueB) ? valueB.label : (valueB || 0);

                    return gridSorters("integer").call(this, formattedValueA, formattedValueB, asc, options);
                }
            },
            "users": {
                title: self.nl("projects.grid.columnLabels.users", {"value": "Manage Users"}),
                align: "center",
                headerAlign: "center",
                width: "100px",
                type: "string",
                resizable: false,
                readOnly: true,
                renderer: textColumn.renderer.extend({
                    getValueMarkup: function (renderOptions) {
                        var linkData, url, label;

                        if(!renderOptions.record.users){
                            return "";
                        }

                        linkData = renderOptions.record.users;
                        url = linkData.href;
                        label = linkData.label;

                        return `<a href="${url}" title="${label}">
                                    <i class="snap-icon-email snap-lg-icon snap-icon-user-settings"></i>
                                    <span class="oj-helper-hidden-accessible">${label}</span>
                                </a>`;
                    }
                }),
                sorter: function (valueA, valueB, asc, options){
                    var formattedValueA, formattedValueB;

                    formattedValueA = valueA.href ? valueA.label : valueA;
                    formattedValueB = valueB.href ? valueB.label : valueB;

                    return gridSorters("string").call(this, formattedValueA, formattedValueB, asc, options);
                }
            }
        } //endof columns
    };
    /* end of gridConfig */

    return gridConfig.mediatorFns.init();
};

export { generateViewModel };
