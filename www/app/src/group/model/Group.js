        Ext.define('App.group.model.Group', {
            extend: 'Ext.data.Model',
            requires: [
                'App.proxy.RPC'
            ],
            proxy: {
                type: 'rpc',
                api: {
                    read: 'user.get'
                }
            },
            fields: [
                'Name', 'create', 'read', 'rights', 'update', 'write'
            ],
            validations:[
            ],
            statics: {
                getStore: function(config){
                    var ds = Ext.create('Ext.data.Store', Ext.apply({
                        model: 'App.group.model.Group',
                        proxy: {
                           type: 'rpc',
                           url: 'user.get'
                        }
                    }, config));
                    return ds;
                }
            }
        });
