/*
 * @id 508ec3c9a616f - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require modules/class/model.ClassField.js
 * @require modules/class/collection.ClassField.js  
 * @require modules/class/collection.ClassFunction.js  
 */
App.defineModel('ClassPresenter', {
    defaults: {
        'Name': '',
        'FunctionId': '',
        'Type': '',
        'Config': null
    },
    validateModel: function(attrs){
        var errors = [],
            attr;
        
        attr = attrs.Name;
        if(typeof attr !='undefined') {
            if(attr.length < 4) {
                errors.push({ name: 'Name', msg: 'Название 4 и более символов'});
            } else if(!/^[a-z]+[a-z0-9]*$/i.test(attr)){
                errors.push({ name: 'Name', msg: 'Не верное назнвание класса'});
            }
        }            
        return errors.length > 0 ? errors : null ;
    },    
    api: 'classpresenter'
});

$.extend ( App.getModel('ClassPresenter'), {
    TypesValues: {'Table':'Таблица'}
});