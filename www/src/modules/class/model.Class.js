/*
 * @id 507c05915399e - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require modules/class/model.ClassField.js
 * @require modules/class/collection.ClassField.js  
 * @require modules/class/collection.ClassFunction.js  
 */
App.defineModel('Class', {
    defaults: {
        'ClassName': '',
        'ClassInfo': '',
        'System': false,
        'AllWorkspace': false,
        'WorkspaceId': ""
    },
    getCollectionFields: function(){
        return new (App.getCollection('ClassField'))(null, {
            local: !this.id,
            params: {
                'ClassId': this.id
            }
        });
    },
    getCollectionFunctions: function(){
        return this.id ? new (App.getCollection('ClassFunction'))(null, {
            params: {
                'ClassId': this.id
            }
        }) : null;    
    },
    validateModel: function(attrs){
        var errors = [],
            attr;
        
        attr = attrs.ClassName;
        if(typeof attr !='undefined') {
            if(attr.length < 4) {
                errors.push({ name: 'ClassName', msg: 'Название 4 и более символов'});
            } else if(!/^[a-z]+[a-z0-9]*$/i.test(attr)){
                errors.push({ name: 'ClassName', msg: 'Не верное назнвание класса'});
            }
        }
        attr = attrs.ClassInfo;
        if(typeof attr !='undefined') {
            if(attr.length == 0 ) {     
                errors.push({ name: 'ClassInfo', msg: 'Обязательно к заполнению'});         
            }
        }            
        return errors.length > 0 ? errors : null ;
    },     
    api: 'class'      
});
$.extend(App.getModel('Class'), {
    getModelClassField: function(){
        return App.getModel('ClassField');
    }
});

