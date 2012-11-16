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
    toString: function() {
        return this.get('Name');
    },
    validateModel: function(attrs){
        var errors = [],
            attr;

        attr = attrs.FunctionId;
         if(typeof attr !='undefined') {
           if(attr.length < 1) {
                errors.push({ name: 'FunctionId', msg: 'Выберите источник данных'});
            }
        }

        attr = attrs.Type;
        if(typeof attr !='undefined') {
           if(attr.length < 1) {
                errors.push({ name: 'Type', msg: 'Выберите тип'});
            }
        }

        attr = attrs.Name;
        if(typeof attr !='undefined') {
            if(attr.length < 4) {
                errors.push({ name: 'Name', msg: 'Название 4 и более символов'});
            }
        }
        return errors.length > 0 ? errors : null ;
    },
    api: 'classpresenter'
});

$.extend ( App.getModel('ClassPresenter'), {
    TypesValues: {'Table':'Таблица'}
});
