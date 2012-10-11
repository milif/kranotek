(function(){
    App.defineView('ViewEditPanelClassFunction', {

        extend: 'Container',

        options: {
            fluid: true,
            model: null
        },
        init: function(){
            this.parent().init.apply(this, arguments);
        },    
        doRender: function(){
        
            this.parent().doRender.apply(this, arguments);
            
            var self = this;
            
            var CollectionClassFunction = new (App.getCollection('CollectionClassFunction'))(),
                addFunctionButton = new Button({
                    tooltip: 'Добавить функцию',
                    size: 'small',
                    icon: 'icon-plus',
                    click: function(){
                        editFunction.call(self, new ModelClassFunction({
                            'ClassId': self.model.id
                        }));
                    }
                }),                
                editFunctionButton = new Button({
                    disabled: true,
                    tooltip: 'Изменить функцию',
                    size: 'small',
                    icon: 'icon-edit',
                    click: function(){
                        var ids = gridFunctions.getSelection(),
                        model = gridFunctions.collection.get(ids[0]);
                        editFunction.call(self, model);
                    }
                }), 
                removeFunctionButton = new Button({
                    disabled: true,
                    size: 'small',
                    tooltip: 'Удалить функцию',
                    icon: 'icon-remove',
                    click: function(){
                        App.msg.okcancel({
                            title: 'Удаление функции',
                            text: 'Вы действительно хотите удалить функцию?',
                            callback: function(){
                                var ids = gridFunctions.getSelection(),
                                    model = gridFunctions.collection.get(ids[0]);
                                if(model) model.destroy({
                                    wait: true,
                                    silent:false
                                });                                    
                            }
                        });                    
                    }
                }),
                gridFunctions = new Grid({
                    selectable: true,
                    columns: [
                        { name: 'Название', key: 'Name', width: 1 },
                        { name: 'Описание', key: 'Info', width: 3 },
                        { name: 'Тип', key: 'Type', width: 1, render: function(value){
                            return ModelClassFunction.functionTypes[value];
                        }}
                    ],
                    listeners: {
                        'selectionchange': function(id){
                            var model = this.collection.get(id);
                            if(model) {
                                editFunctionButton.enable();
                                removeFunctionButton.enable();
                            } else {
                                editFunctionButton.disable();
                                removeFunctionButton.disable();
                            }
                            setCurrentClassFunction.call(self, model);
                            model ? tabbar.show() : tabbar.hide();
                        }
                    }
                }),
                functionFieldsInput = getGridFunctionFields.call(this, 'input'),
                functionFieldsOutput = getGridFunctionFields.call(this, 'output'),
                gridFunctionFieldsInput = functionFieldsInput.grid,
                gridFunctionFieldsOutput = functionFieldsOutput.grid,
                tabbar = new Tabbar({
                    listeners: {
                        'beforetabchange': function(e, current, prev){
                            self._activeTab = current;
                        }
                    }
                })
                    .addTab(gridFunctionFieldsInput, 'Ввод', 0)
                    .addTab(gridFunctionFieldsOutput, 'Вывод', 1)
                    .activeTab(0)
                    .hide();

            gridFunctions.getToolbar()
                .add(addFunctionButton, 1)
                .add(editFunctionButton, 2)
                .add(removeFunctionButton, 2);

            this.add(gridFunctions);
            this.add(tabbar);

            gridFunctionFieldsInput.getToolbar()
                .add(functionFieldsInput.addButton, 1)
                .add(functionFieldsInput.editButton, 2)
                .add(functionFieldsInput.removeButton, 2);
            gridFunctionFieldsOutput.getToolbar()
                .add(functionFieldsOutput.addButton, 1)
                .add(functionFieldsOutput.editButton, 2)
                .add(functionFieldsOutput.removeButton, 2);

            // gridFunctions.fetch();

            this._gridFunctions = gridFunctions;
            this._gridFunctionFieldsInput = gridFunctionFieldsInput;
            this._gridFunctionFieldsOutput = gridFunctionFieldsOutput;
        },
        layout: function(){
            this.parent().layout.apply(this, arguments);
            this._gridFunctions.layout();
        },
        setModel: function(model) {
            if(!model) return this;
            this.model = model;
            this._gridFunctions.setCollection(model.getCollectionFunctions());
            return this;
        }
    });

    var Grid = App.getView('Grid'),
        Tabbar = App.getView('Tabbar'),
        Container = App.getView('Container'),
        Button = App.getView('Button'),
        ModelClassFunction = App.getModel('ClassFunction'),
        ModelClassFunctionField = App.getModel('ClassFunctionField');

    function editFunction(model){
        if(!model) return;
        var self = this;
        if(!this._popupEditFunction) {
            this._popupEditFunction = new (App.getView('ViewEditClassFunctionPopup'))({
                listeners: {
                    'save': function(isNew, model){
                        this.close();
                        if(isNew) self._gridFunctions.collection.add([model], {silent: false});
                    }
                }
            });
        }
        this._popupEditFunction
            .setModel(model)
            .open();
    }
    function editFunctionField(model){
        if(!model) return;
        var self = this;
        if(!this._popupEditFunctionField) {
            this._popupEditFunctionField = new (App.getView('ViewEditClassFunctionFieldPopup'))({
                listeners: {
                    'save': function(isNew, model){
                        this.close();
                        if(isNew) {
                            if(this._activeTab === 0) {
                                self._gridFunctionFieldsInput.collection.add([model], {silent: false});
                            } else {
                                self._gridFunctionFieldsOutput.collection.add([model], {silent: false});
                            }
                            
                        }
                    }
                }
            });
        }
        
        this._popupEditFunctionField
            .setModel(model)
            .open();
    }
    function setCurrentClassFunction(model){
        if(!model) {
            return;
        }
        this._gridFunctionFieldsInput.setCollection(model.getCollectionFields('input'));
        this._gridFunctionFieldsOutput.setCollection(model.getCollectionFields('output'));
    }

    function getGridFunctionFields(type) {
        var self = this;
        var addFunctionFieldButton = new Button({
                // disabled: true,
                tooltip: 'Добавить поле',
                size: 'small',
                icon: 'icon-plus',
                click: function(){
                    var ids = self._gridFunctions.getSelection(),
                    model = self._gridFunctions.collection.get(ids[0]);
                    var classFunctionId = model.id;
                    editFunctionField.call(self, new ModelClassFunctionField({
                        'FunctionId': classFunctionId,
                        'type': type
                    }));
                }
            }),                
            editFunctionFieldButton = new Button({
                disabled: true,
                tooltip: 'Изменить поле',
                size: 'small',
                icon: 'icon-edit',
                click: function(){
                    var ids = gridFunctionFields.getSelection(),
                    model = gridFunctionFields.collection.get(ids[0]);
                    editFunctionField.call(self, model);
                }
            }), 
            removeFunctionFieldButton = new Button({
                disabled: true,
                size: 'small',
                tooltip: 'Удалить поле',
                icon: 'icon-remove',
                click: function(){
                    App.msg.okcancel({
                        title: 'Удаление поля',
                        text: 'Вы действительно хотите удалить поле?',
                        callback: function(){
                            var ids = gridFunctionFields.getSelection(),
                                model = gridFunctionFields.collection.get(ids[0]);
                            if(model) model.destroy({
                                wait: true,
                                silent:false
                            });                                    
                        }
                    });
                }
            }),
            gridFunctionFields = new Grid({
                selectable: true,
                columns: [
                    { name: 'Название', key: 'Name', width: 1 },
                    { name: 'Описание', key: 'Info', width: 3 },
                    { name: 'Тип', key: 'Datatype', width: 1, render: function(value){
                        return ModelClassFunctionField.fieldTypes[value];
                    }},
                    { name: 'Запрет null', key: 'isNull', width: 100, align: 'center'},
                    { name: 'Массив', key: 'isArray', width: 100, align: 'center', render: function(value){
                        return value>0 ? value : false;
                    }}
                ],
                listeners: {
                    'selectionchange': function(id){
                        var model = this.collection.get(id);
                        if(model) {
                            editFunctionFieldButton.enable();
                            removeFunctionFieldButton.enable();
                        } else {
                            editFunctionFieldButton.disable();
                            removeFunctionFieldButton.disable();
                        }
                    }
                }
            });

        return {
            grid: gridFunctionFields,
            addButton: addFunctionFieldButton,
            editButton: editFunctionFieldButton,
            removeButton: removeFunctionFieldButton
        };
    }

})();
