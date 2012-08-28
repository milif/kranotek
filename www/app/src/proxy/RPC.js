        Ext.define('App.proxy.RPC', {
            extend: 'Ext.data.proxy.Ajax',
            alias: 'proxy.rpc',
            constructor: function(config){
                var me = this;
                config.reader = {
                    type: 'json',
                    root: 'data',
                };
                
                me.callParent(arguments);
            }            
        });
