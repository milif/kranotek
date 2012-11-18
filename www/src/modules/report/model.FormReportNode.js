/*
 * @id 50a8d133a90b4 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
App.defineModel('FormReportNode', {
    defaults: {
        'Name': '',
        'Data': ''
    },
    toString: function(){
        return this.get('Name');
    }
});
