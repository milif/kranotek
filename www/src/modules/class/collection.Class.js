/*
 * @id 507c05915389b - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require modules/class/model.Class.js
 * @require CollectionNested.js   
 */
App.defineCollection('Class', {
    model: App.getModel('Class'),
    extend: 'CollectionNested',
    getName: function(node){
        return node.get('ClassName');
    }
});
