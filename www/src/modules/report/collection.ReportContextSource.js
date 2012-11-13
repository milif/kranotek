/*
 * @id 507ea0e8efeee - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */

/*
* @require modules/report/model.ReportContextSource.js
* @require CollectionNested.js
*/
App.defineCollection('ReportContextSource', {
    model: App.getModel('ReportContextSource'),
    extend: 'CollectionNested',
    getName: function(node){
        return node.get('Name');
    }
});
