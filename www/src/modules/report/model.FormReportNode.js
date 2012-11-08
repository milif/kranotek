/*
 * @id 509ba0667fa74 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
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