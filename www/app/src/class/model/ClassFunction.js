Ext.define('App.class.model.ClassFunction', {
    extend: 'Ext.data.Model',
    requires: [
        'App.proxy.RPC'
    ],
    proxy: {
        type: 'rpc',
        api: {
            read: 'classfunctions.get',
            create: 'classfunctions.update',
            update: 'classfunctions.update',
            destroy: 'classfunctions.delete'
        }
    },
    fields: [
        'id', 'type', 'name', 'info', 'params', 'return'
    ],
    validations:[
        {type: 'length', field: 'name', min: 3}
    ],
    statics: {
        getStore: function(config){
            var ds = Ext.create('Ext.data.Store', Ext.apply({
                model: 'App.class.model.ClassFunction',
                proxy: {
                   type: 'rpc',
                   url: 'classfunctions.get'
                }
            }, config));
            return ds;
        }
    }
});
