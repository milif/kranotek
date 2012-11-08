/*
 * @id 509436428eed3 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require modules/report/formreport.css
 * @require modules/class/collection.Class.js

 * @require CollectionNested.js
 * @require view/button/Button.js
 * @require view/Dropdown.js
 * @require view/form/Form.js
 * @require view/form/FieldText.js
 * @require view/form/FieldSelect.js
 * @require view/container/Container.js
 * @require view/Diagram.js
 * @require view/Popup.js
 * @require modules/report/model.Report.js
 * @require modules/report/collection.FormReportNodes.js
 * @require modules/report/collection.FormReportNodeData.js
 */
(function(){
    App.defineView('FormReport', {

        extend: 'Form',

        className: "b-form form-horizontal b-formreport",

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

            var ClassCollection = new (App.getCollection('Class'))(),
                FormReportNodeCollection = new (App.getCollection('FormReportNodeData'))([], {
                local: true
            });
                
            ClassCollection.fetch({
                silent: true,
                success: function(){
                    _.each(ClassCollection.models, function(model) {
                        model.set('Name', model.get('ClassName'));
                        FormReportNodeCollection.add(model, {silent: true});
                        var functionsCollection = model.getCollectionFunctions();
                        if(functionsCollection) {
                            functionsCollection.fetch({
                                silent: true,
                                success: function(){
                                    _.each(functionsCollection.models, function(functionModel){
                                        FormReportNodeCollection.add(functionModel, {silent: true});
                                    });
                                },
                                complete: function(){
                                    App.view.setLoading(self.$el, false);
                                }
                            });
                        }
                    });
                },
                complete: function(){
                    App.view.setLoading(self.$el, false);
                }
            });
            
            var ReportNode = App.getModel('FormReportNode'),
                FormReportNodes = App.getCollection('FormReportNodes'),
                Diagram = App.getView('Diagram'),
                Dropdown = App.getView('Dropdown'),
                Button = App.getView('Button'),
                Form = App.getView('Form'),
                Container = App.getView('Container'),
                Popup = App.getView('Popup'),
                FieldText = App.getView('FieldText'),
                FieldSelect = App.getView('FieldSelect'),
                fieldReportName = new FieldText({
                    label: 'Название отчета',
                    name: 'Name'
                }),
                fieldReportConfig = new FieldText({
                    label: 'Config',
                    name: 'Config'
                });

                this._FormReportNodes = FormReportNodes;

                var diagram = new Diagram({
                    collection: self._collection,
                    listeners: {
                        'rendernode': function(node){
                            var menu = this.getMenu(node)
                                .addButton(new Button({
                                    text: 'Добавить Меню',
                                    click: function(){
                                        self._nodeFormMode = 'addMenu';
                                        var model = new ReportNode({
                                            path: self._collection.getPath(node)
                                        });
                                        self._currentNode = model;
                                        nodeForm.setModel(model);
                                        nodeData.hide();
                                        nodePopup.setTitle('Добавить Меню');
                                        nodePopup.open();
                                    }
                                }))
                                .addButton(new Button({
                                    text: 'Добавить Данные',
                                    click: function(){
                                        self._nodeFormMode = 'addData';
                                        var model = new ReportNode({
                                            path: self._collection.getPath(node)
                                        });
                                        self._currentNode = model;
                                        nodeForm.setModel(model);
                                        nodePopup.setTitle('Добавить Данные');
                                        nodeData.show();
                                        nodePopup.open();
                                    }
                                }))
                                .addSeparator()
                                .addButton(new Button({
                                    text: 'Удалить',
                                    click: function(){
                                        self._collection.remove(node, {silent: false});
                                    }
                                }));
                            
                            // this.setMenu(path, menu);
                        },
                        'clicknode': function(path, node){
                            self._selectedNode = { path: path, node: node };
                            App.msg.info({
                                title: 'Клик по ноде',
                                text: 'Совершен клик по ноде "'+node.get('Name')+'"'
                            });
                        }
                    }
                }),
                nodeName = new FieldText({
                    label: 'Название',
                    name: 'Name'
                }),
                nodeData = new FieldSelect({
                    label: 'Данные',
                    name: 'Data',
                    emptyText: 'Выберите объект',
                    collection: FormReportNodeCollection
                }),
                nodeForm = new Form({
                    listeners: {
                        'save': function(isNew){
                            var name = this.model.get('Name'),
                                data = this.model.get('Data'),
                                path = self._currentNode && self._currentNode.get('path') || '',
                                nodeConfig = {
                                    'Name': name,
                                    'path':path+'/'+_.uniqueId('node'),
                                    'moveable': true
                                };
                            if(self._nodeFormMode == 'addData') {
                                nodeConfig.Data = data;
                            }
                            if(self._nodeFormMode == 'addMenu') {
                                nodeConfig.scheme = 'yellow';
                            }
                            self._collection.add(nodeConfig, {silent: false});
                            nodePopup.close();
                            diagram.show();
                            createDiagramButtonContainer.hide();
                        }
                    }
                })
                    .add(nodeName)
                    .add(nodeData),
                nodePopup = new Popup({
                    title: '',
                    popupWidth: 500
                })
                    .add(nodeForm),
                
                createDiagramButton = new Button({
                    text: 'Добавить источник данных',
                    click: function(){
                        self._nodeFormMode = 'addMenu';
                        var model = new ReportNode({
                            path: '/'
                        });
                        self._currentNode = model;
                        nodeForm.setModel(model);
                        nodeData.hide();
                        nodePopup.setTitle('Добавить Меню');
                        nodePopup.open();
                    }
                }),
                createDiagramButtonContainer = new Container().add(createDiagramButton);

            nodeForm.setModel(new ReportNode({
                path: '/'
            }));
            nodeForm.setLocal(true);

            diagram.on('addnode', function(path, node){
                self._selectedNode = { path: path, node: node };
            });

            this._currentNode = null;
            this._nodeFormMode = 'addMenu';
            
            fieldReportConfig.hide();
            this.add(fieldReportName);
            this.add(fieldReportConfig);
            this.add(diagram);
            this.add(createDiagramButtonContainer);

            this._diagram = diagram;
            this._createDiagramButtonContainer = createDiagramButtonContainer;

            this.on('beforesave', function(e, isNew, attrs){
                attrs.Config = self._collection;
            });

            setCollection.call(this);

            return this;
        },
        cancel: function(){
            this.parent().cancel.apply(this, arguments);
            setCollection.call(this);
            return this;
        }
    });

    function updateConfigErrors(collection) {
        if(collection.length > 0) {
            delete this._errors.Config;
        } else {
            this._errors.Config = 'Empty';
            this._createDiagramButtonContainer && this._createDiagramButtonContainer.show();
        }
        this.trigger('errorchange');
    }

    function showConfigDiagram(length) {
        if(length) {
            this._createDiagramButtonContainer && this._createDiagramButtonContainer.hide();
            this._diagram.show();
        } else {
            this._createDiagramButtonContainer && this._createDiagramButtonContainer.show();
            this._diagram.hide();
        }
    }

    function setCollection(isClear) {
        var data = isClear ? [] : this.model.get('Config');
        var self = this,
            collection = new this._FormReportNodes(data,{
                local: true
            });
        this._collection = collection;
        this._collection.on('add', function() {
            updateConfigErrors.call(self, this);
            self._isDirty = true;
            self.trigger('dirtychange');
            showConfigDiagram.call(self, self._collection.length);
        });
        this._collection.on('remove', function() {
            updateConfigErrors.call(self, this);
            self._isDirty = true;
            self.trigger('dirtychange');
            showConfigDiagram.call(self, self._collection.length);
        });
        
        this._diagram && this._diagram.setCollection(collection);
        showConfigDiagram.call(this, data.length);

        updateConfigErrors.call(this, collection);
        self._isDirty = false;
        this.trigger('dirtychange');
    }
})();