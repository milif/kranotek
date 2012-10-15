/*
 * @require App.js
 * @require modules/class/model.ClassField.js   
 */
App.defineModel('ClassFunctionField', {
    defaults: {
        'id': null,
        'Name': '',
        'Info': '',
        'Datatype': 0,
        'isConfigurable': false,
        'isNull': false,
        'isArray': 0
    },
    validateModel: function(attrs){
        var errors = [],
            attr,
            isArray = '_isArray' in attrs ? attrs._isArray : this.attributes._isArray;

        attr = attrs.Name;
        if(typeof attr !='undefined') {
            if(attr.length < 4) {
                errors.push({ name: 'Name', msg: 'Название 4 и более символов'});
            } else if(!/^[a-z]+[a-z0-9]*$/i.test(attr)){
                errors.push({ name: 'Name', msg: 'Не верное название поля'});
            } 
        }
        attr = attrs._Array;
        if(typeof attr !='undefined') {
            if(!(!isArray || (/^\d{1}$/.test(attr) && parseInt(attr)>0 && parseInt(attr)<5))) {
                errors.push({ name: '_Array', msg: 'Укажите размерность 1-4'});
            }
        }        
        return errors.length > 0 ? errors : null ;
    },
    api: 'classfunctionfield'
});
$.extend ( App.getModel('ClassFunctionField'), {
    fieldTypes: App.getModel('ClassField').fieldTypes
});
