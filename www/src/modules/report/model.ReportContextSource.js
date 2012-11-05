/*
 * @id 507ea0e8f009f - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */

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
