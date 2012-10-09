(function(){
    App.defineView('ViewEditPanelClass', {

        extend: 'Container',

        options: {
            fluid: true,
            collection: new (App.getCollection('CollectionClass'))() 
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
            
            this._listEl = this.$el.find('._nestedlist'+this.cid);                
                   
            this._nestedlist = new (App.getView('NestedList'))({
                collection: this.collection,
                el: this._listEl,
                emptyText: 'Нет классов',
                listeners: {
                    'appendlist': function(path, toolbar){
                        buttonDelete = new (App.getView('Button'))({
                            disabled: true,
                            tooltip: 'Удалить класс',
                            size: 'small',
                            icon: 'icon-remove',
                            click: function(){
                                App.msg.okcancel({
                                    title: 'Удаление класса',
                                    text: 'Вы действительно хотите удалить класс?',
                                    callback: function(){
                                        var node = self.collection.getNode(self._nestedlist.getListNode(path));
                                        if(node) node.destroy({
                                            wait: true,
                                            silent:false
                                        });                                    
                                    }
                                });
                            }
                        }),
                        buttonAdd = new (App.getView('Button'))({
                            tooltip: 'Добавить класс',
                            size: 'small',
                            icon: 'icon-plus',
                            click: function(){
                                self._nestedlist.select(path, true);
                                addClassTo.call(self, path);
                            }
                        });
                        toolbar
                            .add(buttonAdd, 1)
                            .add( buttonDelete, 1);
                         toolbar.buttonDelete = buttonDelete;
                         toolbar.buttonAdd = buttonAdd;
                        
                    },
                    'beforeselectionchange': function(e, selected, deselected){
                        e.cancel = true;
                        self._form.askIfDirty(function(){
                            
                            this.select(selected[0], true);
                        
                            var lists = this.getLists(),
                                buttonDelete,
                                buttonAdd,
                                toolbar,
                                node,
                                nodeIn,
                                current = selected[0];
                                
                                for(var i=0;i<lists.length;i++){
                                    toolbar = this.getListToolbar(lists[i]);
                                    node = self.collection.getNode(lists[i]);
                                    nodeIn = self.collection.getNode(this.getListNode(lists[i]));
                                    if(this.isSelectedList(lists[i]) && nodeIn && !nodeIn.get('System')) {
                                        toolbar.buttonDelete.enable();
                                    } else {
                                        toolbar.buttonDelete.disable();
                                    }
                                    if(!node || !node.get('System')) {
                                        toolbar.buttonAdd.enable();
                                    } else {
                                        toolbar.buttonAdd.disable();
                                    }                                
                                }
                                
                                setCurrentClass.call(self, self.collection.getNode(current));                        
                        }, this);

                    }
                }
            }); 
            
            var Tabbar = App.getView('Tabbar'),
                Form = App.getView('Form'),
                FieldTextarea = App.getView('FieldTextarea'),
                FieldText = App.getView('FieldText'),
                FieldCheckbox = App.getView('FieldCheckbox'),
                Container = App.getView('Container'),
                Button = App.getView('Button'),
                ModelClassField = this.collection.model.getModelClassField(),
                Grid = App.getView('Grid'),
                
                addFieldButton = new Button({
                    disabled: true,
                    tooltip: 'Добавить поле',
                    size: 'small',
                    icon: 'icon-plus',
                    click: function(){
                        var classId = self._form.getModel().id;
                        editField.call(self, new (self.collection.model.getModelClassField())({
                            'ClassId': classId
                        }));
                    }
                }),                
                editFieldButton = new Button({
                    disabled: true,
                    tooltip: 'Изменить поле',
                    size: 'small',
                    icon: 'icon-edit',
                    click: function(){
                        var ids = gridFields.getSelection(),
                        model = gridFields.collection.get(ids[0]);                        
                        editField.call(self, model);
                    }
                }), 
                removeFieldButton = new Button({
                    disabled: true,
                    size: 'small',
                    tooltip: 'Удалить поле',
                    icon: 'icon-remove',
                    click: function(){
                        var ids = gridFields.getSelection(),
                            model = gridFields.collection.get(ids[0]);
                        if(model && !model.id) {
                            gridFields.collection.remove([model], {silent: false});
                            return;
                        }
                        App.msg.okcancel({
                            title: 'Удаление поля',
                            text: 'Вы действительно хотите удалить поле?',
                            callback: function(){    
                                if(model) model.destroy({
                                    wait: true,
                                    silent:false
                                });                                    
                            }
                        });                    
                    }
                }),
                gridFields = new Grid({
                    selectable: true,
                    columns: [
                        { name: 'Название', key: 'Name', width: 1 },
                        { name: 'Описание', key: 'Description', width: 3 },
                        { name: 'Тип данных', key: 'Type', width: 1, render: function(value){
                            return ModelClassField.fieldTypes[value];
                        }},
                        { name: 'По умолчанию', key: 'Default', width: 1 },
                        { name: 'Не пусто', key: 'Required', width: 100, align: 'center'},
                        { name: 'Уникально', key: 'Unique', width: 100, align: 'center'},
                        { name: 'Внешнее', key: 'External', width: 100, align: 'center'}
                    ],
                    listeners: {
                        'selectionchange': function(id){
                            var model = this.collection.get(id);
                            if(model) {
                                editFieldButton.enable();
                            } else {
                                editFieldButton.disable();
                            }
                            if(model && model.get('External')) {
                                removeFieldButton.enable();
                            } else {
                                removeFieldButton.disable();
                            }
                        }
                    }
                }),
                
                fieldName = new FieldText({
                    label: 'Название класса',
                    name: 'ClassName'
                }),
                fieldSystem = new FieldCheckbox({
                    label: 'Системный',
                    readonly: true,
                    name: 'System'
                }),
                fieldAllWorkspace = new FieldCheckbox({
                    label: 'Доступен для всех рабочих областей',
                    name: 'AllWorkspace'
                }), 
                fieldWorkspaceId = new FieldText({
                    label: 'Основная рабочая область',
                    readonly: true,
                    name: 'WorkspaceId'
                }),
                form = new Form({
                    listeners: {
                        'beforesave': function(e, isNew, attrs){
                            if(isNew){
                                var model = this.getModel(),
                                    fieldCollection = gridFields.collection,
                                    fields=[];
                                
                                fieldCollection.each(function(model){
                                    fields.push(model.attributes);
                                });
                                if(fields.length==0){
                                    e.cancel = true;
                                    App.msg.warning({
                                        title: 'Заполните поля класса',
                                        text: 'Перед сохранением нового класса следует заполнить его поля'
                                    });
                                    tabbar.activeTab(1);
                                } else {
                                    attrs._fields = fields;
                                }
                            }
                        },
                        'save': function(isNew){
                            var model = this.getModel();
                            if(isNew) {
                                self.collection.add([model],{silent: false});
                                self._nestedlist.select(self.collection.getPath(model));
                                self._gridFields.setCollection(model.getCollectionFields());
                            }
                        }
                    }
                })
                    .add(fieldName)
                    .add(new FieldTextarea({
                        label: 'Описание класса',
                        name: 'ClassInfo'
                    }))
                    .add(fieldSystem)
                    .add(fieldAllWorkspace)
                    .add(fieldWorkspaceId),
                
                tabbar = new Tabbar({
                    listeners: {
                        'beforetabchange': function(e, current, prev){
                            if(prev!=0 || !self._form) return;
                            if(self._form.getModel().id) {
                                e.cancel = true;
                                self._form.askIfDirty(function(){
                                    this.activeTab(current, true);
                                    if(current==1 && gridFields.collection && !gridFields.collection.isFetched()) {
                                        gridFields.fetch();
                                    }
                                }, this);
                            }
                        }
                    }
                })
                    .addTab(form, 'Свойства', 0)
                    .addTab(gridFields, 'Поля', 1)
                    .activeTab(0)
                    .hide();

                 gridFields.getToolbar()
                    .add(addFieldButton, 1)
                    .add(editFieldButton, 2)
                    .add(removeFieldButton, 2);
                 this._addFieldButton = addFieldButton;

                 this.add(tabbar);   
                    
                 this._form = form;
                 this._tabbar = tabbar; 
                 this._gridFields = gridFields;
                 
            this._fieldName = fieldName;
            this._fieldSystem = fieldSystem;
            this._fieldAllWorkspace = fieldAllWorkspace; 
            this._fieldWorkspaceId = fieldWorkspaceId;
            
            return this;    
        },
        doPresenter: function(){
            
            var isOnce = this._presenterOnce;
            
            this.parent().doPresenter.apply(this, arguments);
            
            if(!isOnce) {

            }
           
        }
    });
    
    var tpl = _.template(
        '<div class="b-classeditpanel-nestedlist _nestedlist{cid}"></div>'
    );
    function editField(model){
        if(!model) return;
        var self = this;
        if(!this._popupEditField) {
            this._popupEditField = new (App.getView('ViewEditClassFieldPopup'))({
                listeners: {
                    'save': function(isNew, model){
                        this.close();
                        if(isNew) self._gridFields.collection.add([model], {silent: false});
                    }
                }
            });
        }
        this._popupEditField
            .setLocal(this._gridFields.collection.isLocal())
            .setModel(model)
            .open();
    }
    function setCurrentClass(model){
            if(!model) {
                this._tabbar.hide();
                return;
            }
            
            this._form
                .setLegend('Класс ' + model.get('ClassName'))
                .setModel(model);
            this._tabbar.show();
            
            this._fieldName.setReadOnly(true);
            this._fieldSystem.show();
            this._fieldWorkspaceId.show();
            this._fieldAllWorkspace.hide(true);
            
            this._gridFields.setCollection(model.getCollectionFields());
            if(model.get('System')) {
                this._addFieldButton.disable();
            } else {
                this._addFieldButton.enable();
            }
            
    }
    function addClassTo(path) {
        this._form.askIfDirty(function(){        
            var model = new this.collection.model({
                'parent': path
            });
            this._form
                .setLegend('Создание нового '+(path!='/'?'дочернего':'')+' класса')
                .setModel(model);

            this._tabbar.activeTab(0);
            this._gridFields.setCollection(model.getCollectionFields());
            this._addFieldButton.enable();
            
            this._tabbar.show();
            
            this._fieldSystem.hide(true);
            this._fieldName.setReadOnly(false);
            this._fieldWorkspaceId.hide(true);
            this._fieldAllWorkspace.show();
            
        }, this);
    }
    
})();
