App.defineModel('ClassFunctionField', {
    defaults: {
        'id': null,
        'Name': '',
        'Info': '',
        'Datatype': null,
        'isConfigurable': false,
        'isNull': false,
        'isArray': 0
    },
    validateModel: function(attrs){
        var errors = [],
            attr;

        attr = attrs.Name;
        if(typeof attr !='undefined') {
            if(attr.length < 4) {
                errors.push({ name: 'Name', msg: 'Название 4 и более символов'});
            } else if(!/^[a-z]+[a-z0-9]*$/i.test(attr)){
                errors.push({ name: 'Name', msg: 'Не верное название поля'});
            } 
        }
        return errors.length > 0 ? errors : null ;
    },
    api: 'classfunctionfield'
});
$.extend ( App.getModel('ClassFunctionField'), {
    fieldTypes: App.getModel('ModelClassField').fieldTypes
});
