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
                me.modelParams && functionParamsItemForm.loadRecord(me.modelParams);
                me.modelReturn && functionReturnItemForm.loadRecord(me.modelReturn);
            },
            isDirty = function() {
                if(functionParamsOrderDirty ||
                    functionReturnOrderDirty ||
                    isFormDirty(functionList.getForm(), ['type', 'name', 'info']) ||
                    isFormDirty(functionParamsItemForm, ['type', 'name', 'info', 'isArray', 'required', 'qty']) ||
                    isFormDirty(functionReturnItemForm, ['type', 'name', 'info', 'isArray', 'required', 'qty'])
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
                me.modelParams = new modelParamsItem();
                me.modelReturn = new modelParamsItem();
                functionList.getForm().loadRecord(me.model);
                functionList.getForm().clearInvalid();
                functionListGrid.getSelectionModel().deselectAll();
                functionList.child('form').show();

                functionParamsGridStore.removeAll();
                functionReturnGridStore.removeAll();
                functionParams.getForm().loadRecord(new modelParam());
                functionReturn.getForm().loadRecord(new modelReturn());
                functionParamsShowForm(false);
                functionReturnShowForm(false);
                functionParams.show();
                functionReturn.show();
            },
            functionListAddButton = new Ext.button.Button({
                iconCls: 'app-icon-add',
                tooltip: 'Добавить',
                handler: functionListCreate
            }),
            functionListOnChange = function(_record) {
                updateForm(functionList.getForm(), _record);
                functionParams.getForm().loadRecord(new modelParam());
                functionReturn.getForm().loadRecord(new modelReturn());
                functionParamsGrid.getSelectionModel().deselectAll();
                functionReturnGrid.getSelectionModel().deselectAll();
                functionParamsGridStore.loadData(_record.get('params'));
                functionReturnGridStore.loadData(_record.get('return'));
                functionList.child('form').show();
                functionParamsShowForm(false);
                functionReturnShowForm(false);
                functionParams.show();
                functionReturn.show();
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
                            functionParams.hide();
                            functionReturn.hide();
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
            functionListSaveBt = Ext.create('Ext.Button', {
                anchor: false,
                text: 'Сохранить',
                handler: function() {
                    functionList.save();
                }
            }),
            doFullReload = function(ok) {
                if(!ok) {return;}
                me.model = new model();

                functionListTypeStore.load();
                functionList.getForm().loadRecord(me.model);
                functionList.getForm().clearInvalid();

                functionParams.getForm().loadRecord(new modelParam());
                functionParams.getForm().clearInvalid();

                functionReturn.getForm().loadRecord(new modelReturn());
                functionReturn.getForm().clearInvalid();

                functionsStore.load();
                functionListGrid.getSelectionModel().deselectAll();
            },
            functionListLoad = function() {
                functionParamsItemForm = functionParams.child('[ref="formPanel"]').child().getForm();
                functionReturnItemForm = functionReturn.child('[ref="formPanel"]').child().getForm();
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

                sm.deselectAll();

                if(functionListGrid.getStore().indexOf(m)<0) {
                    functionListGrid.getStore().add(m);
                    sm.select(m);
                }
                form.loadRecord(m);
                sm.select(m);


                functionListOnChange(me.model);
                functionListGrid.getView().refresh();

                functionParamsOrderDirty = false;
                functionReturnOrderDirty = false;

                Ext.MessageBox.alert('Cохранение данных', "Данные успешно сохранены.");
            },
            functionList = Ext.create('App.form.Panel' , {
                trackResetOnLoad: true,
                url: 'classfunctions.update',
                border: false,
                listeners: {
                    'beforesave': function() {
                        var m = this.getForm().getRecord();
                        var _params = getGridData(functionParamsGridStore);
                        m.set('params', _params);
                        var _return = getGridData(functionReturnGridStore);
                        m.set('return', _return);
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

            functionParamsCreate = function() {
                me.modelParams = new modelParamsItem();
                functionParamsItemForm.loadRecord(me.modelParams);
                functionParamsItemForm.clearInvalid();
                functionParamsGrid.getSelectionModel().deselectAll();
                functionParams.show();
                functionParamsShowForm(me.modelParams);
            },
            functionParamsAddButton = new Ext.button.Button({
                iconCls: 'app-icon-add',
                tooltip: 'Добавить',
                handler: functionParamsCreate
            }),
            functionParamsRemove = function() {
                Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить параметр?', function(btn){
                    if(btn!='yes') return;
                    var records = functionParamsGrid.getSelectionModel().getSelection(),
                        record = records && records[0];
                    if(!record) { return; }
                    me.modelParams = new modelParamsItem();
                    functionParamsGridStore.remove(record);
                    functionParams.save();
                    functionParamsItemForm.loadRecord(me.modelParams);
                    functionParamsItemForm.clearInvalid();
                    functionParamsShowForm();
                });
            },
            functionParamsRemoveButton = new Ext.button.Button({
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-remove',
                tooltip: 'Удалить',
                handler: functionParamsRemove
            }),
            functionParamsGridStore = Ext.create('Ext.data.Store', {
                model: modelParamsItem,
                _index: 'classes'
            }),
            functionParamsShowForm = function(state) {
                var items = functionParams.query('[ref="formPanel"]'),
                    formPanel = items && items[0];
                if(formPanel) {
                    (state) ? formPanel.show() : formPanel.hide();
                }
            },
            functionParamsOrderDirty = false,
            isDirtyFunctionParams = function() {
                return isFormDirty(functionParamsItemForm, ['type', 'name', 'info', 'isArray', 'required', 'qty']);
            },
            saveFunctionParamsIfDirty = function(clb) {
                return functionParams.saveIfDirty(clb, isDirtyFunctionParams);
            },
            functionParamsGrid = Ext.create('Ext.grid.Panel', {
                multiSelect: false,
                hideHeaders: true,
                height: 100,
                flex: 1,
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragGroup: 'functionParamsGridDDGroup',
                        dropGroup: 'functionParamsGridDDGroup'
                    },
                    listeners: {
                        drop: function(node, data, dropRec, dropPosition) {
                            functionParamsOrderDirty = true;
                        }
                    }
                },
                store            : functionParamsGridStore,
                columns          : [{ flex: 1, sortable: true, dataIndex: 'name'}],
                stripeRows       : true,
                margins          : '0 2 0 0',
                listeners: {
                    beforeselect: function(rowModel, record, rowIndex) {
                        saveFunctionParamsIfDirty(function(ok, m) {
                            if(!ok) {
                                return;
                            }
                            me.modelParams = m;
                            functionParamsGrid.getSelectionModel().select(record);
                        });
                        return !isDirtyFunctionParams();
                    },
                    selectionchange: function(rowModel, record) {
                        updateForm(functionParamsItemForm, record && record[0]);
                        me.modelParams = record && record[0] || me.modelParams;
                        functionParamsShowForm(me.modelParams);
                        if(record && record[0]) {
                            functionParamsRemoveButton.enable();
                        } else {
                            functionParamsRemoveButton.disable();
                        }
                    }
                }
            }),
            functionParamsTypeCombo = Ext.create('widget.combo', {
                emptyText: '',
                forceSelection: true,
                store: functionListTypeStore,
                name: 'type',
                displayField: 'type',
                valueField: 'type'
            }),
            functionParamsSaveBt = Ext.create('Ext.Button', {
                anchor: false,
                text: 'Сохранить',
                handler: function() {
                    functionParams.save();
                }
            }),
            isRequiredCheckbox = {
                xtype: 'checkboxfield',
                name: 'required',
                boxLabel: 'Обязательное',
                inputValue: true,
                uncheckedValue: false,
                listeners: {
                    change: function() {}
                }
            },
            isArrayCheckbox = {
                xtype: 'checkboxfield',
                name: 'isArray',
                boxLabel: 'Массив',
                inputValue: true,
                uncheckedValue: false,
                flex: 1,
                listeners: {
                    change: function() {}
                }
            },
            nameField = {
                xtype: 'textfield',
                allowBlank: false,
                name: 'name'
            },
            arrayLenghtField = {
                xtype: 'numberfield',
                hideTrigger: true,
                decimalPrecision: 0,
                width: 60,
                name: 'qty'
            },
            getParamsForm = function(type) {
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
                            isRequiredCheckbox
                        ]
                    },
                    nameField,
                    {
                        html: 'Тип данных',
                        style: 'padding: 0 0 3px 0; font-weight: bold'
                    },
                    (type == 'params') ? functionParamsTypeCombo : functionReturnTypeCombo,
                    {
                        layout: 'hbox',
                        padding: '10px 0',
                        items: [
                            isArrayCheckbox,
                            arrayLenghtField
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
            onFunctionParamsSave = function() {
                var _values = functionParamsItemForm.getValues();
                var _formRecord = functionParamsItemForm.getRecord();

                var gridRecordIndex = functionParamsGridStore.findExact('id', _formRecord.get('id'));
                var gridRecord = functionParamsGridStore.getAt(gridRecordIndex);

                var updatedRecord = functionParams.getForm().getRecord();
                functionParamsGridStore.loadData(updatedRecord.get('params'));

                if(gridRecord) {
                    functionParamsGrid.getSelectionModel().deselectAll();
                    var newRecordToSelectIndex = functionParamsGridStore.findExact('id', gridRecord.get('id'));
                    if(newRecordToSelectIndex >= 0) {
                        var newRecordToSelect = functionParamsGridStore.getAt(newRecordToSelectIndex);
                        functionParamsGrid.getSelectionModel().select(newRecordToSelect);
                    }
                }

                functionParamsOrderDirty = false;

                Ext.MessageBox.alert('Cохранение данных', "Данные успешно сохранены.");
            },
            functionParamsItemForm = undefined,
            functionParams = Ext.create('App.form.Panel' , {
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

                        var formValues = functionParamsItemForm.getValues();
                        formValues['id'] = functionParamsItemForm.getRecord().get('id');

                        if(formValues['id']) {
                            var index = functionParamsGridStore.findExact('id', formValues['id']),
                                record = functionParamsGridStore.getAt(index);
                            if(record) {
                                for(var i in formValues) {
                                    if(formValues.hasOwnProperty(i)) {
                                        record.set(i, formValues[i]);
                                    }
                                }
                            }
                        } else {
                            var newRecord = new modelParamsItem(formValues);
                            functionParamsGridStore.add(newRecord);
                        }

                        var _params = getGridData(functionParamsGridStore);
                        m.set('id', me.model.get('id'));
                        m.set('params', _params);
                    },
                    'save': onFunctionParamsSave
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
                                html: 'Получает'
                            },
                            functionParamsAddButton,
                            functionParamsRemoveButton
                        ]
                    },
                    getGridLayout(functionParamsGrid),
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
                                items: getParamsForm('params')
                            },
                            functionParamsSaveBt
                        ]
                    }
                ]
            }),
            functionReturnCreate = function() {
                me.modelReturn = new modelParamsItem();
                functionReturnItemForm.loadRecord(me.modelReturn);
                functionReturnItemForm.clearInvalid();
                functionReturnGrid.getSelectionModel().deselectAll();
                functionReturn.show();
                functionReturnShowForm(me.modelReturn);
            },
            functionReturnAddButton = new Ext.button.Button({
                iconCls: 'app-icon-add',
                tooltip: 'Добавить',
                handler: functionReturnCreate
            }),
            functionReturnRemove = function() {
                Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить параметр?', function(btn){
                    if(btn!='yes') return;
                    var records = functionReturnGrid.getSelectionModel().getSelection(),
                        record = records && records[0];
                    if(!record) { return; }
                    me.modelReturn = new modelParamsItem();
                    functionReturnGridStore.remove(record);
                    functionReturn.save();
                    functionReturnItemForm.loadRecord(me.modelReturn);
                    functionReturnItemForm.clearInvalid();
                    functionReturnShowForm();
                });
            },
            functionReturnRemoveButton = new Ext.button.Button({
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-remove',
                tooltip: 'Удалить',
                handler: functionReturnRemove
            }),
            functionReturnGridStore = Ext.create('Ext.data.Store', {
                model: modelParamsItem,
                _index: 'classes'
            }),
            functionReturnShowForm = function(state) {
                var items = functionReturn.query('[ref="formPanel"]'),
                    formPanel = items && items[0];
                if(formPanel) {
                    (state) ? formPanel.show() : formPanel.hide();
                }
            },
            functionReturnOrderDirty = false,
            functionReturnItemForm = undefined,
            isDirtyFunctionReturn = function() {
                return isFormDirty(functionReturnItemForm, ['type', 'name', 'info', 'isArray', 'required', 'qty']);
            },
            saveFunctionReturnIfDirty = function(clb) {
                return functionReturn.saveIfDirty(clb, isDirtyFunctionReturn);
            },
            functionReturnGrid = Ext.create('Ext.grid.Panel', {
                multiSelect: false,
                hideHeaders: true,
                height: 100,
                flex: 1,
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragGroup: 'functionReturnGridDDGroup',
                        dropGroup: 'functionReturnGridDDGroup'
                    },
                    listeners: {
                        drop: function(node, data, dropRec, dropPosition) {
                            functionReturnOrderDirty = true;
                        }
                    }
                },
                store            : functionReturnGridStore,
                columns          : [{ flex: 1, sortable: true, dataIndex: 'name'}],
                stripeRows       : true,
                margins          : '0 2 0 0',
                listeners: {
                    beforeselect: function(rowModel, record, rowIndex) {
                        saveFunctionReturnIfDirty(function(ok, m) {
                            if(!ok) {
                                return;
                            }
                            me.modelReturn = m;
                            functionReturnGrid.getSelectionModel().select(record);
                        });
                        return !isDirtyFunctionReturn();
                    },
                    selectionchange: function(rowModel, record) {
                        updateForm(functionReturnItemForm, record && record[0]);
                        me.modelReturn = record && record[0] || me.modelReturn;
                        functionReturnShowForm(me.modelReturn);
                        if(record && record[0]) {
                            functionReturnRemoveButton.enable();
                        } else {
                            functionReturnRemoveButton.disable();
                        }
                    }
                }
            }),
            functionReturnTypeCombo = Ext.create('widget.combo', {
                emptyText: '',
                forceSelection: true,
                store: functionListTypeStore,
                name: 'type',
                displayField: 'type',
                valueField: 'type'
            }),
            onFunctionReturnSave = function() {
                var _values = functionReturnItemForm.getValues();
                var _formRecord = functionReturnItemForm.getRecord();

                var gridRecordIndex = functionReturnGridStore.findExact('id', _formRecord.get('id'));
                var gridRecord = functionReturnGridStore.getAt(gridRecordIndex);

                var updatedRecord = functionReturn.getForm().getRecord();
                functionReturnGridStore.loadData(updatedRecord.get('return'));

                functionReturnGrid.getSelectionModel().deselectAll();
                if(gridRecord) {
                    var newRecordToSelectIndex = functionReturnGridStore.findExact('id', gridRecord.get('id'));
                    if(newRecordToSelectIndex >= 0) {
                        var newRecordToSelect = functionReturnGridStore.getAt(newRecordToSelectIndex);
                        functionReturnGrid.getSelectionModel().select(newRecordToSelect);
                    }
                }

                functionReturnOrderDirty = false;

                Ext.MessageBox.alert('Cохранение данных', "Данные успешно сохранены.");
            },
            functionReturnSaveBt = Ext.create('Ext.Button', {
                anchor: false,
                text: 'Сохранить',
                handler: function() {
                    functionReturn.save();
                }
            }),
            functionReturn = Ext.create('App.form.Panel' , {
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

                        var formValues = functionReturnItemForm.getValues();
                        formValues['id'] = functionReturnItemForm.getRecord().get('id');

                        if(formValues['id']) {
                            var index = functionReturnGridStore.findExact('id', formValues['id']),
                                record = functionReturnGridStore.getAt(index);
                            if(record) {
                                for(var i in formValues) {
                                    if(formValues.hasOwnProperty(i)) {
                                        record.set(i, formValues[i]);
                                    }
                                }
                            }
                        } else {
                            var newRecord = new modelParamsItem(formValues);
                            functionReturnGridStore.add(newRecord);
                        }

                        var _return = getGridData(functionReturnGridStore);
                        m.set('id', me.model.get('id'));
                        m.set('params', _return);
                    },
                    'save': onFunctionReturnSave
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
                                html: 'Возвращяет'
                            },
                            functionReturnAddButton,
                            functionReturnRemoveButton
                        ]
                    },
                    getGridLayout(functionReturnGrid),
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
                                items: getParamsForm('return')
                            },
                            functionReturnSaveBt
                        ]
                    }
                ]
            });

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
                        items: functionParams
                    },
                    {
                        items: functionReturn
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