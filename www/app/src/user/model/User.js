        Ext.define('App.user.model.User', {
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
                'Username', 'create', 'read', 'rights', 'update', 'write', 'delete', 'groupRights'
            ],
            validations:[
            ],
            statics: {
                getStore: function(config){
                    var ds = Ext.create('Ext.data.Store', Ext.apply({
                        model: 'App.user.model.User',
                        proxy: {
                           type: 'rpc',
                           url: 'user.get'
                        }
                    }, config));
                    return ds;
                }
            }
        });
