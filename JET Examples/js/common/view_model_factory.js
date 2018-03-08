import * as ko from "knockout";
import * as CpmUtils from "cpm/utils/common";

var baseModalViewModelFactory, smartSearchViewModelFactory, alertViewModelFactory;

/** @module baseModalViewModelFactory */
/** @param {object} modalContext - The Modal Object.
/** @param {object} (optional) compositeModal - boolean to denote whether a composite modal is being used
 * @return {object} decorated modal.*/
baseModalViewModelFactory = function(modalContext, compositeModal = false){
    var thisDialog;
    var model = {
        modalContext: modalContext,
        disableOkButton: ko.observable(false),
        okLabel: ko.observable("Apply"),
        cancelLabel: "Cancel",
        ojOkDialogButtonConfig: function(){
            return { component: "ojButton", label: this.okLabel, disabled: this.disableOkButton };
        },
        ojCancelDialogButtonConfig: function(){
            return { component: "ojButton", label: this.cancelLabel };
        },
        triggerDialog: function(){
            if (compositeModal) {
                thisDialog = $(modalContext.find("[data-modal-body='true']")[0]).ojDialog("open");
            } else {
                // backwards compatibility with older modals TODO: remove/update all old versions to new pattern
                this.modalContext.ojDialog("open");
            }
        },
        dismissDialog: function(){
            var cancelChanges;

            if (compositeModal) {
                cancelChanges = this.viewModel().cancelChanges;
            } else {
                cancelChanges = this.cancelChanges;
            }

            if (cancelChanges) {
                cancelChanges();
            }

            thisDialog.ojDialog("close");
        },
        okDialog: function(){
            var commitChanges;

            if (compositeModal){
                commitChanges = this.viewModel().commitChanges;
                if (commitChanges) {
                    commitChanges().then(function (canClose) {
                        if (!canClose.message) {
                            thisDialog.ojDialog("close");
                        }
                    });
                }
            } else {
                commitChanges = this.commitChanges;
                return commitChanges && commitChanges();
                //thisDialog.ojDialog("close");
            }
        }
    };

    return model;
};

alertViewModelFactory = function(){
    var model = {
        showSuccess: ko.observable(false),
        label: ko.observable("Success"),
        details: ko.observable(""),
        dismissAlert: function(){
            this.showSuccess(false);
            return;
        },
        ojRemoveButtonConfig: function(){
            return {
                component: "ojButton",
                chroming: "half",
                display: "icons",
                icons: {end: "oj-panel-remove-icon"},
                label: "remove"
            };
        }
    };
    return model;
};

smartSearchViewModelFactory = function(){
    return new (function(){
        var _viewModel = this;

        _viewModel.smartSearchItems = ko.observableArray([]);

        _viewModel.optionsKeys = {
            value: "userName",
            label: "userName"
        };

        _viewModel.defaultOptions = [];

        _viewModel.formatOptions = function(optionObj){
            optionObj.parentElement.textContent = optionObj.data.userName;
            return optionObj;
        };

        _viewModel.searchLabel = function(index){
            index += 1;
            return `Approvers ${index}:`;
        };

        _viewModel.isLastSearchItem = function(index){
            return (_viewModel.smartSearchItems().length - 1) === index;
        };

        _viewModel.showAddButton = ko.pureComputed(function(){
            if (Array.isArray(_viewModel.smartSearchItems())) {
                return true;
            }
            let items = _viewModel.smartSearchItems();
            return (items.length > 0 && items[items.length - 1].values().length > 0);
        });

        _viewModel.disableRemoveButton = ko.pureComputed(function(){
            return _viewModel.smartSearchItems().length < 2;
        });

        _viewModel.addItem = function(){
            _viewModel.smartSearchItems.push({values: ko.observableArray([])});
        };

        _viewModel.removeItem = function(){
            if(_viewModel.smartSearchItems().length > 1){
                _viewModel.smartSearchItems.pop();
            }
        };

        _viewModel.populateOptions = function(orgId){
            return new Promise(function(resolve, reject) {
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "cache": false,
                "url": `${_Textura.foyr_url}approval_rules/smasi/projects/apis/approvers/${orgId}`,
                success: function(data, status, xhr){
                        _viewModel.defaultOptions = data.approvers;
                        resolve(data.approvers);
                }});
            });
        };

        _viewModel.commitChanges = function(){
            var jsonOutput = [];
            var observableDataToSave = _viewModel.smartSearchItems();
            var i, k;

            for(i = 0, k = observableDataToSave.length; i < k; i++){
                jsonOutput.push(ko.toJSON(observableDataToSave[i]));
            }

            return jsonOutput;
        };
    })();
};

let gridControlViewModelFactory = function(){
    var model = {
        ojAddRecordButtonConfig: function(){
            return CpmUtils.addButtonConfig();
        },
        lastUpdated: ko.observable("")
    };
    return model;
};

/**
 * Load an oJetModule by path and model
 * @param viewModel
 * @param viewPath
 * @returns moduleSettings
 */
let baseViewModuleFactory = function(viewModel, viewPath){
    let modelFactory =
        {
            createViewModel: function(params, valueAccessor)
            {
                let model = viewModel.default;
                return Promise.resolve(model);
            }
        };

    let moduleSettings =
        {
            viewName: viewPath,
            viewModelFactory: modelFactory
        };
    return moduleSettings;
};
export { baseModalViewModelFactory,
    alertViewModelFactory,
    smartSearchViewModelFactory,
    gridControlViewModelFactory,
    baseViewModuleFactory
};
