import * as oj from "ojs/ojcore";
import * as ko from "knockout";
import * as ojKO from "ojs/ojknockout";
import * as ojValidation from "ojs/ojvalidation";
import * as ojKOValidation from "ojs/ojknockout-validation";
import * as ojDialog from "ojs/ojdialog";
import * as ojCheckboxset from "ojs/ojcheckboxset";

import * as CpmUtils from "cpm/utils/common";
import * as ValidationUtils from "cpm/utils/validation";
import { baseSelectionEvaluator, requiredTextEvaluator, serverGeneratedEvaluator } from "cpm/utils/validation_evaluators";
import { baseModalViewModelFactory } from "cpm/common/view_model_factory";

import * as BaseViewModel from "cpm/BaseViewModel";

var clearCustomValidationMessages = clearCustomValidationMessages = function(...formMessages){
    var message;

    for(message of formMessages){
        message([]);
    }
};

var generateViewModel = function(modalContext){
    var modalVM, self, nl, dropDownValues, oracleOIErrorMsg;

    self = _.extend(this, new BaseViewModel.default());
    nl = self.nl;

    dropDownValues = {
        projectTypes: [],
        projectLocales: [{
            "value": "en_US",
            "label": nl("projects.addProjectsDialog.projectTemplateDropdown.locales.enUS", { "value": "English-US" })
        }, {
            "value": "en_CA",
            "label": nl("projects.addProjectsDialog.projectTemplateDropdown.locales.enCA", { "value": "English-CA" })
        }, {
            "value": "en_AE",
            "label": nl("projects.addProjectsDialog.projectTemplateDropdown.locales.enAE", { "value": "English-AE" })
        }, {
            "value": "en_UK",
            "label": nl("projects.addProjectsDialog.projectTemplateDropdown.locales.enAU", { "value": "English-AU" })
        }, {
            "value": "fr_CA",
            "label": nl("projects.addProjectsDialog.projectTemplateDropdown.locales.frCA", { "value": "French-CA" })
        }]
    };

    oracleOIErrorMsg = nl("projecets.addProjectsDialog.oiErrorMsg", {"value": "A new project may not be created because this organization does not currently have a valid Subscription Plan Management (SPM) plan in place. Please contact your Oracle sales representative. US Customer Support: 866-839-8872 | Hours M-F 7am - 8pm CST"});

    modalVM = _.extend(baseModalViewModelFactory(modalContext, true), {
        debugMode: ko.observable(true),
        debugContextId: ko.observable("HomeProjectModal")
    });

    modalVM = _.extend(modalVM, {
        currentRecord: null,
        createProjects: true,

        debugMode: modalVM.debugMode,
        debugContextId: modalVM.debugContextId,

        // Modal fields
        projectName: ko.observable({
            "id": "project-name",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("ProjectNameInput"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.projectName", { "value": "Project Name" })),

            get config(){
                var fieldModel = this;

                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojInputText",
                    rootAttributes: {style: "max-width: 100%"},
                    required: true,
                    invalidComponentTracker: modalVM.validationTracker,
                    value: fieldModel.viewModel,
                    messagesCustom: fieldModel.validationMessages
                });
            },
            "viewModel": ko.observable(""),
            "validationMessages": ko.observableArray([])
        }),

        projectNumber: ko.observable({
            "id": "project-number",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("ProjectNumberInput"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.projectNumber", {"value": "General Contractor Project Number"})),

            get config(){
                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojInputText",
                    rootAttributes: {style: "max-width: 100%"},
                    value: modalVM.projectNumber().viewModel
                });
            },
            "viewModel": ko.observable("")
        }),

        projectStartDate: ko.observable({
            "id": "project-start-date",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("StartDateInput"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.projectStartDate", {"value": "Original Estimated Start Date"})),

            get config(){
                 var fieldModel = this;

                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojInputDate",
                    datePicker: {
                      numberOfMonths: 1
                    },
                    rootAttributes: {
                        style: "max-width: 100%"
                    },
                    required: true,
                    invalidComponentTracker: modalVM.validationTracker,
                    value: modalVM.projectStartDate().viewModel,
                    messagesCustom: fieldModel.validationMessages
                });
            },
            "viewModel": ko.observable(""),
            "validationMessages": ko.observableArray([])
        }),

        projectEndDate: ko.observable({
            "id": "project-end-date",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("EndDateInput"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.projectEndDate", {"value": "Original Estimated Completion Date"})),

            get config(){
                var fieldModel = this;

                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojInputDate",
                    datePicker: {
                        numberOfMonths: 1
                    },
                    min: modalVM.projectStartDate().viewModel,
                    value: modalVM.projectEndDate().viewModel,
                    rootAttributes: {
                        style: "max-width: 100%"
                    },
                    required: true,
                    invalidComponentTracker: modalVM.validationTracker,
                    messagesCustom: fieldModel.validationMessages
                });
            },
            "viewModel": ko.observable(""),
            "validationMessages": ko.observableArray([])
        }),

        projectLanguageChoices: ko.observable({
            "id": "project-language-select",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("ProjectLanguageSelect"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.projectLanguageChoice", { "value": "Project Translation" })),

            get config() {
                var fieldModel = this;

                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojSelect",
                    rootAttributes: { style: "max-width: 100%" },
                    options: modalVM.projectLanguageChoices().viewModel.options,
                    value: modalVM.projectLanguageChoices().viewModel.selected,
                    //required: true,
                    //placeholder: modalVM.ruleTypePlaceHolder,
                    invalidComponentTracker: modalVM.validationTracker,
                    messagesCustom: fieldModel.validationMessages
                });
            },
            "viewModel": {
                "options": ko.observableArray(dropDownValues.projectLocales),
                "selected": ko.observable()
            },
            "validationMessages": ko.observableArray([])
        }),

        projectReferenceChoices: ko.observable({
            "id": "derive-project-from",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("ProjectReferenceSelect"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.projectReferenceChoice", { "value": "Copy From Another Project" })),

            get config() {
                // delete getter function bound to object property "config"
                delete this.config;

                // set object property to the actual value we need, so we can refer to that from now on
                return (this.config = {
                    component: "ojSelect",
                    rootAttributes: { style: "max-width: 100%" },
                    options: modalVM.projectReferenceChoices().viewModel.options,
                    value: modalVM.projectReferenceChoices().viewModel.selected
                });
            },
            "viewModel": {
                "options": ko.observableArray(),
                "selected": ko.observableArray()
            }
        }),

        copyAttributesIntoProject: ko.observable({
            "id": "copy-project-attributes",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("CopyComplianceOption"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.option.copyCompliance", { "value": "Copy Compliance Requirements" })),
            "viewModel": ko.observableArray([])
            /*
            get config() {
                delete this.config;
                return (this.config = {
                    component: "ojCheckboxset",
                    value: ko.pureComputed(function () {
                        var ret, compliance, approvalRules;
                        ret = [];

                        compliance = modalVM.copyComplianceRequirements().config.value;
                        approvalRules = modalVM.copyApprovalRules().config.value;

                        if (compliance) {
                            ret.push(compliance);
                        }

                        if (approvalRules) {
                            ret.push(approvalRules);
                        }

                        return ret;
                    })
                });
            }*/
        }),

        copyComplianceRequirements: ko.observable({
            "id": "copy-compliance",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("CopyComplianceOption"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.option.copyCompliance", { "value": "Copy Compliance Requirements" }))
        }),

        copyApprovalRules: ko.observable({
            "id": "copy-rules",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("EnableApprovalRulesOption"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.option.copyApprovalRules", { "value": "Copy Approval Rules Which Apply to Project" }))
        }),

       subcontractorUsageFees: ko.observable({
            "id": "subcontractor-usage-fees",
            "debugMode": modalVM.debugMode,
            "debugContextId": ko.observable("SubcontractorUsageFees"),
            "primaryLabel": ko.observable(nl("projects.addProjectsDialog.option.subcontractorUsageFees", { "value": "Pay Subcontractor Usage Fees"})),
            "visible": ko.observable(true)
        }),

        setFormModel: function(){
            modalVM.projectName().viewModel("");
            modalVM.projectNumber().viewModel("");
            modalVM.projectStartDate().viewModel("");
            modalVM.projectEndDate().viewModel("");
            modalVM.projectLanguageChoices().viewModel.selected(["en_US"]);
            modalVM.copyAttributesIntoProject().viewModel.removeAll();

            CpmUtils.tajax({
                "type": "GET",
                "dataType": "json",
                "cache": false,
                "url": _Textura.foyr_url + "resources/projects/cloneoptions",
                success: function success(data, status, xhr) {
                    var serverValues = [data.default].concat(data.projects).concat(data.templates).slice(0);
                    var replaceKeyInCollection = CpmUtils.jsonTools.replaceKeyInCollection;

                    replaceKeyInCollection(serverValues, "id", "value");
                    replaceKeyInCollection(serverValues, "name", "label");

                    dropDownValues.projectTypes = serverValues;

                    modalVM.projectReferenceChoices().viewModel.options.removeAll();
                    modalVM.projectReferenceChoices().viewModel.options(dropDownValues.projectTypes);

                    modalVM.projectReferenceChoices().viewModel.selected.removeAll();
                    modalVM.projectReferenceChoices().viewModel.selected([data.default.id]);

                    modalVM.subcontractorUsageFees().visible(data.canPayUsageFees);

                    modalVM.createProjects = data.createProjects;
                    modalVM.disableOkButton();
                }
            });
        },

        invokeModal: function(){
            modalVM.setFormModel();


            clearCustomValidationMessages(
                modalVM.projectEndDate().validationMessages,
                modalVM.projectLanguageChoices().validationMessages
            );

            modalVM.triggerDialog();
        },

        // Validation Tracker and Tester
        validationTracker: ko.observable(),
        get ojDialogConfig(){
            delete this.ojDialogConfig;

            return (this.ojDialogConfig = {
                component: "ojDialog",
                initialVisibility: "hide",
                rootAttributes: {
                    style: "width: 508px; height: 535px;"
                },
                close: function(event, ui){
                    modalVM.cancelChanges();
                }
            });
        },
        ojOkDialogButtonConfig: function(){
            return {
                component: "ojButton",
                label: nl("projects.addProjectsDialog.okButton", {"value": "Add"}),
                disabled: modalVM.disableOkButton
            };
        },

        disableOkButton: ko.pureComputed(function(){
            var trackerObj = ko.utils.unwrapObservable(modalVM.validationTracker);
            return trackerObj && trackerObj.invalidShown && !modalVM.createProjects || false;
        }),
        commitChanges: function commitChanges() {
            var ret;
            ret = new Promise(function (resolve, reject) {
                var projectLocaleSelection, cloneFromProjectSelection;

                clearCustomValidationMessages(modalVM.projectName().validationMessages, modalVM.projectStartDate().validationMessages, modalVM.projectEndDate().validationMessages, modalVM.projectLanguageChoices().validationMessages);

                projectLocaleSelection = modalVM.projectLanguageChoices().viewModel.selected();
                cloneFromProjectSelection = modalVM.projectReferenceChoices().viewModel.selected();

                projectLocaleSelection = projectLocaleSelection.length > 0 ? projectLocaleSelection[0] : "";
                cloneFromProjectSelection = cloneFromProjectSelection.length > 0 ? cloneFromProjectSelection[0] : "";

                CpmUtils.tajax({
                    "type": "POST",
                    "contentType": "application/json; charset=utf-8",
                    "dataType": "json",
                    "cache": false,
                    "url": _Textura.foyr_url + "resources/projects/",
                    "data": JSON.stringify({
                        "projectName": modalVM.projectName().viewModel(),
                        "projectNumber": modalVM.projectNumber().viewModel(),
                        "startDate": modalVM.projectStartDate().viewModel(),
                        "endDate": modalVM.projectEndDate().viewModel(),
                        "projectLocale": projectLocaleSelection,
                        "cloneFromProject": cloneFromProjectSelection,
                        "copyComplianceReqs": (modalVM.copyAttributesIntoProject().viewModel().indexOf("copyCompliance") > -1),
                        "copyApprovalRules": (modalVM.copyAttributesIntoProject().viewModel().indexOf("copyRules") > -1),
                        "subcontractorUsageFees": (modalVM.copyAttributesIntoProject().viewModel().indexOf("subcontratorUsageFees") > -1)
                    }),
                    success: function success(data, status, xhr) {
                        if (data.message) {
                            // Server side validation errors exists, expose them on the form
                            ValidationUtils.validateObservable(modalVM.projectName().viewModel, new ValidationUtils.CustomBaseValidator({ evaluate: function evaluate() {
                                    return serverGeneratedEvaluator(data.message.projectName);
                                } }), modalVM.projectName().validationMessages);

                            ValidationUtils.validateObservable(modalVM.projectStartDate().viewModel, new ValidationUtils.CustomBaseValidator({ evaluate: function evaluate() {
                                    return serverGeneratedEvaluator(data.message.startDate);
                                } }), modalVM.projectStartDate().validationMessages);

                            ValidationUtils.validateObservable(modalVM.projectEndDate().viewModel, new ValidationUtils.CustomBaseValidator({ evaluate: function evaluate() {
                                    return serverGeneratedEvaluator(data.message.endDate);
                                } }), modalVM.projectEndDate().validationMessages);

                            ValidationUtils.validateObservable(modalVM.projectLanguageChoices().viewModel.selected, new ValidationUtils.CustomBaseValidator({ evaluate: function evaluate() {
                                    return serverGeneratedEvaluator(data.message.projectLocale);
                                } }), modalVM.projectLanguageChoices().validationMessages);

                            ko.utils.unwrapObservable(modalVM.validationTracker).focusOnFirstInvalid();
                        } else {
                            modalContext[0].dispatchEvent(new CustomEvent("save", {
                                "bubbles": true,
                                "detail": {
                                    "serverResponse": data
                                }
                            }));
                        }

                        resolve(data);
                    }
                });
            });

            return ret;
        },
        cancelChanges: function cancelChanges() {}
    });

    return modalVM;
};

export {
    generateViewModel
};
