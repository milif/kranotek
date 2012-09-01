Ext.define('App.workspace.view.EditPanel', {
    extend: 'App.form.Panel',
    requires: [
        'Ext.grid.*',
        'Ext.data.*',
        'Ext.dd.*',
        'App.workspace.model.Workspace'
    ],
    constructor: function(config){

		var me = this,
			model = App.workspace.model.Workspace,
            saveIfDirty = function(clb) {
                return workspaceForm.saveIfDirty(clb, isDirty);
            },
            isDirty = function() {
                var result = false,
                    textFields = ['Name', 'Info', 'MaxShadows'];
                for(var field in textFields) {
                    if (textFields.hasOwnProperty(field)) {
                        if(workspaceForm.getForm().findField(textFields[field]).isDirty()) {
                            result = true;
                        }
                    }
                }
                if(isWorkingGridChanged) {
                    result = true;
                }
                return result;
            },
            createNewWorkspace = function() {
                saveIfDirty(function(ok){
                    if(!ok) {
                        return;
                    }
                    comboBaseClass.clearValue();
                    comboBaseClass.fireEvent('change');
                });
            },
			buttonBaseClassAdd = new Ext.button.Button({
                xtype: 'button',
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-add',
                tooltip: 'Добавить',
                handler: createNewWorkspace
            }),
            doRefresh = function() {
                var value = comboBaseClass.getValue();
                comboBaseClass.clearValue();
                comboBaseStore.load(function(){
                    comboBaseClass.setValue(value);
                });
            },
            refreshWorkspace = function() {
                saveIfDirty(function(ok){
                    if(!ok) {
                        return;
                    }
                    doRefresh();
                });
            },
            buttonBaseClassRefresh = new Ext.button.Button({
                xtype: 'button',
                margin: '0 0 0 5',
                iconCls: 'app-icon-refresh',
                tooltip: 'Обновить',
                handler: refreshWorkspace
            }),
            copyWorkspace = function() {
                saveIfDirty(function(ok){
                    if(!ok) {
                        return;
                    }
                    var data = me.model.getData();
                    if(data);
                    delete data.id;
                    comboBaseClass.clearValue();
                    updateForm(new model(data));
                });
            },
            buttonBaseClassCopy = new Ext.button.Button({
                xtype: 'button',
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-copy',
                tooltip: 'Копировать',
                handler: copyWorkspace
            }),
            removeWorkspace = function() {
                var b = this;
                Ext.MessageBox.confirm('Подвердите удаление', 'Вы действительно хотите удалить рабочую область?', function(btn){
                    if(btn!='yes') return;
                    workspaceForm.delete({
                        success: function(){
                            comboBaseClass.clearValue();
                        }
                    });
                });
            },
            buttonBaseClassRemove = new Ext.button.Button({
                xtype: 'button',
                disabled: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-remove',
                tooltip: 'Удалить',
                handler: removeWorkspace
            }),
            comboBaseStore = model.getStore({
                listeners: {
                    'update': function(me, model){
                    }
                }
            }),
            comboBaseClass = Ext.create('widget.combo', {
                fieldLabel: 'Рабочая область',
                width: 400,
                emptyText: 'Выберите рабочую область...',
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
                    'beforeselect': function(me, r) {
                        return saveIfDirty(function(ok){
                            if(!ok) return;
                            me.setValue(r.getId());
                            me.collapse();
                        });
                    },
                    'change': function() {
                        var self = this;
                        if(!self.getValue()) {
                            updateForm();
                        } else {
                            updateForm( self.getStore().findRecord( 'id', self.getValue()) );
                        }
                    }
                },
                store: comboBaseStore,
                displayField: 'Name',
                valueField: 'id'
            }),
            clearGrids = function() {
                for(var index in availableGridStore) {
                    if (availableGridStore.hasOwnProperty(index)) {
                        availableGridStore[index].removeAll();
                        workingGridStore[index].removeAll();
                    }
                }
            },
            updateGrids = function() {
                clearGrids();
                var _data = me.model.getData(),
                    storeLoad = function(records){
                        var index = this._index,
                            store = this;
                        for(var rowIndex in _data.access[index]) {
                            if (_data.access[index].hasOwnProperty(rowIndex)) {
                                var row = _data.access[index][rowIndex],
                                    recordIndex = store.findBy(function(rec){
                                        return rec.get('id') === row.id;
                                    }),
                                    record = store.getAt(recordIndex);
                                if(record) {
                                    for(var field in row) {
                                        if (row.hasOwnProperty(field)) {
                                            record.set(field, row[field]);
                                        }
                                    }
                                    workingGridStore[index].add(record);
                                    availableGridStore[index].remove(record);
                                }
                            }
                        }
                        isWorkingGridChanged = false;
                    };
                for(var index in availableGridStore) {
                    if (availableGridStore.hasOwnProperty(index)) {
                        var _store = availableGridStore[index];
                        _store.load(storeLoad);
                    }
                }
            },
            updateForm = function(_model) {
                isWorkingGridChanged = false;
                if(!_model) {
                    me.model = new model({});
                    workspaceForm.getForm().loadRecord(me.model);
                    workspaceForm.getForm().clearInvalid();
                    buttonBaseClassRemove.disable();
                    buttonBaseClassAdd.disable();
                    buttonBaseClassCopy.disable();
                    clearGrids();
                    return;
                }
                me.model = _model;
                workspaceForm.getForm().loadRecord(me.model);
                workspaceForm.getForm().clearInvalid();
                updateGrids();
                buttonBaseClassRemove.enable();
                buttonBaseClassCopy.enable();
                buttonBaseClassAdd.enable();
            },
            gridColumns = {
                classes: [{ flex: 1, sortable: true, dataIndex: 'ClassName'}],
                user: [{ flex: 1, sortable: true, dataIndex: 'Username'}],
                group: [{ flex: 1, sortable: true, dataIndex: 'Name'}]
            },
            availableGridStore = {
                classes: Ext.create('Ext.data.Store', {
                    model: 'App.class.model.Class',
                    _index: 'classes'
                }),
                user: Ext.create('Ext.data.Store', {
                    model: 'App.user.model.User',
                    _index: 'user'
                }),
                group: Ext.create('Ext.data.Store', {
                    model: 'App.group.model.Group',
                    _index: 'group'
                })
            },
            onWorkingGridStoreChange = function() {
                isWorkingGridChanged = true;
            },
            onWorkingGridStoreUpdate = function() {
                isWorkingGridChanged = true;
            },
            workingGridStore = {
                classes: Ext.create('Ext.data.Store', {
                    model: 'App.class.model.Class',
                    listeners: {
                        datachanged: onWorkingGridStoreChange,
                        update: onWorkingGridStoreUpdate
                    }
                }),
                user: Ext.create('Ext.data.Store', {
                    model: 'App.user.model.User',
                    listeners: {
                        datachanged: onWorkingGridStoreChange,
                        update: onWorkingGridStoreUpdate
                    }
                }),
                group: Ext.create('Ext.data.Store', {
                    model: 'App.group.model.Group',
                    listeners: {
                        datachanged: onWorkingGridStoreChange,
                        update: onWorkingGridStoreUpdate
                    }
                })
            },
            updateAccessForm = function(index, record) {
                var _form = formAccess[index];
                if(workingGridPreviousRecord[index]) {
                    var previousRecord = workingGridStore[index].findRecord('id', workingGridPreviousRecord[index]);
                    if(previousRecord) {
                        var _values = _form.getValues();
                        for(var field in _values) {
                            if (_values.hasOwnProperty(field)) {
                                previousRecord.set(field, _values[field]);
                            }
                        }
                    }
                }
                var _fields = _form.getForm().getFields();
                _fields.each(function(field){
                    field.suspendEvents();
                });
                _form.getForm().reset();
                if(record) {
                    _form.getForm().loadRecord(record);
                    _form.getForm().clearInvalid();
                }
                _fields.each(function(field){
                    field.resumeEvents();
                });
            },
            availableGrid = {},
            getAvailableGrid = function(index) {
                availableGrid[index] = Ext.create('Ext.grid.Panel', {
                    multiSelect: true,
                    hideHeaders: true,
                    viewConfig: {
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            dragGroup: 'availableGridDDGroup',
                            dropGroup: 'workingGridDDGroup'
                        }
                    },
                    store            : availableGridStore[index],
                    columns          : gridColumns[index],
                    stripeRows       : true,
                    margins          : '0 2 0 0',
                    listeners: {
                        selectionchange: function(rowModel, record) {
                            workingGrid[index].getSelectionModel().deselectAll();
                            if(record.length > 0) {
                                moveRightBt[index].enable();
                            } else {
                                moveRightBt[index].disable();
                            }
                        }
                    }
                });
                return availableGrid[index];
            },
            workingGrid = {},
            isWorkingGridChanged = false,
            workingGridPreviousRecord = {},
            getWorkingGrid = function(index){
                workingGrid[index] = Ext.create('Ext.grid.Panel', {
                    selModel: new Ext.selection.RowModel({
                    }),
                    hideHeaders: true,
                    viewConfig: {
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            dragGroup: 'workingGridDDGroup',
                            dropGroup: 'availableGridDDGroup'
                        }
                    },
                    store            : workingGridStore[index],
                    columns          : gridColumns[index],
                    stripeRows       : true,
                    margins          : '0 0 0 3',
                    listeners: {
                        selectionchange: function(rowModel, record) {
                            availableGrid[index].getSelectionModel().deselectAll();
                            if(record.length > 1) {
                                updateAccessForm(index);
                                workingGridPreviousRecord[index] = undefined;
                                return false;
                            }

                            var accessFields = formAccess[index].getForm().getFields();
                            if(!record[0]) {
                                accessFields.each(function(field){
                                    field.disable();
                                });
                                moveLeftBt[index].disable();
                            } else {
                                accessFields.each(function(field){
                                    field.enable();
                                });
                                moveLeftBt[index].enable();
                            }
                            updateAccessForm(index, record[0]);
                            workingGridPreviousRecord[index] = record[0] ? record[0].get('id') : undefined;
                        }
                    }
                });
                return workingGrid[index];
            },
            formAccess = {},
            updateCurrentWorkingGridRecord = function() {
                var _form = formAccess[tabIndex],
                    sm = workingGrid[tabIndex].getSelectionModel(),
                    records = sm.getSelection();
                if(records.length == 1) {
                    records[0].beginEdit();
                    var _values = _form.getValues();
                    for(var field in _values) {
                        if (_values.hasOwnProperty(field)) {
                            records[0].set(field, _values[field]);
                        }
                    }
                    records[0].endEdit();
                }
                workingGrid[tabIndex].getView().refresh();
            },
            onFormAccessChange = function() {
                updateCurrentWorkingGridRecord();
                isWorkingGridChanged = true;
            },
            getFormAccess = function(index) {
                var items = [];
                if(index == 'user') {
                    items.push({
                        name: 'groupRights',
                        ref: 'groupRights',
                        boxLabel: 'Использовать права групп'
                    });
                }
                items.push({
                    name: 'read',
                    ref: 'read',
                    boxLabel: 'Чтение'
                });
                items.push({
                    name: 'write',
                    ref: 'write',
                    boxLabel: 'Запись'
                });
                items.push({
                    name: 'create',
                    ref: 'create',
                    boxLabel: 'Создание новой записи'
                });
                items.push({
                    name: 'delete',
                    ref: 'delete',
                    boxLabel: 'Удаление записи'
                });
                items.push({
                    name: 'rights',
                    ref: 'rights',
                    boxLabel: 'Изменение прав доступа'
                });
                formAccess[index] = Ext.create('Ext.form.Panel', {
                    border: false,
                    trackResetOnLoad: true,
                    padding: '20px 10px',
                    defaultType: 'checkboxfield',
                    defaults: {
                        inputValue: true,
                        uncheckedValue: false,
                        disabled: true,
                        listeners: {
                            change: onFormAccessChange
                        }
                    },
                    items: items
                });

                return formAccess[index];
            },
            moveToWorkingGrid = function() {
                var records = availableGrid[tabIndex].getSelectionModel().getSelection();
                workingGridStore[tabIndex].add(records);
                availableGridStore[tabIndex].remove(records);
            },
            moveToAvailableGrid = function() {
                var records = workingGrid[tabIndex].getSelectionModel().getSelection();
                availableGridStore[tabIndex].add(records);
                workingGridStore[tabIndex].remove(records);
            },
            moveLeftBt = {},
            getMoveLeftBt = function(index) {
                moveLeftBt[index] = Ext.create('Ext.Button', {
                    margin: '0 0 0 5',
                    disabled: true,
                    text: '',
                    iconCls: 'app-icon-left',
                    handler: moveToAvailableGrid
                });
                return moveLeftBt[index];
            },
            moveRightBt = {},
            getMoveRightBt = function(index) {
                moveRightBt[index] = Ext.create('Ext.Button', {
                    margin: '0 0 10 5',
                    disabled: true,
                    text: '',
                    iconCls: 'app-icon-right',
                    handler: moveToWorkingGrid
                });
                return moveRightBt[index];
            },
            getDndGrids = function(index){
                return [
                    {
                        border: false,
                        items: [
                            {
                                border: false,
                                padding: '5px 0',
                                html: 'Доступные ' + tabTitles[index].toLowerCase()
                            },
                            {
                                xtype: 'panel',
                                layout: 'fit',
                                height: 300,
                                border: false,
                                items: getAvailableGrid(index)
                            }
                        ]
                    },
                    {
                        border: false,
                        width: 30,
                        flex: false,
                        layout: 'vbox',
                        items: [
                            {
                                border: false,
                                flex: 1
                            },
                            getMoveRightBt(index),
                            getMoveLeftBt(index),
                            {
                                border: false,
                                flex: 1
                            }
                        ]
                    },
                    {
                        border: false,
                        items: [
                            {
                                border: false,
                                padding: '5px 0',
                                html: tabTitles[index] + ' рабочей области'
                            },
                            {
                                xtype: 'panel',
                                layout: 'fit',
                                height: 300,
                                border: false,
                                items: getWorkingGrid(index)
                            }
                        ]
                    },
                    getFormAccess(index)
                ];
            },
            tabTitles = {
                'classes': 'Классы',
                'user': 'Пользователи',
                'group': 'Группы'
            },
            getTab = function(index) {
                return {
                    xtype: 'panel',
                    _index: index,
                    padding: 10,
                    border: false,
                    title: tabTitles[index],
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    defaults: { flex : 1 }, //auto stretch
                    items: getDndGrids(index)
                };
            },
            tabIndex = 'classes',
            workspaceForm = Ext.create('App.form.Panel' , {
                trackResetOnLoad: true,
                url: 'workspace.update',
                border: false,
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    items: [
                        { text: 'Сохранить', handler: function(){
                            workspaceForm.save({
                                success: function(){

                                }
                            });
                        } }
                    ]
                }],
                listeners: {
                    'beforesave': function() {
                        updateCurrentWorkingGridRecord();
                        var m = this.getForm().getRecord(),
                            records,
                            fields = [],
                            accessData = {};
                        for(var index in workingGridStore) {
                            if (workingGridStore.hasOwnProperty(index)) {
                                fields = [];
                                records = workingGridStore[index].getRange();
                                for(var i=0; i<records.length; i++) {
                                    fields.push(records[i].getData());
                                }
                                accessData[index] = fields;
                            }
                        }
                        m.set('access', accessData);
                    },
                    'save': function() {
                        var m = workspaceForm.getForm().getRecord();
                        if(comboBaseClass && comboBaseClass.getStore().indexOf(m)<0) {
                            comboBaseClass.getStore().add(m);
                            comboBaseClass.setValue(m.getId());
                        }
                        Ext.MessageBox.alert('Cохранение данных', "Данные о рабочей областе успешно сохранены.");
                    }
                },
                items: [
                    {
                        xtype: 'form',
                        trackResetOnLoad: true,
                        border: false,
                        items: [
                            {
                                layout: 'hbox',
                                padding: '5px 0',
                                border: false,
                                items: [
                                    comboBaseClass,
                                    buttonBaseClassRefresh,
                                    buttonBaseClassAdd,
                                    buttonBaseClassCopy,
                                    buttonBaseClassRemove
                                ]
                            },
                            {
                                xtype: 'textfield',
                                name: 'Name',
                                fieldLabel: 'Название',
                                allowBlank: false
                            },
                            {
                                xtype: 'textareafield',
                                name: 'Info',
                                fieldLabel: 'Описание',
                                anchor: '100%'
                            },
                            {
                                xtype: 'numberfield',
                                name: 'MaxShadows',
                                hideTrigger: true,
                                decimalPrecision: 0,
                                maxValue: 100,
                                minValue: 0,
                                labelWidth: 240,
                                width: 290,
                                fieldLabel: 'Количество записей истории изменений'
                            }
                        ]
                    },
                    {
                        xtype: 'tabpanel',
                        plain: true,
                        items: [
                            getTab('classes'),
                            getTab('user'),
                            getTab('group')
                        ],
                        listeners: {
                            beforetabchange: function() {
                                updateCurrentWorkingGridRecord();
                            },
                            tabchange: function (panel, tab) {
                                tabIndex = tab._index;
                            }
                        }
                    }
                ]
            });

        me.model = new model();

		config = Ext.apply({
            border: false,
            items: [
                workspaceForm
            ],
            listeners: {
                afterrender: function() {
                    workspaceForm.getForm().loadRecord(me.model);
                    workspaceForm.getForm().clearInvalid();
                    updateGrids();
                }
            }
        }, config );

		me.callParent([config]);

    }
});