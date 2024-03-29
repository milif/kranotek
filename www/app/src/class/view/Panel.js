Ext.define('App.class.view.Panel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'App.class.model.Class',
        'App.class.model.ClassField',
        'App.ui.Hint'
    ],
    constructor: function(config){
    
        var me = this,
            model = App.class.model.Class,
            required = '<span class="app-form-required" data-qtip="Обязательно к заполнению">*</span>',
            fieldTypes = Ext.create('Ext.data.Store', {
                fields: ['value'],
                data : [                
                    {"id": 0, "value":"Integer"},
                    {"id": 1, "value":"Bigint"},
                    {"id": 2, "value":"Smallint"},
                    {"id": 3, "value":"Numeric"},
                    {"id": 4, "value":"Boolean"},
                    {"id": 5, "value":"Timestamp"},
                    {"id": 6, "value":"Text"},
                    {"id": 7, "value":"Subtype"}
                ]
            }), 
            hint = new App.ui.Hint({
                flex: 1,
                margin: '10 0 0 0',
                hidden: true
            }),
            comboBaseStore = model.getStore({
                listeners: {
                    'update': function(me, model){
                        comboBaseClass.setValue(model.get('id'));
                        comboChildClass.getStore().getProxy().setExtraParam("baseclass", model.get('id'));
                        comboChildClass.enable();
                    }
                }
            }),                    
            comboBaseClass = Ext.create('widget.combo', {  
                flex: 1,            
                emptyText: 'Выберите класс...',
                forceSelection: true,
                trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
                trigger2Cls: Ext.baseCSSPrefix + 'form-trigger',
                defaultMargins: { right: 20 },
                onTrigger1Click: function(){
                    saveIfDirty(function(ok){
                        if(!ok) return;
                        comboBaseClass.clearValue();                       
                    });                    
                }, 
                listeners: {
                    'dirtychange': function(me, isDirty){
                        if(!isDirty) {
                            comboChildClass.clearValue();
                            comboChildClass.disable();
                            buttonBaseClassRemove.disable();
                            tabpanel.hide();
                            hint.hide();
                        } else {
                            buttonBaseClassRemove.enable();                        
                        }                        
                    },
                    'beforeselect': function(me, r){
                        return saveIfDirty(function(ok){
                            if(!ok) {
                                return;
                            }

                            me.setValue(r.getId(), false);
                            me.collapse();

                            comboChildClass.enable();
                            comboChildClass.clearValue();
                            comboChildClass.getStore().getProxy().setExtraParam("baseclass", me.getValue());
                            comboChildClass.lastQuery = null;
                            updateTabs( me.getStore().findRecord( 'id', me.getValue()) );
                            buttonBaseClassRemove.enable();  
                        });                                          
                    }
                },                                      
                store: comboBaseStore,
                displayField: 'ClassName',
                valueField: 'id'                        
            }),
            deleteClassButton = Ext.create('Ext.button.Button', { 
                text: 'Удалить', 
                listeners: {
                    'disable': function(){
                        buttonBaseClassRemove.disable();
                        buttonChildClassRemove.disable();
                    }
                },
                handler: function(){
                    deleteClass();                                                           
                }
            }),
            buttonBaseClassAdd = new Ext.button.Button({
                xtype: 'button',
                margin: '0 0 0 5',
                iconCls: 'app-icon-add',
                tooltip: 'Добавить базовый класс',
                handler: function(){
                    saveIfDirty(function(ok){
                        if(!ok) return;
                        comboBaseClass.clearValue();
                        
                        var m = new App.class.model.Class();
                        m.combo = comboBaseClass;
                        updateTabs(m);                      
                    });                                    
                }
            }),  
            buttonBaseClassRemove = new Ext.button.Button({
                xtype: 'button',
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-remove',
                tooltip: 'Удалить базовый класс',
                handler: function(){
                    deleteClass();
                }
            }),                      
            comboChildStore = model.getStore({
                listeners: {
                    'update': function(me, model){
                        comboChildClass.setValue(model.get('id'));
                    }
                }
            }),
            comboChildClass = Ext.create('widget.combo', {
                flex: 1,
                margin: '0 0 0 20',
                emptyText: 'Выберите класс...',
                disabled: true,
                trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
                trigger2Cls: Ext.baseCSSPrefix + 'form-trigger',
                onTrigger1Click: function(){
                    saveIfDirty(function(ok){
                        if(!ok) return;
                        comboChildClass.clearValue();                       
                    });                 
                }, 
                listeners: {
                    'dirtychange': function(me, isDirty){
                        if(!isDirty) {
                            buttonBaseClassRemove.enable();
                            buttonChildClassRemove.disable();
                            updateTabs(comboBaseClass.getStore().findRecord( 'id', comboBaseClass.getValue()));
                        } else {
                            buttonBaseClassRemove.disable();
                            buttonChildClassRemove.enable();
                        }
                    },
                    'beforeselect': function(me, r){
                        return saveIfDirty(function(ok){
                            if(!ok) {
                                return;
                            }
                            me.setValue(r.getId(), false);
                            me.collapse();

                            updateTabs( me.getStore().findRecord( 'id', me.getValue()) );                       
                        });
                    },
                    'disable': function(){
                        toolbarChildClass.disable();
                    },
                    'enable': function(){
                        toolbarChildClass.enable();
                    }                    
                },                                                               
                store: comboChildStore,
                displayField: 'ClassName',
                valueField: 'id'                        
            }),
            buttonChildClassAdd = new Ext.button.Button({
                xtype: 'button',
                margin: '0 0 0 5',
                iconCls: 'app-icon-add',
                tooltip: 'Добавить дочерний класс',
                handler: function(){
                    saveIfDirty(function(ok){
                        if(!ok) return;
                        comboChildClass.clearValue();
                        var m = new App.class.model.Class({'baseclass': comboBaseClass.getValue()});
                        m.baseclass=comboBaseClass.getValue();
                        m.combo = comboChildClass;
                        updateTabs(m);                      
                    });                
                }
            }), 
            buttonChildClassRemove = new Ext.button.Button({
                xtype: 'button',
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-remove',
                tooltip: 'Удалить дочерний класс',
                handler: function(){
                    deleteClass();
                }
            }),            
            toolbarChildClass = new Ext.container.Container({
                layout: 'hbox',
                disabled: true,
                margin: '0 0 0 20',
                componentCls: 'app-masked',
                flex: 1,
                items: [
                    {
                        xtype: 'container',
                        flex: 1,
                        padding: '10 0 0 0',
                        html: '<b>Дочерний класс</b>'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'app-icon-refresh',
                        tooltip: 'Обновить список дочерних классов',
                        handler: function(){
                            comboBaseClass.getStore().reload();
                        }                                    
                    },
                    buttonChildClassAdd,
                    buttonChildClassRemove                              
                ]
            }),
            fieldFieldName = Ext.create('Ext.form.field.Text', {
                name: 'Name',
                fieldLabel: 'Имя',
                afterLabelTextTpl: required,
                allowBlank: false
            });
            fieldClassName = Ext.create('Ext.form.field.Text', {
                name: 'ClassName',
                fieldLabel: 'Название',
                afterLabelTextTpl: required,
                allowBlank: false  
            });         
            fieldTypeCellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 2
            }),
            fieldTypeGridButtonRemove = Ext.create('Ext.button.Button', { 
                xtype: 'button', 
                text: 'Удалить', 
                iconCls: 'app-icon-remove', 
                disabled: true, 
                handler: function(){
                    var sel = fieldTypeGrid.getSelectionModel().getSelection();
                    Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить значение "'+sel[0].get('name')+'"?', function(btn){
                        if(btn=='yes') fieldtypevalues.remove(sel);
                    });                            
                } 
            }),
            fieldtypevalues = Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data : []
            }), 
            gridFieldsDDId = Ext.id(),                   
            fieldTypeGrid = Ext.create('Ext.grid.Panel', {
                xtype: 'grid',
                border: false,
                enableColumnResize: false,
                listeners: {
                    selectionchange: function(c, m){
                        if(m.length>0) fieldTypeGridButtonRemove.enable();
                        else fieldTypeGridButtonRemove.disable();
                    },
                    canceledit: function(editor, e){
                        if(!e.record.get('name')) fieldtypevalues.remove(e.record);
                    }
                },
                tbar: [
                    { xtype: 'button', text: 'Добавить', iconCls: 'app-icon-add', handler: function(){
                        fieldtypevalues.add({
                            name: ''
                        });
                        fieldTypeCellEditing.startEditByPosition(
                            {row: fieldtypevalues.getCount()-1, column: 0}
                        );                              
                    } },
                    fieldTypeGridButtonRemove
                ],
                viewConfig: {
                    plugins: [
                        {
                            id: gridFieldsDDId,
                            ptype: 'gridviewdragdrop'
                        }                                
                    ]
                },
                plugins: [
                    fieldTypeCellEditing
                ],
                store: fieldtypevalues,
                columns: [
                { text: 'Значения',  dataIndex: 'name', flex: 1, menuDisabled: true, sortable: false, editor: { xtype: 'textfield', allowBlank: false } }
                ]                                                           
            }),  
            saveClassButton = Ext.create('Ext.button.Button', {
                text: 'Сохранить', 
                handler: function(){
                    classForm.save();
                }
            }),                         
            classForm = Ext.create('App.form.Panel' , {
                url: 'class.update',
                padding: 10,
                border: false,
                trackResetOnLoad: true,
                dockedItems: [{
                    xtype: 'toolbar',
                    cls: 'app-form-buttons',
                    dock: 'bottom',
                    ui: 'footer',
                    items: [
                        saveClassButton
                    ]
                }],  
                listeners: {
                    'beforesave': function(){
                        var m = this.getForm().getRecord(),
                            records,
                            fields = [];   
                        if(!m.getId() && !m.get('baseclass')) {
                            records = gridFields.getStore().getRange();
                            
                            if(records.length == 0) {
                                Ext.MessageBox.show({
                                    title: 'Не указаны поля',
                                    msg: 'Необходимо добавить поля класса!',
                                    fn: function(){
                                        tabpanel.setActiveTab(1);
                                    },
                                    icon: Ext.MessageBox.ERROR,
                                    buttons: Ext.Msg.OK
                                });
                                return false;
                            }
                            
                            for(var i=0; i<records.length; i++) {
                                fields.push(records[i].getData());
                            }
                            m.set('fields', fields);
                        }
                    },
                    'save': function(){
                        var m = classForm.getForm().getRecord();
                        if(m.combo && m.combo.getStore().indexOf(m)<0) {
                            m.combo.getStore().add(m);
                            m.combo.setValue(m.getId());      
                        }
                        updateTabs( m );                      
                        Ext.MessageBox.alert('Cохранение данных', "Данные о классе успешно сохранены.");
                    }
                },                                         
                items: [
                    fieldClassName,
                    {
                        xtype: 'checkboxfield',
                        name: 'System',
                        disabled: true,
                        fieldLabel: 'Системный'
                    },                                                 
                    {
                        xtype: 'textareafield',
                        name: 'ClassInfo',
                        fieldLabel: 'Описание',
                        allowBlank: true,
                        anchor: '100%'  
                    }                                               
                ]
                                                                                                                                                  
            }),
            gridFields = Ext.create('Ext.grid.Panel', {
                xtype: 'grid',
                width: 150,
                height: '100%',
                enableColumnResize: false,
                viewConfig: {
                    plugins: [
                        {
                            ptype: 'gridviewdragdrop'
                        }                                
                    ]
                },                
                listeners: {
                    'beforeselect': function(c, m){
                        var form = this.up('form');  
                        if(!me.model.getId()) selectField(form, m);
                        else return saveIfDirty(function(ok){
                            if(!ok) return;
                            c.view.getSelectionModel().select(m);
                            selectField(form, m);                          
                        });
                    },
                    'deselect': function(c, m){
                        //this.up('form').updateViewFromModel();
                    }                          
                },
                columns: [
                    { text: 'Список полей',  dataIndex: 'Name', flex: 1, menuDisabled: true }
                ],
                store: App.class.model.ClassField.getStore()
            }),
            commitClassFieldButton = Ext.create('Ext.button.Button', {
                text: 'Применить',
                hidden: true,
                handler: function(){
                    commitFieldOrAdd(this.up('form').getForm());
                }
            }),       
            addNewClassFieldButton = Ext.create('Ext.button.Button', { 
                xtype: 'button',
                margin: '0 0 0 5',
                tooltip: 'Добавить поле',
                iconCls: 'app-icon-add', 
                handler: function(){
                    var b = this;
                    if(!me.model.getId()) addField();
                    else saveIfDirty(function(ok){
                        if(!ok) return;
                        addField();
                    });                                                    
                } 
            }),                 
            addClassFieldButton = Ext.create('Ext.button.Button', {
                text: 'Добавить',
                hidden: true,
                handler: function(){
                    commitFieldOrAdd(this.up('form').getForm());
                }
            }),
            saveClassFieldButton = Ext.create('Ext.button.Button', { 
                text: 'Сохранить', 
                handler: function(){
                    var form = this.up('form'),
                        data = [];
                                                            
                    fieldtypevalues.each(function(){
                        data.push(this.data);
                    });
                                                            
                    form.getForm().getRecord().set('FieldTypeValues', data);
                                                            
                    form.save();                                                                                
                } 
            }),
            refreshClassFieldButton = Ext.create('Ext.button.Button', {
                iconCls: 'app-icon-refresh',
                tooltip: 'Обновить список полей',
                handler: function(){
                    gridFields.getStore().reload();
                }
            }),
            deleteClassFieldButton = Ext.create('Ext.button.Button', { 
                margin: '0 0 0 5',
                disabled: true, 
                tooltip: 'Удалить поле', 
                iconCls: 'app-icon-remove',
                handler: function(){
                    var b = this;
                    if(!me.model.getId()) {
                        var m = b.up('form').getForm().getRecord();
                        m.isDeleted = true;
                        m.store.remove(m);
                        b.up('form').updateViewFromModel();
                        return;
                    }
                    Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить поле?', function(btn){
                        if(btn!='yes') return;
                        b.up('form').delete({
                            success: function(){
                                b.up('form').updateViewFromModel();
                            }
                        });                                
                    });                                                            
                } 
            }),                       
            buttonShowSubtypes = new Ext.button.Button({
                margin: '0 0 0 5',
                text: 'Указать подтипы',
                hidden: true,
                handler: function(){
                    if(!this.windowTypes) {
                        this.windowTypes = new Ext.window.Window({
                            title: 'Список подтипов',
                            width: 200,
                            height: 400,
                            closeAction: 'hide',
                            layout: 'fit',
                            resizable: false,
                            modal: true,
                            items: [
                                fieldTypeGrid
                            ]
                        });
                    }
                    this.windowTypes.show();
                }
            }),
            fieldForm = Ext.create('Ext.panel.Panel', {
               margin: '0 0 0 20',
               border: false,
               layout: 'anchor',
               dockedItems: [                                                                    
                   {
                       xtype: 'toolbar',
                       cls: 'app-form-buttons',
                       dock: 'bottom',
                       ui: 'footer',
                       items: [
                           addClassFieldButton,
                           commitClassFieldButton,
                           saveClassFieldButton
                       ]
                    }
                ],                                                                     
                flex: 1,
                items: [
                    fieldFieldName,
                    {
                        xtype: 'textareafield',
                        name: 'Info',
                        fieldLabel: 'Описание',
                        allowBlank: true,
                        anchor: '100%'
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'combo',
                                name: 'FieldType',
                                fieldLabel: 'Тип поля',
                                emptyText: 'Выберете тип...',
                                afterLabelTextTpl: required,
                                allowBlank: false,
                                store: fieldTypes,
                                editable: false,
                                queryMode: 'local',
                                displayField: 'value',
                                valueField: 'id',
                                listeners: {
                                    change: function(){
                                        if(this.getValue()=='7') buttonShowSubtypes.show();
                                        else buttonShowSubtypes.hide();
                                    }
                                }
                            }, 
                            buttonShowSubtypes                                                   
                        ]
                    },                                         
                    {
                        xtype: 'textfield',
                        name: 'DefaultValue',
                        fieldLabel: 'Значение по умолчанию',
                        allowBlank: true
                    },
                    {
                        xtype: 'checkboxfield',
                        name: 'NotNull',
                        fieldLabel: 'Обязательное'
                    },                                                                                                                                                
                    {
                        xtype: 'checkboxfield',
                        name: 'System',
                        disabled: true,
                        fieldLabel: 'Системное'
                    },
                    {
                        xtype: 'checkboxfield',
                        name: 'ForbidDuplicates',
                        fieldLabel: 'Уникальное'
                    },
                    {
                        xtype: 'checkboxfield',
                        name: 'External',
                        disabled: true,
                        fieldLabel: 'Внешнее'
                    }                                                                                                                                                                                                                                                                                                                                                                                                                                            
                ]                                                          
            }),            
            tabpanel = Ext.create('Ext.tab.Panel', {
                margin: '10 0 0 0',
                hidden: true,
                plain: true,
                listeners: {
                    'beforetabchange': function(p, t){
                        if(tabpanel.isHidden() || !me.model.getId()) return;
                        var f = saveIfDirty(function(ok){
                            if(!ok) {
                                return;     
                            }
                            tabpanel.setActiveTab(t, false);   
                        });
                        return f;
                    }
                },
                items: [
                    {
                        title: 'Свойства',
                        items: [
                            classForm
                        ]
                    },
                    {
                        title: 'Поля',
                        listeners: {
                            'activate': function(){
                                if( this.isFieldsLoaded || !me.model || !me.model.getId() ) {
                                    deleteClassFieldButton.up('form').updateViewFromModel(gridFields.view.getSelectionModel().hasSelection()); 
                                    return;
                                }
                                var tab = this,
                                    isForm = true;
                                tab.setLoading(true);
                                gridFields.getStore().getProxy().setExtraParam('classId', me.model.getId());
                                gridFields.getStore().load(function(){
                                    tab.isFieldsLoaded = true;
                                    var m = this.getAt(0),
                                        form = tab.down('form');
                                    if(m) { 
                                        form.getForm().loadRecord(m); 
                                        gridFields.getSelectionModel().select(m);                                               
                                    } else {
                                        isForm = false;
                                    }
                                    tab.setLoading(false);
                                    deleteClassFieldButton.up('form').updateViewFromModel(isForm);
                                });
                            }
                        },
                        items: [
                            {
                                xtype: 'form',
                                border: false,
                                trackResetOnLoad: true,
                                padding: 10,
                                updateViewFromModel: function(isForm){
                                    
                                    var form = this.getForm(),
                                        m = form.getRecord(),
                                        dd = gridFields.getView().plugins[0];
                                        
                                    this.isNewClass = !me.model.getId();
                                    
                                    deleteClassFieldButton.enable();
                                    addClassFieldButton.hide();
                                    commitClassFieldButton.hide();
                                    saveClassFieldButton.show();
                                    refreshClassFieldButton.enable();
                                    
                                    if(!m.getId() || m.get('External')) {
                                        fieldFieldName.enable();
                                    } else {
                                        fieldFieldName.disable();
                                    }
                                    
                                    if(this.isNewClass) {
                                        dd.enable();
                                        saveClassFieldButton.hide();
                                        refreshClassFieldButton.disable();           
                                        if(m && m.store) {
                                            commitClassFieldButton.show();
                                        } else {
                                            addClassFieldButton.show();
                                        }
                                    } else {
                                        dd.disable();
                                    }
                                    
                                    if(!m || !m.store) {
                                        deleteClassFieldButton.disable();
                                    } 
                                    
                                    if( isForm ) {
                                        fieldForm.show();
                                    } else {
                                        fieldForm.hide();
                                    }
                                    
                                    form.clearInvalid();                              
                                      
                                },                                
                                setNewModel: function(){
                                    var m = new App.class.model.ClassField({'classId': me.model.getId()}),
                                        f = this.getForm();
                                    fieldtypevalues.loadData(m.get('FieldTypeValues'));                                    
                                    f.loadRecord(m);
                                    f.clearInvalid();  
                                    gridFields.getSelectionModel().deselectAll(); 
                                    this.updateViewFromModel(true);
                                },                                                    
                                layout: {
                                    type: 'hbox'
                                },
                                listeners: {
                                    'save': function(){
                                        var form = this,
                                            sm = gridFields.getSelectionModel(),
                                            sel = sm.getSelection(),
                                            m = form.getForm().getRecord(),
                                            isForm = true;
                                                                                    
                                        sm.deselectAll();
                                                                               
                                        if(gridFields.getStore().indexOf(m)<0) {
                                            gridFields.getStore().add(m);
                                            isForm = false;
                                        } else {
                                            sm.select(m);
                                        }
                                        if(m.get('FieldTypeValues')) fieldtypevalues.loadData(m.get('FieldTypeValues'));
                                        form.loadRecord(m);
                                        form.updateViewFromModel(isForm);
                                        Ext.MessageBox.alert('Cохранение данных', "Данные о поле успешно сохранены.");  
                                    }
                                },
                                items: [
                                    { 
                                        xtype: 'container',
                                        width: 150,
                                        items: [
                                            { 
                                                xtype: 'container',
                                                layout: {
                                                    type: 'hbox',
                                                    pack: 'end'
                                                },
                                                margin: '0 0 5 0',
                                                items: [                                                
                                                    refreshClassFieldButton,
                                                    addNewClassFieldButton,
                                                    deleteClassFieldButton
                                                ]
                                            },
                                            gridFields                         
                                        ]
                                    },                                
                                    fieldForm
                                ]                                                
                            }                                               
                        ]                                            
                    }
                ]
            }                            
        );
        
        function selectField(form, m){
            
            fieldtypevalues.loadData(m.get('FieldTypeValues') );
            form.getForm().loadRecord(m);
                            
            form.updateViewFromModel(true);      
        }        
        function addField(){
            fieldForm.show();
            tabpanel.getActiveTab().down('form').setNewModel();        
        }
        function saveIfDirty(clb){
            if( tabpanel.isHidden() ) {
                clb(true);
                return true;  
            } else {
                if(!me.model.getId()) {
                    return classForm.saveIfDirty(clb);
                } else return tabpanel.getActiveTab().down('form').saveIfDirty(clb);
            }
        };                        
        function deleteClass() {
            Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить класс?', function(btn){
                if(btn!='yes') return;
                classForm.delete({
                    success: function(){
                        var m = classForm.getForm().getRecord();
                        if(comboChildClass.getValue() == m.get('id')) comboChildClass.clearValue();
                        else comboBaseClass.clearValue(); 
                    }
                });
            });         
        }
        function commitFieldOrAdd(form) {
            var m = form.getRecord(),
                data = [];
                                                            
            fieldtypevalues.each(function(){
                data.push(this.data);
            });
                  
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
             form.getRecord().set('FieldTypeValues', data);                                
             m.commit();  
             
             gridFields.getSelectionModel().deselectAll();
               
             if(gridFields.getStore().indexOf(m)<0) {
                gridFields.getStore().add(m);
                fieldForm.hide();
             } else {
                gridFields.getSelectionModel().select(m);
             }
             form.loadRecord(m);            
        }
        function updateTabs(model) {
            if(!model) return;
            tabpanel.setActiveTab(0);
            tabpanel.items.getAt(1).isFieldsLoaded = false;
            me.model = model;
            tabpanel.items.getAt(1).enable();
            if(!model.getId()) {
                fieldClassName.enable();
                gridFields.getStore().removeAll();
                //deleteClassFieldButton.up('form').setNewModel();
                var m = fieldForm.up('form').getForm().getRecord();
                if(m) m.isDeleted = true;
                tabpanel.items.getAt(1).isFieldsLoaded = true;
                
                deleteClassButton.disable();
                hint
                    .setTitle('Создание класса.')
                    .setText('Укажите название класса, добавьте описание и поля');
                hint.show();
                
                if(model.get('baseclass')) tabpanel.items.getAt(1).disable();
                //saveClassButton.setText('Добавить');
            } else {
                fieldClassName.disable();
                hint.hide();
                //saveClassButton.setText('Сохранить');
                deleteClassButton.enable();                        
            }
            tabpanel.show();
            classForm.getForm().loadRecord(model);
            classForm.getForm().clearInvalid();                    
        }

        config = Ext.apply({
            border: false,
            minWidth: 600,
            items: [
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    margin: '0 0 5 0',
                    items: [
                        { 
                            xtype: 'container',
                            layout: 'hbox',
                            flex: 1,
                            items: [
                                {
                                    flex: 1,
                                    padding: '10 0 0 0',
                                    xtype: 'container',
                                    html: '<b>Базовый класс</b>'
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'app-icon-refresh',
                                    tooltip: 'Обновить список базовых классов',
                                    handler: function(){
                                        comboBaseClass.getStore().reload();
                                    }
                                },
                                buttonBaseClassAdd,
                                buttonBaseClassRemove                               
                            ]
                        },
                        toolbarChildClass                                                                             
                    ]
                },            
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [ 
                        comboBaseClass,                        
                        comboChildClass                                                           
                    ]
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [
                        hint
                    ]                   
                },
                tabpanel

            ]
        }                    
        , config );
        
        me.callParent([config]);
    }
}); 
