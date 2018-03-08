var compositeView = `
<!-- ko if: someExpressionGoesHere -->
<div>
    <div style="margin-top: 20px;" class="demo-row-classes  demo-flex-display oj-flex-items-pad">
        <div class="oj-flex oj-sm-flex-items-initial oj-sm-justify-content-space-between">
            <div class="oj-flex-item">
                <strong>Total: </strong><span></span>
            </div>
            <div class="oj-flex-item">
                <div id="paging" data-bind="ojComponent: {component: 'ojPagingControl', data: pagingDatasource, pageSize: 15}">
                </div>
            </div>
        </div>
    </div>
</div>
<!-- /ko -->
`;
