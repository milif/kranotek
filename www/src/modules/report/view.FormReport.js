/*
 * @id 509436428eed3 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require modules/report/formreport.css

 * @require CollectionNested.js
 * @require view/button/Button.js  
 * @require view/Dropdown.js  
 * @require view/form/Form.js  
 * @require view/form/FieldText.js  
 * @require view/container/Container.js 
 * @require view/Diagram.js
 * @require view/Popup.js
 * @require modules/report/model.Report.js
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
                 
            App.defineModel('TestModel', {
                api: 'node',
                toString: function(){
                    return this.get('Name');
                }
            });
            App.defineCollection('TestCollection', {
                extend: 'CollectionNested',
                model: App.getModel('TestModel')
            });

            App.defineModel('ReportNode', {
                defaults: {                    
                    'Name': '',
                    'Data': ''
                }
            });
            
            var ReportNode = App.getModel('ReportNode'),
                // reportNode = new ReportNode(),
                TestCollection = App.getCollection('TestCollection'),
                Diagram = App.getView('Diagram'),
                Dropdown = App.getView('Dropdown'),
                Button = App.getView('Button'),
                Form = App.getView('Form'),
                Container = App.getView('Container'),
                Popup = App.getView('Popup'),
                FieldText = App.getView('FieldText'),
                fieldReportName = new FieldText({
                    label: 'Название отчета',
                    name: 'Name'
                }),
                fieldReportConfig = new FieldText({
                    label: 'Config',
                    name: 'Config'
                });

                this._TestCollection = TestCollection;
                setEmptyCollection.call(this);

                var diagram = new Diagram({
                    collection: self._collection,
                    listeners: {
                        'addnode': function(path, node){
                            var menu = new Dropdown();
                            if(node.get('scheme') === 'yellow') {
                                menu.addButton(new Button({
                                    text: 'Добавить Меню',
                                    click: function(){
                                        self._nodeFormMode = 'addMenu';
                                        var model = new ReportNode({
                                            path: path
                                        });
                                        self._currentNode = model;
                                        nodeForm.setModel(model);
                                        nodeData.hide();
                                        nodePopup.setTitle('Добавить Меню');
                                        nodePopup.open();
                                    }
                                }));
                                menu.addButton(new Button({
                                    text: 'Добавить Данные',
                                    click: function(){
                                        self._nodeFormMode = 'addData';
                                        var model = new ReportNode({
                                            path: path
                                        });
                                        self._currentNode = model;
                                        nodeForm.setModel(model);
                                        nodePopup.setTitle('Добавить Данные');
                                        nodeData.show();
                                        nodePopup.open();
                                    }
                                }));
                                menu.addSeparator();
                            }
                            menu.addButton(new Button({
                                text: 'Удалить',
                                click: function(){
                                    self._collection.remove(node, {silent: false});
                                }
                            }));
                            menu.addSeparator();
                            menu.addButton(new Button({
                                text: 'Переместить',
                                click: function(){
                                }
                            }));
                            
                            this.setMenu(path, menu);
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
                nodeData = new FieldText({
                    label: 'Данные',
                    name: 'Data'
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

            diagram.hide();
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

            updateConfigErrors.call(this, this._collection);
            return this;
        },
        cancel: function(){
            this.parent().cancel.apply(this, arguments);
            setEmptyCollection.call(this);
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
        this.model.trigger('change');
        this.trigger('errorchange');
    }

    function setEmptyCollection() {
        var self = this,
            collection = new this._TestCollection([],{
                local: true
            });
        this._collection = collection;
        this._collection.on('add', function() {
            updateConfigErrors.call(self, this);
        });
        this._collection.on('remove', function() {
            updateConfigErrors.call(self, this);
        });

        this._diagram && this._diagram.setCollection(collection);
        this._createDiagramButtonContainer && this._createDiagramButtonContainer.show();
    }
})();