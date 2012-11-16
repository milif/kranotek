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
                local: false
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
                                        self._collection.remove(node, {silent: false, descendants: true});
                                    }
                                }));
                            
                            // this.setMenu(path, menu);
                        },
                        'clicknode': function(path, node){
                            self._selectedNode = { path: path, node: node };

                            var isMenu = false;
                            if(node.get('scheme') === 'yellow') {
                                isMenu = true;
                            }
                            self._nodeFormMode = isMenu ? 'editMenu' : 'editData';
                            self._currentNode = node;
                            var nodeDataModel,
                                nodeDataRawValue = node.get('Data');
                            if(nodeDataRawValue){
                                nodeClassModel = new (App.getCollection('Class'))(nodeDataRawValue);
                                if(nodeDataModel) {
                                    node.set({ 'Data': nodeClassModel });
                                }
                            }
                            
                            nodeForm.setModel(node);
                            isMenu ? nodeData.hide() : nodeData.show();
                            nodePopup.setTitle('Редактировать '+ (isMenu ? 'Меню' : 'Данные'));
                            nodePopup.open();
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
                            if(_.include(['addData', 'editData'], self._nodeFormMode)) {
                                nodeConfig.Data = data;
                            }
                            if(_.include(['addMenu', 'editMenu'], self._nodeFormMode)) {
                                nodeConfig.scheme = 'yellow';
                            }
                            if(_.include(['addMenu', 'addData'], self._nodeFormMode)) {
                                self._collection.add(nodeConfig, {silent: false});
                            } else if(_.include(['editMenu', 'editData'], self._nodeFormMode)) {
                                var node = self._collection.getNode(path);
                                node.set({ 'Name': name });
                                if(self._nodeFormMode === 'editData') {
                                    node.set({ 'Data': data });
                                }
                            }
                            nodePopup.close();
                            diagram.show();
                            createDiagramButtonContainer.hide();
                            // trigger change in diagram
                            self._isDirty = true;
                            self.trigger('dirtychange');
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
                        self._nodeFormMode = 'addData';
                        var model = new ReportNode({});
                        self._currentNode = model;
                        nodeForm.setModel(model);
                        nodeData.show();
                        nodePopup.setTitle('Добавить Данные');
                        nodePopup.open();
                    }
                }),
                createDiagramButtonContainer = new Container().add(createDiagramButton);

            nodeForm.setModel(new ReportNode({}));
            nodeForm.setLocal(true);

            diagram.on('addnode', function(path, node){
                self._selectedNode = { path: path, node: node };
            });
            nodeData.on('beforeenableselect', function(e, current, path, rootPath){
                // disabled selecting classes as value for Data field
                if(path === rootPath) {
                    e.selectable = false;
                }
            });

            diagram.on('beforemove', function(pathTo, moveOptions){
                var nodeDepth = (pathTo.split("/").length - 1);
                if(nodeDepth === 1) {
                    moveOptions.isMovable = false;
                }
            });

            this._currentNode = null;
            this._nodeFormMode = 'addMenu';
            this._nodeForm = nodeForm;
            
            fieldReportConfig.hide();
            this.add(fieldReportName);
            this.add(fieldReportConfig);
            this.add(diagram);
            this.add(createDiagramButtonContainer);

            this._diagram = diagram;
            this._createDiagramButtonContainer = createDiagramButtonContainer;

            this.on('beforesave', function(e, isNew, attrs){
                attrs.Config = JSON.stringify(self._collection.serialize());
            });

            storeOriginalConfig.call(this);
            setConfigCollection.call(this);

            return this;
        },
        setModel: function(model) {
            this.parent().setModel.apply(this, arguments);
            if(!model) return this;

            storeOriginalConfig.call(this);
            setConfigCollection.call(this);
            
            return this;
        },
        cancel: function(){
            this.parent().cancel.apply(this, arguments);
            setConfigCollection.call(this);
            return this;
        }
    });

    function updateConfigErrors(collection) {
        if(collection.length > 0) {
            delete this._errors.Config;
        } else {
            this._errors.Config = 'Empty';
        }
        this.trigger('errorchange');
        this._model.trigger('error', this._model, this._errors);
    }

    function showConfigDiagram(length) {
        if(!this._createDiagramButtonContainer) {
            return;
        }
        if(length) {
            this._createDiagramButtonContainer.hide();
        } else {
            this._createDiagramButtonContainer.show();
        }
    }

    function onCollectionUpdate(self) {
        updateConfigErrors.call(self, this);
        self._isDirty = true;
        self.trigger('dirtychange');
        showConfigDiagram.call(self, self._collection.length);
    }

    function setConfigCollection(isClear) {
        var data = [];
        if(!isClear) {
            _.each(this._originalConfigData, function(item){
                data.push(_.extend({}, item));
            });
        }
        var self = this,
            collection;
        if(this._FormReportNodes) {
            collection = new this._FormReportNodes(data,{
                local: true
            });
        }
        this._collection = collection;
        if(!this._collection) {
            return this;
        }
        this._collection.on('add', function() {
            onCollectionUpdate.call(this, self);
        });
        this._collection.on('remove', function() {
            onCollectionUpdate.call(this, self);
        });
        this._collection.on('move', function() {
            onCollectionUpdate.call(this, self);
        });
        
        this._diagram && this._diagram.setCollection(collection);
        showConfigDiagram.call(this, data.length);

        updateConfigErrors.call(this, collection);
        self._isDirty = false;
        this.trigger('dirtychange');
    }

    function storeOriginalConfig() {
        var self = this;
        this._originalConfigData = [];
        var configData = this.model.get('Config');
        _.each(configData, function(item){
            self._originalConfigData.push(_.extend({}, item));
        });
    }
})();