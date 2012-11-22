/*
 * @id 50a8d133a900e - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
* @require modules/report/model.FormReportNode.js
*/
App.defineCollection('FormReportNodes', {
    extend: 'CollectionNested',
    model: App.getModel('FormReportNode')
});
