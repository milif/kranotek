        Ext.define('App.group.model.Group', {
            extend: 'Ext.data.Model',
            requires: [
                'App.proxy.RPC'
            ],
            proxy: {
                type: 'rpc',
                api: {
                    read: 'group.get'
                }
            },
            fields: [
                'Name', 'create', 'read', 'rights', 'update', 'write', 'delete'
            ],
            validations:[
            ],
            statics: {
                getStore: function(config){
                    var ds = Ext.create('Ext.data.Store', Ext.apply({
                        model: 'App.group.model.Group',
                        proxy: {
                           type: 'rpc',
                           url: 'group.get'
                        }
                    }, config));
                    return ds;
                }
            }
        });
