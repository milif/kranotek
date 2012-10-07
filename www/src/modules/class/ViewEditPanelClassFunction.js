(function(){
    App.defineView('ViewEditPanelClassFunction', {

        extend: 'Container',

        options: {
            fluid: true,
            model: App.getModel('ModelClass')
        },
        init: function(){
            this.parent().init.apply(this, arguments);
            this.$el.addClass('b-classeditpanel');
        },    
        doRender: function(){
        
            this.parent().doRender.apply(this, arguments);
            
            var self = this;

            this.add(tpl({
                cid: this.cid
            }));
            
            var CollectionClassFunction = new (App.getCollection('CollectionClassFunction'))(),
                addFunctionButton = new Button({
                    tooltip: 'Добавить поле',
                    size: 'small',
                    icon: 'icon-plus',
                    click: function(){
                        editFunction.call(self, new ModelClassFunction({
                        }));
                    }
                }),                
                editFunctionButton = new Button({
                    disabled: true,
                    tooltip: 'Изменить поле',
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
                    tooltip: 'Удалить поле',
                    icon: 'icon-remove',
                    click: function(){
                        App.msg.okcancel({
                            title: 'Удаление поля',
                            text: 'Вы действительно хотите удалить поле?',
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
                    collection: CollectionClassFunction,
                    selectable: true,
                    columns: [
                        { name: 'Название', key: 'Name', width: 1 },
                        { name: 'Описание', key: 'Info', width: 3 },
                        { name: 'Тип', key: 'Type', width: 1, render: function(value){
                            return ModelClassFunction.fieldTypes[value];
                        }},
                        { name: 'Активная', key: 'isActive', width: 100, align: 'center'},
                        { name: 'Использовать поля класса', key: 'UseFields', width: 200, align: 'center'}
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
                            // e.cancel = true;
                            // this.activeTab(current, true);
                            if(current===0 && gridFunctionFieldsInput.collection && !gridFunctionFieldsInput.collection.isFetched()) {
                                gridFunctionFieldsInput.fetch();
                                // gridFunctionFieldsInput.setCollection(model.getCollectionFields('input'));
                            }
                            if(current===1 && gridFunctionFieldsOutput.collection && !gridFunctionFieldsOutput.collection.isFetched()) {
                                gridFunctionFieldsOutput.fetch();
                                // gridFunctionFieldsOutput.setCollection(model.getCollectionFields('output'));
                            }
                            self._activeTab = current;
                        }
                    }
                })
                    .addTab(gridFunctionFieldsInput, 'Input', 0)
                    .addTab(gridFunctionFieldsOutput, 'Output', 1)
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

            // gridFunctions.doLayout();
            gridFunctions.fetch();


            this._gridFunctions = gridFunctions;
            this._gridFunctionFieldsInput = gridFunctionFieldsInput;
            this._gridFunctionFieldsOutput = gridFunctionFieldsOutput;
        },
        setModel: function(model) {

        }
    });

    var tpl = _.template(
            '<div class="b-classeditpanel-classfunction{cid}"></div>'
        ),
        Grid = App.getView('Grid'),
        Tabbar = App.getView('Tabbar'),
        Form = App.getView('Form'),
        FieldTextarea = App.getView('FieldTextarea'),
        FieldText = App.getView('FieldText'),
        FieldCheckbox = App.getView('FieldCheckbox'),
        Container = App.getView('Container'),
        Button = App.getView('Button'),
        ModelClassFunction = App.getModel('ModelClassFunction'),
        ModelClassFunctionField = App.getModel('ModelClassFunctionField');

    function editFunction(model){
        if(!model) return;
        var self = this;
        if(!this._popupEditFunction) {
            this._popupEditFunction = new (App.getView('ViewEditClassFunctionPopup'))({
                listeners: {
                    'save': function(isNew, model){
                        this.close();
                        if(isNew) self._gridFields.collection.add([model], {silent: false});
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
                        'functionId': classFunctionId,
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
                    var ids = self._gridFunctions.getSelection(),
                    model = self._gridFunctions.collection.get(ids[0]);
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
                        return ModelClassFunction.fieldTypes[value];
                    }},
                    { name: 'Запрет null', key: 'isActive', width: 100, align: 'center'},
                    { name: 'Массив', key: 'UseFields', width: 100, align: 'center'},
                    { name: 'Настраиваемое поле', key: 'isConfigurable', width: 200, align: 'center'}
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