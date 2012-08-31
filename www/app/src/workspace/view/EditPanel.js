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
            createNewWorkspace = function() {
                workspaceForm.saveIfDirty(function(ok){
                    if(!ok) {
                        return;
                    }
                    comboBaseClass.clearValue();
                });
            },
			buttonBaseClassAdd = new Ext.button.Button({
                xtype: 'button',
                hidden: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-add',
                tooltip: 'Добавить',
                handler: createNewWorkspace
            }),
            refreshWorkspace = function() {
                workspaceForm.saveIfDirty(function(ok){
                    if(!ok) {
                        return;
                    }
                    updateForm( comboBaseStore.findRecord( 'id', comboBaseClass.getValue()) );
                });
            },
            buttonBaseClassRefresh = new Ext.button.Button({
                xtype: 'button',
                hidden: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-refresh',
                tooltip: 'Обновить',
                handler: refreshWorkspace
            }),
            copyWorkspace = function() {
                workspaceForm.saveIfDirty(function(ok){
                    if(!ok) {
                        return;
                    }
                    var record = comboBaseStore.findRecord( 'id', comboBaseClass.getValue()),
                        data = record.getData();
                    delete data.id;
                    comboBaseClass.clearValue();
                    workspaceForm.getForm().loadRecord(new model(data));
                    updateGrids();
                });
            },
            buttonBaseClassCopy = new Ext.button.Button({
                xtype: 'button',
                hidden: true,
                margin: '0 0 0 5',
                iconCls: 'app-icon-copy',
                tooltip: 'Копировать',
                handler: copyWorkspace
            }),
            removeWorkspace = function() {
                workspaceForm.delete({
                    success: function(){
                        comboBaseClass.clearValue();
                    }
                });
            },
            buttonBaseClassRemove = new Ext.button.Button({
                xtype: 'button',
                hidden: true,
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
                    this.clearValue();
                },
                listeners: {
                    'select': function(m, r){
                        updateForm( this.getStore().findRecord( 'id', this.getValue()) );
                    },
                    'change': function() {
                        if(!this.getValue()) {
                            updateForm();
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
                    };
                for(var index in availableGridStore) {
                    if (availableGridStore.hasOwnProperty(index)) {
                        var _store = availableGridStore[index];
                        _store.load(storeLoad);
                    }
                }
            },
            updateForm = function(model) {
                if(!model) {
                    workspaceForm.getForm().reset();
                    buttonBaseClassRemove.hide();
                    buttonBaseClassAdd.hide();
                    buttonBaseClassCopy.hide();
                    buttonBaseClassRefresh.hide();
                    clearGrids();
                    return;
                }
                me.model = model;
                workspaceForm.getForm().loadRecord(model);
                workspaceForm.getForm().clearInvalid();
                updateGrids();
                buttonBaseClassRemove.show();
                buttonBaseClassRefresh.show();
                buttonBaseClassCopy.show();
                buttonBaseClassAdd.show();
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
            workingGridStore = {
                classes: Ext.create('Ext.data.Store', {
                    model: 'App.class.model.Class'
                }),
                user: Ext.create('Ext.data.Store', {
                    model: 'App.user.model.User'
                }),
                group: Ext.create('Ext.data.Store', {
                    model: 'App.group.model.Group'
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

                _form.getForm().reset();
                if(record) {
                    _form.getForm().loadRecord(record);
                }
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
                        },
                        listeners: {
                            drop: function(node, data, dropRec, dropPosition) {
                                var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                                // Ext.example.msg("Drag from right to left", 'Dropped ' + data.records[0].get('name') + dropOn);
                            }
                        }
                    },
                    store            : availableGridStore[index],
                    columns          : gridColumns[index],
                    stripeRows       : true,
                    margins          : '0 2 0 0',
                    listeners: {
                        selectionchange: function(rowModel, record) {
                            workingGrid[index].getSelectionModel().deselectAll();
                        }
                    }
                });
                return availableGrid[index];
            },
            workingGrid = {},
            workingGridPreviousRecord = {},
            getWorkingGrid = function(index){
                workingGrid[index] = Ext.create('Ext.grid.Panel', {
                    // multiSelect: true,
                    hideHeaders: true,
                    viewConfig: {
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            dragGroup: 'workingGridDDGroup',
                            dropGroup: 'availableGridDDGroup'
                        },
                        listeners: {
                            drop: function(node, data, dropRec, dropPosition) {
                                var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                                // Ext.example.msg("Drag from left to right", 'Dropped ' + data.records[0].get('name') + dropOn);
                            }
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

                            updateAccessForm(index, record[0]);
                            workingGridPreviousRecord[index] = record[0] ? record[0].get('id') : undefined;
                        }
                    }
                });
                return workingGrid[index];
            },
            formAccess = {},
            getFormAccess = function(index) {
                formAccess[index] = Ext.create('Ext.form.Panel', {
                    border: false,
                    padding: '20px 10px',
                    defaultType: 'checkboxfield',
                    defaults: {
                        inputValue: true,
                        uncheckedValue: false
                    },
                    items: [
                        {
                            name: 'read',
                            ref: 'read',
                            boxLabel: 'Чтение'
                        },
                        {
                            name: 'write',
                            ref: 'write',
                            boxLabel: 'Запись'
                        },
                        {
                            name: 'create',
                            ref: 'create',
                            boxLabel: 'Создание новой записи'
                        },
                        {
                            name: 'groupRights',
                            ref: 'groupRights',
                            boxLabel: 'Удаление записи'
                        },
                        {
                            name: 'rights',
                            ref: 'rights',
                            boxLabel: 'Изменение прав доступа'
                        }
                    ]
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
                            {
                                xtype: 'button',
                                margin: '0 0 10 5',
                                iconCls: 'app-icon-right',
                                handler: moveToWorkingGrid
                            },
                            {
                                xtype: 'button',
                                margin: '0 0 0 5',
                                iconCls: 'app-icon-left',
                                handler: moveToAvailableGrid
                            },
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
                        Ext.MessageBox.alert('Cохранение данных', "Данные о классе успешно сохранены.");
                    }
                },
                items: [
                    {
                        xtype: 'form',
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
                                xtype: 'textfield',
                                name: 'MaxShadows',
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
                    updateGrids();
                }
            }
        }, config );

		me.callParent([config]);

    }
});