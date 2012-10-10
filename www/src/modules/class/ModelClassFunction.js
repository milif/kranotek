App.defineModel('ModelClassFunction', {
    defaults: {
        'Name': '',
        'Info': '',
        'Type': 0,
        'isActive': false,
        'UseFields': false
    },
    getCollectionFields: function(type){
        return this.id ? new (App.getCollection('CollectionClassFunctionField'))(null, {
            params: {
                'FunctionId': this.id,
                'type': type
            }
        }) : null;
    },
    validateModel: function(attrs){
        var errors = [],
            attr;
        
        attr = attrs.Name;
        if(typeof attr !='undefined') {
            if(attr.length < 4) {
                errors.push({ name: 'Name', msg: 'Название 4 и более символов'});
            } else if(!/^[a-z]+[a-z0-9]*$/i.test(attr)){
                errors.push({ name: 'Name', msg: 'Не верное назнвание функции'});
            }
        }
        attr = attrs.Info;
        if(typeof attr !='undefined') {
            if(attr.length == 0 ) {
                errors.push({ name: 'Info', msg: 'Обязательно к заполнению'});
            }
        }
        return errors.length > 0 ? errors : null ;
    },
    api: 'classfunction'
});
$.extend(App.getModel('ModelClassFunction'), {
    getModelField: function(){
        return App.getModel('ModelClassFunctionField');
    },
    functionTypes: {
        0:'Чтение',
        1:'Создание',
        2:'Изменение'
    }
});
