
App.defineModel('ReportContextSource', {
    defaults: {
        'Name': '',
        'ContextSource': undefined
    },
    getContextSource: function(id) {
        var contextSource = this.get('ContextSource'),
            collectionMainTable = new(App.getCollection(contextSource))([], {
                params: {'SourceId': id }
            });
        return collectionMainTable;
    },
    api: 'reportcontext'
});
