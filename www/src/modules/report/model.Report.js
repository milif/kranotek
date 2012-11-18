/*
 * @id 50a8d133a8f2a - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require App.js
 */
App.defineModel('Report', {
    defaults: {
        'Name': '',
        'Config': ''
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
        if(typeof attr !='undefined') {
            if(attr.length == 0 ) {
                errors.push({ name: 'Name', msg: 'Обязательно к заполнению'});
            }
        }
        return errors.length > 0 ? errors : null ;
    },
    api: 'report'
});

