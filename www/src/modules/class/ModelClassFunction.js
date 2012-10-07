App.defineModel('ModelClassFunction', {
    defaults: {
        'id': null,
        'Name': '',
        'Info': '',
        'Type': null,
        'isActive': false,
        'UseFields': false
    },
    getCollectionFields: function(type){
        return new (App.getCollection('CollectionClassFunctionField'))(null, {
            local: !this.id,
            params: {
                'ClassFunctionId': this.id,
                'type': type
            }
        });
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
        attr = attrs.Info;
        if(typeof attr !='undefined') {
            if(attr.length == 0 ) {
                errors.push({ name: 'Info', msg: 'Обязательно к заполнению'});
            }
        }
        return errors.length > 0 ? errors : null ;
    },
    api: 'class'
});
$.extend(App.getModel('ModelClassFunction'), {
    getModelClassField: function(){
        return App.getModel('ModelClassFunctionField');
    },
    fieldTypes: {
        0:'Integer',
        1:'Bigint',
        2:'Smallint',
        3:'Numeric',
        4:'Boolean',
        5:'Timestamp',
        6:'Text',
        7:'Subtype'
    }
});