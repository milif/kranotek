/*
 * @id 508ec5af738d7 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require modules/class/model.ClassPresenter.js
 */
App.defineCollection('ClassPresenter', {
    model: App.getModel('ClassPresenter'),
    getName: function(node){
        return node.get('Name');
    }
});
