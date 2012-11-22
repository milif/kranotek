/*
 * @id 50a8d133a90b4 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
App.defineModel('FormReportNode', {
    defaults: {
        'Name': '',
        'Data': ''
    },
    validateModel: function(attrs){
        var errors = [],
            attr;
        attr = attrs.Name;
        if(typeof attr !='undefined') {
            if(attr.length == 0 ) {
                errors.push({ name: 'Name', msg: 'Обязательно к заполнению'});
            }
        }
        if(this.get('Type') === 'Data') {
            attr = attrs.Data;
            if(typeof attr !='undefined') {
                if(attr.length == 0 ) {
                    errors.push({ name: 'Data', msg: 'Обязательно к заполнению'});
                }
            }
        }
        return errors.length > 0 ? errors : null ;
    },
    toString: function(){
        return this.get('Name');
    }
});
