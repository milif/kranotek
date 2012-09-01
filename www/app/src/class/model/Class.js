        Ext.define('App.class.model.Class', {
            extend: 'Ext.data.Model',
            requires: [
                'App.proxy.RPC'
            ],
            proxy: {
                type: 'rpc',
                api: {
                    read: 'class.get',
                    create: 'class.update',
                    update: 'class.update',
                    destroy: 'class.delete'
                }
            },
            fields: [
                'ClassName', 'ClassInfo', 'System', 'baseclass', 'fields', 'create', 'read', 'rights', 'update', 'write', 'groupRights'
            ],
            validations:[
                {type: 'length',    field: 'ClassName',     min: 2}
            ],
            statics: {
                getStore: function(config){
                    var ds = Ext.create('Ext.data.Store', Ext.apply({
                        model: 'App.class.model.Class',
                        proxy: {
                           type: 'rpc',
                           url: 'class.get'
                        }
                    }, config));
                    return ds;
                }
            }
        });
