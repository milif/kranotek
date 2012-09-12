Ext.define('App.class.view.FunctionsContainer', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.grid.*',
        'Ext.data.*',
        'Ext.dd.*',
        'App.class.model.ClassFunction',
        'App.class.model.ClassFunctionType'
    ],
    constructor: function(config){

        var ClassParamFunctionFields = ['id', 'type', 'name', 'info', 'isArray', 'required', 'qty'];
        Ext.define('App.class.model.ClassParam', {
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
            fields: ['id', 'params'],
            validations:[
            ]
        });
        Ext.define('App.class.model.ClassReturn', {
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
            fields: ['id', 'return'],
            validations:[
            ]
        });
        Ext.define('App.class.model.ClassParamItem', {
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
            fields: ClassParamFunctionFields,
            validations:[
            ]
        });

        var me = this,
            model = App.class.model.ClassFunction,
            modelType = App.class.model.ClassFunctionType,
            functionsStore = model.getStore({
                listeners: {
                    'update': function(me, model){
                    }
                }
            }),
            modelParam = App.class.model.ClassParam,
            modelReturn = App.class.model.ClassReturn,
            modelParamsItem = App.class.model.ClassParamItem,
            saveIfDirty = function(clb, fn) {
                return functionList.saveIfDirty(clb, fn || isDirty);
            },
            clearDirtyData = function() {
                paramsPanel.model && paramsPanel.itemForm.loadRecord(paramsPanel.model);
                returnPanel.model && returnPanel.itemForm.loadRecord(returnPanel.model);
            },
            isDirty = function() {
                if(paramsPanel.orderDirty ||
                    returnPanel.orderDirty ||
                    isFormDirty(functionList.getForm(), ['type', 'name', 'info']) ||
                    isFormDirty(paramsPanel.itemForm, ['type', 'name', 'info', 'isArray', 'required', 'qty']) ||
                    isFormDirty(returnPanel.itemForm, ['type', 'name', 'info', 'isArray', 'required', 'qty'])
                ) {
                    return true;
                }
                return false;
            },
            isFormDirty = function(form, dataFields) {
                if(!form || !dataFields || !dataFields.length) { return; }
                var result = false;
                for(var field in dataFields) {
                    if (dataFields.hasOwnProperty(field)) {
                        var _field = form.findField(dataFields[field]);
                        if(_field && _field.isDirty()) {
                            result = true;
                        }
                    }
                }
                return result;
            },
            updateForm = function(_form, _record) {
                var _fields = _form.getFields();
                _fields.each(function(field){
                    field.suspendEvents();
                });
                _form.reset();
                if(_record) {
                    _form.loadRecord(_record);
                    _form.clearInvalid();
                }
                _fields.each(function(field){
                    field.resumeEvents();
                });
            },
            getGridData = function(store) {
                if(!store) {return;}
                var data = [], fields = [], records = store.getRange();
                for(var i=0; i<records.length; i++) {
                    fields.push(records[i].getData());
                }
                return fields;
            },
            getSelectedIndex = function (grid) {
                var selection = grid.getSelectionModel().getSelection(),
                    record = selection && selection[0],
                    index = grid.getStore().findExact('id', record.get('id'));
                return index;
            },
            getNextSelectionIndex = function(grid, isPrevious) {
                var index = getSelectedIndex(grid),
                    count = grid.getStore().getCount(),
                    nextIndex = isPrevious ? (index - 1) : (index + 1);
                if(nextIndex >= 0 && nextIndex < count) {
                    return nextIndex;
                }
                return -1;
            },
            replaceRecords = function(grid, isPrevious) {
                var index = getSelectedIndex(grid),
                    store = grid.getStore(),
                    nextIndex = getNextSelectionIndex(grid, isPrevious);
                if(nextIndex < 0) { return; }
                var record = store.getAt(index);
                    nextRecord = store.getAt(nextIndex);

                var oldData = {};
                for(var i in ClassParamFunctionFields) {
                    if(ClassParamFunctionFields.hasOwnProperty(i)) {
                        var field = ClassParamFunctionFields[i];
                        oldData[field] = record.get(field);
                    }
                }
                for(var i in ClassParamFunctionFields) {
                    if(ClassParamFunctionFields.hasOwnProperty(i)) {
                        var field = ClassParamFunctionFields[i];
                        record.set(field, nextRecord.get(field));
                    }
                }
                for(var i in ClassParamFunctionFields) {
                    if(ClassParamFunctionFields.hasOwnProperty(i)) {
                        var field = ClassParamFunctionFields[i];
                        nextRecord.set(field, oldData[field]);
                    }
                }
                return true;
            },
            selectNextItemInStore = function(grid, isPrevious) {
                var nextIndex = getNextSelectionIndex(grid, isPrevious);
                var nextRecord = grid.getStore().getAt(nextIndex);
                grid.getSelectionModel().select(nextRecord);
            },
            onGridOrderButtonClick = function(grid, isPrevious) {
                var selection = grid.getSelectionModel().getSelection(),
                    record = selection && selection[0],
                    nextIndex = getNextSelectionIndex(grid, isPrevious);
                if(!record) {return;}
                replaceRecords(grid, isPrevious);
                selectNextItemInStore(grid, isPrevious);
            },
            getGridLayout = function(grid) {
                grid.upButton = Ext.create('Ext.button.Button', {
                    disabled: true,
                    cls: 'app-icon-up',
                    margin: '0 0 5px 0',
                    handler: function() {
                        onGridOrderButtonClick(grid, true);
                    }
                });
                grid.downButton = Ext.create('Ext.button.Button', {
                    disabled: true,
                    cls: 'app-icon-down',
                    handler: function() {
                        onGridOrderButtonClick(grid, false);
                    }
                });
                var declaration = {
                    layout: 'hbox',
                    margin: '10 0',
                    items: [
                        grid,
                        {
                            layout: 'vbox',
                            height: 100,
                            padding: '0 0 0 3px',
                            border: false,
                            items: [
                                { border: false, flex: 1 },
                                grid.upButton,
                                grid.downButton,
                                { border: false, flex: 1 }
                            ]
                        }
                    ]
                };
                grid.on('selectionchange', function(rowModel, record) {
                    var _record = record && record[0];
                    if(_record) {
                        if(getNextSelectionIndex(grid, true) >= 0) {
                            grid.upButton.enable();
                        } else {
                            grid.upButton.disable();
                        }
                        if(getNextSelectionIndex(grid, false) >= 0) {
                            grid.downButton.enable();
                        } else {
                            grid.downButton.disable();
                        }
                    } else {
                        grid.upButton.disable();
                        grid.downButton.disable();
                    }
                });
                return declaration;
            },
            functionListCreate = function() {
                me.model = new model();
                paramsPanel.model = new modelParamsItem();
                returnPanel.model = new modelParamsItem();
                functionList.getForm().loadRecord(me.model);
                functionList.getForm().clearInvalid();
                functionListGrid.getSelectionModel().deselectAll();
                functionList.child('form').show();

                paramsPanel.gridStore.removeAll();
                returnPanel.gridStore.removeAll();
                paramsPanel.panel.getForm().loadRecord(new modelParam());
                returnPanel.panel.getForm().loadRecord(new modelReturn());
                paramsPanel.showForm(false);
                returnPanel.showForm(false);
                paramsPanel.panel.hide();
                returnPanel.panel.hide();
            },
            functionListAddButton = new Ext.button.Button({
                iconCls: 'app-icon-add',
                tooltip: 'Добавить',
                handler: functionListCreate
            }),
            functionListOnChange = function(_record) {
                updateForm(functionList.getForm(), _record);
                paramsPanel.panel.getForm().loadRecord(new modelParam());
                returnPanel.panel.getForm().loadRecord(new modelReturn());
                paramsPanel.grid.getSelectionModel().deselectAll();
                returnPanel.grid.getSelectionModel().deselectAll();
                paramsPanel.gridStore.loadData(_record.get('params'));
                returnPanel.gridStore.loadData(_record.get('return'));
                functionList.child('form').show();
                paramsPanel.showForm(false);
                returnPanel.showForm(false);
                paramsPanel.panel.show();
                returnPanel.panel.show();
            },
            functionListGrid = Ext.create('Ext.grid.Panel', {
                multiSelect: false,
                hideHeaders: true,
                height: 100,
                margin: '10px 0',
                store            : functionsStore,
                columns          : [{ flex: 1, sortable: true, dataIndex: 'name'}],
                stripeRows       : true,
                margins          : '0 2 0 0',
                listeners: {
                    beforeselect: function(rowModel, record, rowIndex) {
                        saveIfDirty(function(ok, m) {
                            if(!ok) {
                                return;
                            }
                            me.model = m;
                            clearDirtyData();
                            functionListGrid.getSelectionModel().select(record);
                        });
                        return !isDirty();
                    },
                    selectionchange: function(rowModel, record) {
                        var _record = record && record[0];
                        if(_record) {
                            me.model = _record;
                            functionListOnChange(_record);
                            functionListRemoveButton.enable();
                        } else {
                            functionList.child('form').hide();
                            paramsPanel.panel.hide();
                            returnPanel.panel.hide();
                            functionListRemoveButton.disable();
                        }
                    }
                }
            }),
            functionListTypeStore = Ext.create('Ext.data.Store', {
                model: modelType,
                _index: 'classes'
            }),
            functionListTypeCombo = Ext.create('widget.combo', {
                emptyText: '',
                forceSelection: true,
                store: functionListTypeStore,
                name: 'type',
                displayField: 'type',
                valueField: 'type'
            }),
            isfunctionListSaveFormOnly = false,
            functionListSaveBt = Ext.create('Ext.Button', {
                anchor: false,
                text: 'Сохранить',
                handler: function() {
                    isfunctionListSaveFormOnly = true;
                    functionList.save();
                }
            }),
            doFullReload = function(ok) {
                if(!ok) {return;}
                me.model = new model();

                functionListTypeStore.load();
                functionList.getForm().loadRecord(me.model);
                functionList.getForm().clearInvalid();

                paramsPanel.panel.getForm().loadRecord(new modelParam());
                paramsPanel.panel.getForm().clearInvalid();

                returnPanel.panel.getForm().loadRecord(new modelReturn());
                returnPanel.panel.getForm().clearInvalid();

                functionsStore.load();
                functionListGrid.getSelectionModel().deselectAll();
            },
            functionListLoad = function() {
                paramsPanel.itemForm = paramsPanel.panel.child('[ref="formPanel"]').child().getForm();
                returnPanel.itemForm = returnPanel.panel.child('[ref="formPanel"]').child().getForm();
                saveIfDirty(doFullReload);
            },
            functionListRemove = function() {
                Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить функцию?', function(btn){
                    if(btn!='yes') return;
                    functionList.delete({
                        success: function(){
                        }
                    });
                });
            },
            functionListRemoveButton = new Ext.button.Button({
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-remove',
                tooltip: 'Удалить',
                handler: functionListRemove
            }),
            onFunctionListSave = function() {
                var form = functionList,
                    sm = functionListGrid.getSelectionModel(),
                    sel = sm.getSelection(),
                    m = form.getForm().getRecord();

                if(!isfunctionListSaveFormOnly) {
                    sm.deselectAll();
                    if(functionListGrid.getStore().indexOf(m)<0) {
                        functionListGrid.getStore().add(m);
                        sm.select(m);
                    }
                }
                form.loadRecord(m);

                if(!isfunctionListSaveFormOnly) {
                    sm.select(m);
                    functionListOnChange(me.model);
                    paramsPanel.orderDirty = false;
                    returnPanel.orderDirty = false;
                }
                functionListGrid.getView().refresh();

                isfunctionListSaveFormOnly = false;
                Ext.MessageBox.alert('Cохранение данных', "Данные успешно сохранены.");
            },
            functionList = Ext.create('App.form.Panel' , {
                trackResetOnLoad: true,
                url: 'classfunctions.update',
                border: false,
                listeners: {
                    'beforesave': function() {
                        var m = this.getForm().getRecord();
                        if(!isfunctionListSaveFormOnly) {
                            var _params = getGridData(paramsPanel.gridStore);
                            m.set('params', _params);
                            var _return = getGridData(returnPanel.gridStore);
                            m.set('return', _return);
                        }
                        me.model = m;
                    },
                    'save': onFunctionListSave
                },
                items: [
                    {
                        xtype: 'panel',
                        border: false,
                        layout: 'hbox',
                        items: [
                            {
                                flex: 1,
                                border: false,
                                style: 'padding-top:4px; font-weight: bold',
                                html: 'Список функций'
                            },
                            functionListAddButton,
                            functionListRemoveButton
                        ]
                    },
                    functionListGrid,
                    {
                        xtype: 'form',
                        hidden: true,
                        border: false,
                        defaults: {
                            anchor: '100%',
                            border: false
                        },
                        items: [
                            {
                                html: 'Тип функции',
                                style: 'padding: 6px 0 3px 0; font-weight: bold'
                            },
                            functionListTypeCombo,
                            {
                                html: 'Название',
                                style: 'padding: 0 0 3px 0; font-weight: bold'
                            },
                            {
                                xtype: 'textfield',
                                name: 'name'
                            },
                            {
                                html: 'Описание',
                                style: 'padding: 0 0 3px 0; font-weight: bold'
                            },
                            {
                                xtype: 'textareafield',
                                name: 'info'
                            },
                            functionListSaveBt
                        ]
                    }
                ]
            }),

            columnPanel = function(options) {
                var that = this;
                var type = options.type;

                this.create = function() {
                    that.model = new modelParamsItem();
                    that.itemForm.loadRecord(that.model);
                    that.itemForm.clearInvalid();
                    that.grid.getSelectionModel().deselectAll();
                    that.panel.show();
                    that.showForm(that.model);
                };
                this.addButton = new Ext.button.Button({
                    iconCls: 'app-icon-add',
                    tooltip: 'Добавить',
                    handler: this.create
                });
                this.remove = function() {
                    Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить параметр?', function(btn){
                        if(btn!='yes') return;
                        var records = that.grid.getSelectionModel().getSelection(),
                            record = records && records[0];
                        if(!record) { return; }
                        that.model = new modelParamsItem();
                        that.gridStore.remove(record);
                        that.panel.save();
                        that.itemForm.loadRecord(that.model);
                        that.itemForm.clearInvalid();
                        that.showForm();
                    });
                };
                this.removeButton = new Ext.button.Button({
                    disabled: true,
                    margin: '0 0 0 5',
                    iconCls: 'app-icon-remove',
                    tooltip: 'Удалить',
                    handler: this.remove
                });
                this.gridStore = Ext.create('Ext.data.Store', {
                    model: modelParamsItem,
                    _index: 'classes'
                });
                this.showForm = function(state) {
                    var items = that.panel.query('[ref="formPanel"]'),
                        formPanel = items && items[0];
                    if(formPanel) {
                        (state) ? formPanel.show() : formPanel.hide();
                    }
                };
                this.orderDirty = false,
                this.itemForm = undefined,
                this.isDirty = function() {
                    return isFormDirty(that.itemForm, ['type', 'name', 'info', 'isArray', 'required', 'qty']);
                };
                this.saveIfDirty = function(clb) {
                    return that.panel.saveIfDirty(clb, that.isDirty);
                };
                this.grid = Ext.create('Ext.grid.Panel', {
                    multiSelect: false,
                    hideHeaders: true,
                    height: 100,
                    flex: 1,
                    viewConfig: {
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            dragGroup: 'GridDDGroup'+type,
                            dropGroup: 'GridDDGroup'+type
                        },
                        listeners: {
                            drop: function(node, data, dropRec, dropPosition) {
                                that.orderDirty = true;
                            }
                        }
                    },
                    store            : that.gridStore,
                    columns          : [{ flex: 1, sortable: true, dataIndex: 'name'}],
                    stripeRows       : true,
                    margins          : '0 2 0 0',
                    listeners: {
                        beforeselect: function(rowModel, record, rowIndex) {
                            that.saveIfDirty(function(ok, m) {
                                if(!ok) {
                                    return;
                                }
                                that.model = m;
                                that.grid.getSelectionModel().select(record);
                            });
                            return !that.isDirty();
                        },
                        selectionchange: function(rowModel, record) {
                            updateForm(that.itemForm, record && record[0]);
                            that.model = record && record[0] || that.model;
                            that.showForm(that.model);
                            if(record && record[0]) {
                                that.removeButton.enable();
                            } else {
                                that.removeButton.disable();
                            }
                        }
                    }
                });
                this.typeCombo = Ext.create('widget.combo', {
                    emptyText: '',
                    forceSelection: true,
                    store: functionListTypeStore,
                    name: 'type',
                    displayField: 'type',
                    valueField: 'type'
                });
                this.isRequiredCheckbox = {
                    xtype: 'checkboxfield',
                    name: 'required',
                    boxLabel: 'Обязательное',
                    inputValue: true,
                    uncheckedValue: false,
                    listeners: {
                        change: function() {}
                    }
                };
                this.isArrayCheckbox = {
                    xtype: 'checkboxfield',
                    name: 'isArray',
                    boxLabel: 'Массив',
                    inputValue: true,
                    uncheckedValue: false,
                    flex: 1,
                    listeners: {
                        change: function() {}
                    }
                };
                this.nameField = {
                    xtype: 'textfield',
                    allowBlank: false,
                    name: 'name'
                };
                this.arrayLenghtField = {
                    xtype: 'numberfield',
                    hideTrigger: true,
                    decimalPrecision: 0,
                    width: 60,
                    name: 'qty'
                };
                this.getForm = function() {
                    return [
                        {
                            layout: 'hbox',
                            padding: '0 0 3px 0',
                            items: [
                                {
                                    html: 'Название',
                                    style: 'padding: 6px 0 0 0; font-weight: bold',
                                    border: false,
                                    flex: 1
                                },
                                that.isRequiredCheckbox
                            ]
                        },
                        that.nameField,
                        {
                            html: 'Тип данных',
                            style: 'padding: 0 0 3px 0; font-weight: bold'
                        },
                        that.typeCombo,
                        {
                            layout: 'hbox',
                            padding: '10px 0',
                            items: [
                                that.isArrayCheckbox,
                                that.arrayLenghtField
                            ]
                        },
                        {
                            html: 'Описание',
                            style: 'padding: 0 0 3px 0; font-weight: bold'
                        },
                        {
                            xtype: 'textareafield',
                            name: 'info'
                        }
                    ];
                },
                this.onSave = function() {
                    var _values = that.itemForm.getValues();
                    var _formRecord = that.itemForm.getRecord();

                    var gridRecordIndex = that.gridStore.findExact('id', _formRecord.get('id'));
                    var gridRecord = that.gridStore.getAt(gridRecordIndex);

                    var updatedRecord = that.panel.getForm().getRecord();
                    that.gridStore.loadData(updatedRecord.get(type));

                    that.grid.getSelectionModel().deselectAll();
                    if(gridRecord) {
                        var newRecordToSelectIndex = that.gridStore.findExact('id', gridRecord.get('id'));
                        if(newRecordToSelectIndex >= 0) {
                            var newRecordToSelect = that.gridStore.getAt(newRecordToSelectIndex);
                            that.grid.getSelectionModel().select(newRecordToSelect);
                        }
                    }

                    that.orderDirty = false;

                    Ext.MessageBox.alert('Cохранение данных', "Данные успешно сохранены.");
                };
                this.saveBt = Ext.create('Ext.Button', {
                    anchor: false,
                    text: 'Сохранить',
                    handler: function() {
                        that.panel.save();
                    }
                });
                this.panel = Ext.create('App.form.Panel' , {
                    trackResetOnLoad: true,
                    border: false,
                    defaults: {
                        anchor: '100%',
                        border: false
                    },
                    hidden: true,
                    listeners: {
                        'beforesave': function() {
                            var m = this.getForm().getRecord();

                            var formValues = that.itemForm.getValues();
                            formValues['id'] = that.itemForm.getRecord().get('id');

                            if(formValues['id']) {
                                var index = that.gridStore.findExact('id', formValues['id']),
                                    record = that.gridStore.getAt(index);
                                if(record) {
                                    for(var i in formValues) {
                                        if(formValues.hasOwnProperty(i)) {
                                            record.set(i, formValues[i]);
                                        }
                                    }
                                }
                            } else {
                                var newRecord = new modelParamsItem(formValues);
                                that.gridStore.add(newRecord);
                            }

                            var _return = getGridData(that.gridStore);
                            m.set('id', me.model.get('id'));
                            m.set(type, _return);
                        },
                        'save': that.onSave
                    },
                    items: [
                        {
                            xtype: 'panel',
                            border: false,
                            layout: 'hbox',
                            items: [
                                {
                                    flex: 1,
                                    border: false,
                                    style: 'padding-top:4px; font-weight: bold',
                                    html: (type == 'params') ? 'Принимает' : 'Возвращяет'
                                },
                                that.addButton,
                                that.removeButton
                            ]
                        },
                        getGridLayout(that.grid),
                        {
                            ref: 'formPanel',
                            hidden: true,
                            items: [
                                {
                                    xtype: 'form',
                                    trackResetOnLoad: true,
                                    border: false,
                                    defaults: {
                                        anchor: '100%',
                                        border: false
                                    },
                                    items: that.getForm()
                                },
                                that.saveBt
                            ]
                        }
                    ]
                });


                return this;
            },
            paramsPanel = new columnPanel({type:'params'}),
            returnPanel = new columnPanel({type:'return'});


        config = Ext.apply({
            border: false,
            items: {
                xtype: 'panel',
                border: false,
                layout: 'hbox',
                defaults: {
                    flex: 1,
                    border: false,
                    padding: 10
                },
                items: [
                    functionList,
                    {
                        items: paramsPanel.panel
                    },
                    {
                        items: returnPanel.panel
                    }
                ]
            },
            listeners: {
                afterrender: functionListLoad
            }
        }, config );

        me.callParent([config]);
    }
});