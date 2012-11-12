/*
 * @id 509e5501e3a5b - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
App.defineModel('ViewAsTableConfig', {
    defaults: {
        'title': '',
        'fieldName': '',
        'columnWidth': '',
        'isVisible': true
    },
    validateModel: function(attrs){
        var errors = [],
            attr;

        attr = attrs.title;
         if(typeof attr !='undefined' && attr != '') {
           if(attr.length < 4) {
                errors.push({ name: 'title', msg: 'Заголовок 4 и более символов'});
            }
        }

        attr = attrs.fieldName;
        if(typeof attr !='undefined' && attr != '') {
           if(attr.length < 4) {
                errors.push({ name: 'fieldName', msg: 'Название 4 и более символов'});
            } else if(!/^[a-z]+[a-z0-9]*$/i.test(attr)){
                errors.push({ name: 'fieldName', msg: 'Не верное назнвание класса'});
            }
        }

        attr = attrs.columnWidth;
        if(typeof attr !='undefined' && attr != '') {
            if(!/\d*$/i.test(attr)) {
                errors.push({ name: 'columnWidth', msg: 'Не число'});
            }
        }
        return errors.length > 0 ? errors : null ;
    }
});