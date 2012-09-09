Ext.define('App.class.model.ClassFunctionType', {
    extend: 'Ext.data.Model',
    requires: [
        'App.proxy.RPC'
    ],
    proxy: {
        type: 'rpc',
        api: {
            read: 'classfunctionstype.get'
        }
    },
    fields: [
        'type'
    ],
    validations:[
    ],
    statics: {
        getStore: function(config){
            var ds = Ext.create('Ext.data.Store', Ext.apply({
                model: 'App.class.model.ClassFunction',
                proxy: {
                   type: 'rpc',
                   url: 'classfunctionstype.get'
                }
            }, config));
            return ds;
        }
    }
});
