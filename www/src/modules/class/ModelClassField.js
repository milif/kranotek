App.defineModel('ModelClassField', {
    defaults: {
        'id': null,
        'Name': '',
        'Description': '',
        'Type': '',
        'Default': '',
        'Required': false,
        'Unique': false,
        'External': false
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
    api: 'classfield'
});
$.extend ( App.getModel('ModelClassField'), {
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