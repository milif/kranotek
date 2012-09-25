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
                                current = selected[0]
                                ;
                                
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
            
            var Form = App.getView('Form'),
                FieldTextarea = App.getView('FieldTextarea'),
                FieldText = App.getView('FieldText'),
                FieldCheckbox = App.getView('FieldCheckbox'),
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
                        'save': function(isNew){
                            var model = this.getModel();
                            if(isNew) {
                                self.collection.add([model],{silent: false});
                                self._nestedlist.select(self.collection.getPath(model));
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
                    .add(fieldWorkspaceId)
                    .hide(); 

                 this.add(form);   
                    
                 this._form = form;           
                 
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
    function setCurrentClass(model){
            if(!model) {
                this._form.hide();
                return;
            }
            this._form
                .setLegend('Класс ' + model.get('ClassName'))
                .setModel(model);
            this._form.show(); 
            
            this._fieldName.setReadOnly(true);
            this._fieldSystem.show();
            this._fieldWorkspaceId.show();
            this._fieldAllWorkspace.hide(true);                      
    }
    function addClassTo(path) {
        this._form.askIfDirty(function(){        
            var model = new this.collection.model({
                'parent': path
            });
            this._form
                .setLegend('Создание нового '+(path!='/'?'дочернего':'')+' класса')
                .setModel(model);

            this._form.show();
            
            this._fieldSystem.hide(true);
            this._fieldName.setReadOnly(false);
            this._fieldWorkspaceId.hide(true);
            this._fieldAllWorkspace.show();
        }, this);
    }
    
})();
