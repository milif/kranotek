        Ext.define('App.form.Panel', {
            extend: 'Ext.form.Panel',
            requires: [
                'Ext.data.Store'
            ],
            xtype: 'form',
            saveIfDirty: function(clb, fnValidation){
                if(this.inSaveIfDirty || this.inSave) return true;
                this.inSaveIfDirty = true;
                var me = this,
                    f = this.getForm(),
                    m = f.getRecord();
                if(fnValidation ? fnValidation() : f.isDirty()) {
                    Ext.MessageBox.show({
                       title: 'Сохранить изменения?',
                       msg: 'Данные формы изменены, хотите их сохранить?',
                       buttons: Ext.MessageBox.YESNOCANCEL,
                       fn: function(v){
                            if(v=='yes') {
                                var ok = false;
                                me.inSaveIfDirty = true;
                                me.save({
                                    success: function(){
                                       ok = true;
                                    },
                                    callback: function(){
                                        clb(ok, m);
                                        me.inSaveIfDirty = false;
                                    }
                                });
                                return;
                            } else if(v == 'no') {
                                f.loadRecord(m);
                                clb(true, m);
                            } else {
                                clb(false, m);
                            }
                            me.inSaveIfDirty = false;
                       },
                       icon: Ext.MessageBox.QUESTION
                    });
                } else {
                    clb(true, m);
                    this.inSaveIfDirty = false;
                }
                return false;
            },
            save: function(options){
                if(this.inSave) return;
                this.inSave = true;
                var me = this,
                    form = this.getForm();
                if(!options) options ={};
                if(!form.isValid()) {
                    if(options.callback) options.callback.call(this);
                    this.inSave = false;
                    return;
                }
                form.updateRecord();
                var errors = form.getRecord().validate();
                if(!errors.isValid()) {
                    var errs = [];
                    errors.each(function(item){
                        errs.push({id: item.field, msg: item.message});
                    });
                    form.markInvalid(errs);
                    form.getRecord().reject();
                    if(options.callback) options.callback.call(this);
                    this.inSave = false;
                    return;
                }

                if(!this.fireEvent('beforesave')) {
                    if(options.callback) options.callback.call(this);
                    this.inSave = false;
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
                        me.fireEvent('save');
                        if(options.success) options.success.call(this);
                    },
                    failure: function(a,b,c){
                        var res = b.request.proxy.getReader().rawData;
                   
                        if(res && !b.error) {
                            form.markInvalid(res.errors);
                            form.getRecord().reject();
                        }
                    },
                    callback: function(){
                        if(options.callback) options.callback.call(this);
                        me.setLoading(false);
                        me.inSave = false;
                    }
                });
            },
            delete: function(options){
                var me = this,
                    f = this.getForm(),
                    m = f.getRecord();

                this.setLoading("Удаление...");
                m.destroy({
                    success: function(){
                        var stores = [].concat(this.stores);
                        for(var i=0; i<stores.length; i++) {
                            stores[i].remove(this);
                        }
                        m.isDeleted = true;
                        if(options.success) options.success.call(this);
                    },
                    failure: function(a,b,c){

                    },                    
                    callback: function(){
                        me.setLoading(false);
                        if(options.callback) options.callback.call(this);
                    }
                });
            }
        });
