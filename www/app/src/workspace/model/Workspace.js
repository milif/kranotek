        Ext.define('App.workspace.model.Workspace', {
            extend: 'Ext.data.Model',
            requires: [
                'App.proxy.RPC',
                'App.user.model.User',
                'App.group.model.Group',
                'App.class.model.Class'
            ],
            proxy: {
                type: 'rpc',
                api: {
                    read: 'workspace.get',
                    create: 'workspace.update',
                    update: 'workspace.update',
                    destroy: 'workspace.delete'
                }
            },
            fields: [
                'Name', 'Info', 'MaxShadows', 'access'
            ],
            // hasMany: { model: 'App.user.model.User', name: 'user' },
            // hasMany: { model: 'App.user.model.User', name: 'group' },
            // hasMany: { model: 'App.class.model.Class', name: 'classes' },
            validations:[
            ],
            statics: {
                getStore: function(config){
                    var ds = Ext.create('Ext.data.Store', Ext.apply({
                        model: 'App.workspace.model.Workspace',
                        proxy: {
                           type: 'rpc',
                           url: 'workspace.get'
                        }
                    }, config));
                    return ds;
                }
            }
        });
