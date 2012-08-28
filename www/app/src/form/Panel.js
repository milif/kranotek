        Ext.define('App.form.Panel', {
            extend: 'Ext.form.Panel',
            requires: [
                'Ext.data.Store'
            ],
            xtype: 'form',
            save: function(options){
                var me = this,
                    form = this.getForm();
                if(!form.isValid()) return;
                form.updateRecord();
                var errors = form.getRecord().validate();
                if(!errors.isValid()) {
                    var errs = [];
                    errors.each(function(item){
                        errs.push({id: item.field, msg: item.message});
                    });
                    form.markInvalid(errs);
                    form.getRecord().reject();
                    return;
                }
                                                                                                                                           
                this.setLoading("Сохранение...");
                form.getRecord().save({
                    success: function(m,b){
                        var r = b.request.proxy.getReader(),
                            mr = r.readRecords(r.rawData),
                            md = mr.records && mr.records[0] ? mr.records[0].getData() : null ;
                        if(md) for(var p in md) {
                            if( md[p] != undefined ) m.set(p, md[p]);
                        }
                        if(options.success) options.success.call(this);
                    },
                    failure: function(a,b,c){
                        var res = b.request.proxy.getReader().rawData;
                        form.markInvalid(res.errors);
                        form.getRecord().reject();
                    },
                    callback: function(){
                        me.setLoading(false);
                    }
                });                        
            },
            delete: function(options){
                var me = this,
                    m = this.getForm().getRecord();

                this.setLoading("Удаление...");
                m.destroy({
                    success: function(){
                        var stores = [].concat(this.stores);
                        for(var i=0; i<stores.length; i++) {
                            stores[i].remove(this);
                        }
                        if(options.success) options.success.call(this);
                    },
                    callback: function(){
                        me.setLoading(false);
                    }
                });            
            }            
        });
