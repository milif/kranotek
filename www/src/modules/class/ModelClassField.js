App.defineModel('ModelClassField', {
    defaults: {
        'Name': '',
        'Description': '',
        'Type': '',
        'Default': '',
        'Required': false,
        'Unique': false
    },
    validateModel: function(attrs){
        var errors = [],
            attr;

        attr = attrs.Name;
        if(typeof attr !='undefined') {
            if(attr.length < 4) {
                errors.push({ name: 'Name', msg: 'Название 4 и более символов'});
            }
        }
        return errors.length > 0 ? errors : null ;
    },
    api: 'classfield'
});
