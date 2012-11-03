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
                }),

                collection = new TestCollection([
                    // { 'Name': 'Node 6', 'path':'/1/3/6' },
                    // { 'Name': 'Node 1', 'path':'/1' },
                    // { 'Name': 'Node 2', 'path':'/2' },
                    // { 'Name': 'Node 3', 'path':'/1/3', 'scheme': 'yellow' },
                    // { 'Name': 'Node 4', 'path':'/1/4' },
                    // { 'Name': 'Node 5', 'path':'/2/5' },
                    // { 'Name': 'Node 7', 'path':'/1/3/7' },
                    // { 'Name': 'Node 8', 'path':'/1/8' }
                ],{
                    local: true
                }),
                diagram = new Diagram({
                    collection: collection,
                    listeners: {
                        'addnode': function(path, node){
                            var menu = new Dropdown()
                                .addButton(new Button({
                                    text: 'Добавить Меню',
                                    click: function(){
                                        self._nodeFormMode = 'addMenu';
                                        var model = new ReportNode({
                                            path: path
                                        });
                                        self._currentNode = model;
                                        nodeForm.setModel(model);
                                        nodeName.setReadOnly(false);
                                        nodePopup.setTitle('Добавить Меню');
                                        nodePopup.open();
                                    }
                                }))
                                .addButton(new Button({
                                    text: 'Добавить Данные',
                                    click: function(){
                                        self._currentNode = node;
                                        self._nodeFormMode = 'addData';
                                        nodePopup.setTitle('Добавить Данные');
                                        nodeName.setReadOnly(true);
                                        nodeForm.setModel(self._currentNode);
                                        nodePopup.open();
                                    }
                                }))
                                .addSeparator()
                                .addButton(new Button({
                                    text: 'Удалить',
                                    click: function(){
                                        collection.remove(node, {silent: false});
                                    }
                                }))
                                .addSeparator()
                                .addButton(new Button({
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
                                path = self._currentNode && self._currentNode.get('path') || '';
                            if(self._nodeFormMode === 'addMenu') {
                                collection.add({
                                    'Name': name,
                                    'Data': data,
                                    'path':path+'/'+_.uniqueId('node'),
                                    'scheme': 'yellow',
                                    'moveable': true
                                }, {silent: false});
                            }
                            nodePopup.close();
                            diagram.show();
                            createDiagramButton.hide();
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
                        collection.reset();
                        self._nodeFormMode = 'addMenu';
                        var model = new ReportNode({
                            path: '/'
                        });
                        self._currentNode = model;
                        nodeForm.setModel(model);
                        nodeName.setReadOnly(false);
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

            this.on('beforesave', function(isNew){
                fieldReportConfig.setValue('asdfasdf23');
                self.model.set('Config', 'asdfasdf23');
            });

            return this;
        }
    });
})();
