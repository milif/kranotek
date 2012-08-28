        Ext.define('App.class.model.ClassField', {
            extend: 'Ext.data.Model',
            proxy: {
                type: 'rpc',
                api: {
                    read: 'classfield.get',
                    create: 'classfield.update',
                    update: 'classfield.update',
                    destroy: 'classfield.delete'
                }
            },              
            fields: [
                'classId', 'Name', 'Info', 'DefaultValue', 'FieldType', {name: 'FieldTypeValues', defaultValue: []}, 'NotNull', 'ForbidDuplicates', 'System', 'External'
            ],
            validations:[
                {type: 'length',    field: 'Name',     min: 2}
            ],                        
            statics: {
                getStore: function(config){
                    var ds = Ext.create('Ext.data.Store', Ext.apply({
                        model: 'App.class.model.ClassField',
                        proxy: {
                           type: 'rpc',
                           url: 'classfield.get'
                        }                 
                    }, config));
                    return ds;   
                }            
            }
        }); 
