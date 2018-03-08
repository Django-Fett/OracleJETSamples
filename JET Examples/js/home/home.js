import * as oj from "ojs/ojcore";
import * as ko from "knockout";
import * as _ from "lodash";
import * as ojKO from "ojs/ojknockout";
import * as ojModel from "ojs/ojmodel";
import * as ojKOModel from "ojs/ojknockout-model";
import * as ojModule from "ojmodule";
import Router from "cpm/Router";
import * as ojComposite from "ojs/ojcomposite";
import * as ojToolbar from "ojs/ojtoolbar";

import * as ojDialog from "ojs/ojdialog";
import * as ojCheckbox from "ojs/ojcheckboxset";
import * as dateTimeInput from "ojs/ojdatetimepicker";
import * as comboInput from "ojs/ojselectcombobox";
import * as timeZoneData from "ojs/ojtimezonedata";
import * as textInput from "ojs/ojinputtext";
import * as staticTable from "ojs/ojtable";

import * as ojCollectionTableDataSource from "ojs/ojcollectiontabledatasource";
import * as ojPagingTableDataSource from "ojs/ojpagingtabledatasource";
import * as ojArrayTableDataSource from "ojs/ojarraytabledatasource";
import * as pagingControl from "ojs/ojpagingcontrol";
import * as ojValidation from "ojs/ojvalidation";

import * as luxGridToolBarLoader from "luxCCA/lux-toolbar/loader";

// Import generic Textura utils for view models, etc
import BaseViewModel from "cpm/BaseViewModel";
import * as vmf from "cpm/common/view_model_factory";
import * as CpmUtils from "cpm/utils/common";

// Import Widget Loaders & Templates
import * as generalModalLoader from "cpm/components/general_modal/general_modal";
import * as generalTableLoader from "cpm/components/generic_table/generic_table";
import * as pageLayoutLoader from "cpm/components/single_column_layout/single_column_layout";
import * as linkPanelLoader from "cpm/components/link_panel_set/link_panel_set";
import * as textInputLoader from "cpm/components/text_input/text_input";
import * as selectInputLoader from "cpm/components/select_input/select_input";
import * as tpmGridLoader from "cpm/components/tpm_grid/tpm_grid";
import * as tpmModalLoader from "cpm/components/modals/modal_loader";

// Import page specific view models and utils
import * as gridFactory from "cpm/home/home_projects_grid";
import * as addProjectModalFactory from "cpm/home/home_project_modal";
import TwoFA from "cpm/two_factor_auth/2fa";

import EventBus from "cpm/utils/EventBus";


var formatArrayLinks = function(links){
    var i, k, ary;

    for(i = 0, k = links.length; i < k; i++){
        if(!ary){
            ary = [];
        }

        ary.push({
            "primaryLabel": links[i].label,
            "secondaryLabel": links[i].secondaryLabel,
            "url": "cpm/" + links[i].url,
            "target": links[i].target
        });
    }

    return ary;
};


class HomeViewModel extends BaseViewModel {

    constructor() {
        var homeViewModel;
        let $grid;
        let $page;
        var currencyConverter = oj.Validation.converterFactory("number").createConverter({style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2});
        var gridCurrencyRenderer = function(context){
            return currencyConverter.format(context.data);
        };
        var getEWDColumns = function(eppEnabled){
            var retColumns = [{
                headerText: homeViewModel.nl("enterpriseDisbursement.grid.columns.total", {"value": "Total Count"}),
                headerClassName: "oj-helper-text-align-end",
                className: "oj-helper-text-align-end",
                field: "totalCount"
            },
            {
                headerText: homeViewModel.nl("enterpriseDisbursement.grid.columns.totalAmount", {"value": "Total Amount"}),
                field: "totalAmount",
                headerClassName: "oj-helper-text-align-end",
                className: "oj-helper-text-align-end",
                renderer: gridCurrencyRenderer
            }];

            if(eppEnabled){
                retColumns = retColumns.concat([{
                    headerText: homeViewModel.nl("enterpriseDisbursement.grid.columns.achCount", {"value": "ACH Count"}),
                    headerClassName: "oj-helper-text-align-end",
                    className: "oj-helper-text-align-end",
                    field: "ACHCount"
                },
                {
                    headerText: homeViewModel.nl("enterpriseDisbursement.grid.columns.achAmount", {"value": "ACH Amount"}),
                    field: "ACHAmount",
                    headerClassName: "oj-helper-text-align-end",
                    className: "oj-helper-text-align-end",
                    renderer: gridCurrencyRenderer
                },
                {
                    headerText: homeViewModel.nl("enterpriseDisbursement.grid.columns.eppCount", {"value": "EPP Count"}),
                    headerClassName: "oj-helper-text-align-end",
                    className: "oj-helper-text-align-end",
                    field: "EPPCount"
                },
                {
                    headerText: homeViewModel.nl("enterpriseDisbursement.grid.columns.eppAmount", {"value": "EPP Amount"}),
                    field: "EPPAmount",
                    headerClassName: "oj-helper-text-align-end",
                    className: "oj-helper-text-align-end",
                    renderer: gridCurrencyRenderer
                }]);
            }

            retColumns = retColumns.concat([
            {
                headerText: homeViewModel.nl("enterpriseDisbursement.grid.columns.task", {"value": "Task"}),
                field: "row.adminTask.label",
                template: "linkTaskTemplate"
            }]);

            return retColumns;
        };

        //TODO extract into a BaseGridViewModel?
        var aggregateGridViewOptions = function (options = {}) {
            let serializeSortBy = function (sortBy) {
                return _.map(sortBy, function (sort){
                    let field = "";
                    let order = "";
                    if(_.has(sort, "dataIndex")) {
                        field = sort.dataIndex;
                        order = sort.order;
                    } else {
                        field = _.first(_.keys(sort));
                        order = sort[field];
                    }
                    return {name: field, order: order};
                });
            };
            let existingViewConfig = $grid ? $grid.grid("getViewConfig") : {};
            let existingFilters = options.filters || existingViewConfig.advancedFilters;
            return {
                projectList: homeViewModel.projectsViewType(),
                paging: {
                    number: options.currentPage || 1,
                    offset: 50 // || chosen page size
                },
                filters: existingFilters || {},
                sorting: serializeSortBy(options.sorting || existingViewConfig.sortBy || [])
            };
        };

        super();

        homeViewModel = this;
        homeViewModel.pageWrapper = ko.observable({
            id: "page-home",
            debugMode: ko.observable(true),
            debugContextId: ko.observable("Home"),
            componentLabel: ko.observable(homeViewModel.nl("home.page.title", { "value": "TPM: Home" })),
            selectedView: ko.observable("")
        });

        homeViewModel.canViewOtherProjectsButton = ko.observable(false);
        homeViewModel.canAddProjects = ko.observable(false);
        homeViewModel.projectsViewType = ko.observable("user");

        homeViewModel.twoFactorAuthModule = "two_factor_auth/2fa";

        homeViewModel.adminActions = ko.observable({
            "id": "admin-actions",
            "debugMode": homeViewModel.pageWrapper().debugMode,
            "debugContextId": ko.observable("AdminActions"),
            "componentLabel": ko.observable(homeViewModel.nl("administrativeTasks.componentLabel", { "value": "Administrative Tasks List" })),
            "componentLabelCSS": ko.observable("oj-helper-hidden-accessible"),
            get config() {
                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojTable",
                    data: homeViewModel.adminActions().viewModel,
                    columnsDefault: { sortable: "none" },
                    columns: [{
                        headerText: homeViewModel.nl("administrativeTasks.sectionLabel", { "value": "Administrative Tasks" }),
                        field: "label",
                        template: "linkTemplate"
                    }],
                    rootAttributes: { "style": "width: 100%;" }
                });
            },
            "viewModel": new oj.ArrayTableDataSource([]),
            "visible": ko.observable(false),
            "click": function(data) {
                Router.openServiceLink({page: data.href});
            }
        });

        homeViewModel.centralizedDisbursementSummary = ko.observable({
            "id": "disbursement-summary",
            "debugMode": homeViewModel.pageWrapper().debugMode,
            "debugContextId": ko.observable("CentralizedDisbursmentSummary"),
            "componentLabel": ko.observable(homeViewModel.nl("enterpriseDisbursement.sectionLabel", { "value": "Enterprise Wide Disbursement" })),
            "componentLabelIcon": ko.observable("snap-icon-global"),
            get config() {
                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojTable",
                    data: homeViewModel.centralizedDisbursementSummary().viewModel,
                    columnsDefault: { sortable: "none" },
                    columns: [],
                    rootAttributes: { "style": "width: 100%;" }
                });
            },
            "viewModel": new oj.ArrayTableDataSource([]),
            "visible": ko.observable(false),
            "click": function click(data) {
                if (data.adminTask) {
                    Router.openServiceLink({page: data.adminTask.url});
                }
            }
        });

        homeViewModel.visitedProjects = ko.observable({
            "id": "visited-projects",
            "debugMode": homeViewModel.pageWrapper().debugMode,
            "debugContextId": ko.observable("VisitedProjects"),
            "componentLabel": ko.observable(homeViewModel.nl("visitedProjects.sectionLabel", { "value": "Recently Viewed Projects" })),
            "componentLabelIcon": ko.observable("snap-icon-projects"),
            "links": ko.observableArray([]),
            "visible": ko.observable(false),
            "click": function click(data) {
                Router.openServiceLink({page: data.url});
            }
        });

        homeViewModel.resetFilters = function () {
            let advancedFilters = homeViewModel.myProjectsGrid().gridVM.gridObject.widget.view.advancedFilters;
            let filterObj = {};
            _.each(advancedFilters.filters, function (filter, dataIndex) {
                if(dataIndex === "status") {
                     filterObj[dataIndex] = "Active";
                } else {
                    filterObj[dataIndex] = null;
                }
            });
            $grid.trigger("clear-filters");
            advancedFilters.applyFilterViewData(filterObj);
            $grid.trigger("refresh-grid-view");
        };

        //TODO extract into a BaseGridViewModel?
        homeViewModel.aggregateGridViewOptions = function (options = {}) {
            let serializeSortBy = function (sortBy) {
                return _.map(sortBy, function (sort){
                    let field = "";
                    let order = "";
                    if(_.has(sort, "dataIndex")) {
                        field = sort.dataIndex;
                        order = sort.order;
                    } else {
                        field = _.first(_.keys(sort));
                        order = sort[field];
                    }
                    return {name: field, order: order};
                });
            };
            let existingViewConfig = $grid ? $grid.grid("getViewConfig") : {};
            let existingFilters = existingViewConfig.advancedFilters;
            return {
                projectList: homeViewModel.projectsViewType(),
                paging: {
                    number: options.currentPage || 1,
                    offset: 50 // || chosen page size
                },
                filters: existingFilters,
                sorting: serializeSortBy(options.sorting || existingViewConfig.sortBy || [])
            };
        };

        homeViewModel.getDefaultRequestParams = function () {
            return {
                projectList: homeViewModel.projectsViewType(),
                paging: {
                    number: 1,
                    offset: 50
                },
                filters: {"status": "Active"},
                sorting: []
            };
        };

        homeViewModel.addProject = function () {
            var dialogModel = homeViewModel.addProjectDialog().viewModel();

            dialogModel.invokeModal();
        };

        homeViewModel.projectsViewChanged = function () {
            $grid.trigger("refresh-grid-view");
        };

        homeViewModel.myProjectsGrid = ko.observable({
            "id": "my-projects",
            "componentLabel": ko.observable(homeViewModel.nl("projects.sectionLabel", { "value": "Project List" })),
            "componentLabelIcon": ko.observable("snap-icon-projects"),
            "componentLabelCSS": ko.observable("tpm-section-header-underlined"),
            "nl": homeViewModel.nl,

            "parentContext": $("#primary-context"),
            "debugMode": homeViewModel.pageWrapper().debugMode,
            "debugContextId": ko.observable("Projects"),
            "factory": gridFactory,
            "requestParams": homeViewModel.getDefaultRequestParams(),
            "gridVM": null,
            "gridReady": function(event){
                var obsProjectGrid, obsProjectPaginator, thisVM, relatedData, togglePagination;
                $grid = $(this);

                togglePagination = function (totalResults, pageSize) {
                    $(".grid-pager").toggle(totalResults > pageSize);
                };

                obsProjectGrid = homeViewModel.myProjectsGrid();
                obsProjectPaginator = homeViewModel.myProjectsPaging();

                thisVM = obsProjectGrid.gridVM = event.detail.gridBindings;
                relatedData = event.detail.relatedData;

                obsProjectGrid.dataSource.reset(thisVM.gridData);
                obsProjectGrid.dataSource.setTotalResults(thisVM.gridMetaData.totalResults);

                obsProjectPaginator.dataSetCountLabel(homeViewModel.nl("projects.pagination.totalLabel", { "value": "Total: " }));
                obsProjectPaginator.dataSetCount(thisVM.gridMetaData.totalResults);

                obsProjectPaginator.pageSize(thisVM.gridMetaData.pageSize);
                homeViewModel.canViewOtherProjectsButton(relatedData.showOtherProjects);
                homeViewModel.canAddProjects(relatedData.permissions.canAddProject);

                $grid.trigger("status-filter-defaults");

                togglePagination(thisVM.gridMetaData.totalResults, thisVM.gridMetaData.pageSize);

                $grid.on("grid-link-clicked", function(eve, data) {
                    if(data.dataIndex === "taskCount") {
                        Router.getRouter().store({tasksProjectFilterName: data.record.projectName});
                        Router.openServiceLink({page: "ui/tasks"});
                    } else {
                        Router.openServiceLink({page: "cpm/" + data.record.url});
                    }
                });

                $grid.on("refresh-grid-view", function (e, data) {
                    var viewObject = aggregateGridViewOptions(data);
                    obsProjectGrid.gridVM.gridObject.fetchData({
                        previousGridVM: obsProjectGrid.gridVM,
                        requestParams: viewObject
                    });
                });

                $grid.on("data-loaded", function (e, data) {
                    let metaData = data.projects.reportData.metaData;
                    obsProjectPaginator.pageSize(metaData.pageSize);
                    obsProjectGrid.dataSource.setTotalResults(metaData.totalResults);
                    obsProjectPaginator.dataSetCount(metaData.totalResults);
                    togglePagination(metaData.totalResults, metaData.pageSize);

                });
            },

            get dataSource() {
                var collection = new (oj.Collection.extend({
                    model: oj.Model.extend({ idAttribute: "id" })
                }))();

                delete this.dataSource;

                this.dataSource = {
                    collection: collection,
                    reset: function reset(params) {
                        collection.reset(params);
                    },
                    setTotalResults: function setTotalResults(size) {
                        collection.totalResults = size;
                    }
                };

                return this.dataSource;
            }
        });

        homeViewModel.myProjectsPaging = ko.observable({
            debugMode: homeViewModel.pageWrapper().debugMode,
            debugContextId: ko.observable("Paginator"),
            dataSetCountLabel: ko.observable(""),
            dataSetCount: ko.observable(""),
            pageSize: ko.observable(""),
            get config() {
                var obsPaginator = homeViewModel.myProjectsPaging();

                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojPagingControl",
                    data: obsPaginator.viewModel,
                    pageSize: obsPaginator.pageSize,
                    pageOptions: { layout: ["nav", "pages", "input"] }
                });
            },

            get viewModel() {
                delete this.viewModel;

                this.viewModel = new oj.PagingTableDataSource(new oj.CollectionTableDataSource(homeViewModel.myProjectsGrid().dataSource.collection));

                return this.viewModel;
            }
        });

        homeViewModel.addProjectDialog = ko.observable(_.extend(
        {
            id: "add-projects-modal",
            debugMode: homeViewModel.pageWrapper().debugMode,
            debugContextId: ko.observable("AddProjectsDialog"),
            primaryLabel: ko.observable(homeViewModel.nl("projects.addProjectsDialog.dialogTitle", { "value": "Add Project" })),
            factory: addProjectModalFactory,
            nl: homeViewModel.nl,
            onCancel: function onCancel() {
                var gridVM = homeViewModel.myProjectsGrid().gridVM;
                gridVM.gridObject.abortNewRule(gridVM);
            },
            onSave: function onSave() {
                $grid.trigger("refresh-grid-view");
            },
            viewModel: ko.observable()
        }));

        homeViewModel.handleActivated = function (info) {

            CpmUtils.tajax({
                "type": "GET",
                "dataType": "json",
                "cache": false,
                "url": _Textura.foyr_url + "home/apis/admin_actions",
                success: function success(data, status, xhr) {
                    homeViewModel.adminActions().viewModel.reset(data);
                    homeViewModel.adminActions().visible(data.length > 0);
                }
            });

            CpmUtils.tajax({
                "type": "GET",
                "dataType": "json",
                "cache": false,
                "url": _Textura.foyr_url + "home/apis/epp_summary",
                success: function success(data, status, xhr) {
                    homeViewModel.centralizedDisbursementSummary().config.columns = getEWDColumns(data.EPPActive);
                    homeViewModel.centralizedDisbursementSummary().viewModel.reset([data]);
                    homeViewModel.centralizedDisbursementSummary().visible(data.totalCount ? data.totalCount > 0 : false);
                }
            });

            CpmUtils.tajax({
                "type": "GET",
                "dataType": "json",
                "cache": false,
                "url": _Textura.foyr_url + "home/apis/visited_projects",
                success: function success(data, status, xhr) {
                    homeViewModel.visitedProjects().links(formatArrayLinks(data));
                    homeViewModel.visitedProjects().visible(data.length > 0);
                }
            });

            if ($grid) {
                // If this is a revisit to home, simply refresh the grid
                $grid.trigger("refresh-grid-view");
            }
            EventBus.instance.broadcastMessage("hide-breadcrumb", HomeViewModel);
        };

        homeViewModel.handleAttached = function (info) {
            $page = $("#home-projects-page");
            $page.find("#disbursement-summary").on("grid-link-clicked", function(eve, data) {
                Router.openServiceLink({page: data.record.url});
            });
            $page.find("#admin-actions").on("grid-link-clicked", function(eve, data) {
                Router.openServiceLink({page: data.record.url});
            });
            $(".grid-pager").on("ojoptionchange", function(e, data){
                if(data.previousValue){
                    switch(data.option){
                        case "value":
                            $grid.trigger("refresh-grid-view", {currentPage: data.value});
                            break;
                    }
                }
            });
        };

        homeViewModel.handleBindingsApplied = function (info) {
        };
    }

    get setupModalStyles() {
    }

}

export default new HomeViewModel();
