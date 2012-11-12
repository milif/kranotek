/*
 * @id 508b8f2a2c3b5 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require modules/class/collection.Class.js
 * @require modules/class/collection.ClassPresenter.js
 * @require modules/class/model.Class.js
 * @require modules/class/model.ClassPresenter.js
 * @require view/container/Container.js
 * @require view/Popup.js
 * @require view/button/Button.js
 * @require view/Form/Form.js
 * @require view/Form/FieldText.js
 * @require view/Form/FieldSelect.js
 * @require modules/class/view.ViewAsTableConfig.js
 */
(function(){
    App.defineView('ClassPresenter', {

        extend: 'Container',

        options: {
            fluid: true,
            model: null
        },
        init: function(){
            this.parent().init.apply(this, arguments);
            this.$el.addClass('b-classpresenter');
        },
        doRender: function(){
        
            this.parent().doRender.apply(this, arguments);
            
            var self = this;
                 
            this.add(tpl({
                cid: this.cid
            }));

            var CollectionPresenter = App.getCollection('ClassPresenter'),
                ModelPresenter = App.getModel('ClassPresenter'),
                Popup = App.getView('Popup'),
                Grid = App.getView('Grid'),
                Button = App.getView('Button'),
                Form = App.getView('Form'),
                FieldText = App.getView('FieldText'),
                FieldSelect = App.getView('FieldSelect'),
                fieldName = new FieldText({
                    label: 'Название',
                    name: 'Name'
                }),
                fieldFunction = new FieldSelect({
                    label: 'Источник данных',
                    hasEmpty: true,
                    name: 'FunctionId'
                }),
                fieldType = new FieldSelect({
                    label: 'Отображать как',
                    name: 'Type',
                    hasEmpty: true,
                    options: ModelPresenter.TypesValues
                }),
                fieldConfig = new FieldText({
                    label: 'Название',
                    name: 'Config'
                }),
                form = new Form({
                    listeners: {
                        'beforesave': function(e, isNew, attrs){
                            updateConfigValue.call(self);
                        },
                        'save': function(isNew){
                            var model = this.getModel();
                            if(isNew) {
                                presenterGridCollection.add([model],{silent: false});
                            }
                            popup.close();
                        }
                    }
                })
                    .add(fieldName)
                    .add(fieldFunction)
                    .add(fieldType)
                    .add(fieldConfig),
                popup = new Popup({
                    title: 'Title',
                    popupWidth: 700
                })
                    .add(form),

                addButton = new Button({
                    tooltip: 'Добавить значение',
                    size: 'small',
                    icon: 'icon-plus',
                    click: function(){
                        editPresenter.call(self);
                    }
                }),
                removeButton =  new Button({
                    disabled: true,
                    size: 'small',
                    tooltip: 'Удалить представление',
                    icon: 'icon-remove',
                    click: function(){
                        var ids = presenterGrid.getSelection(),
                            model = presenterGrid.collection.get(ids[0]);
                        App.msg.okcancel({
                            title: 'Удаление представления',
                            text: 'Вы действительно хотите удалить представление?',
                            callback: function(){
                                if(model) model.destroy({
                                    wait: true,
                                    silent:false
                                });
                            }
                        });
                    }
                }),
                presenterGrid = new Grid({
                    selectable: true,
                    columns: [
                        { name: 'Название', key: 'Name', width: 1 },
                        { name: 'Функция', key: 'FunctionId', width: 1, render: function(value){
                            var collectionFunctions = self.model.getCollectionFunctions(),
                                model = collectionFunctions && collectionFunctions.get(value),
                                name = model && model.get('Name');
                            return name || '';
                        }},
                        { name: 'Тип отображения', key: 'Type', width: 1, render: function(value){
                            return this.collection.model.TypesValues[value] || '';
                        }}
                    ],
                    listeners: {
                        'selectionchange': function(id){
                            var model = this.collection.get(id);
                            editPresenter.call(self, model);
                            if(model) {
                                removeButton.enable();
                            } else {
                                removeButton.disable();
                            }
                        }
                    }
                });
            
            presenterGrid.getToolbar()
                .add(addButton, 1)
                .add(removeButton, 2);

            popup.hide();
            fieldConfig.hide();

            this.add(presenterGrid);
            this.add(popup);

            fieldType.setReadOnly(true);

            fieldFunction.on('change', function(){
                if(!this._value) {
                    fieldType.setValue('');
                }
                fieldType.setReadOnly(!this._value);
            });
            fieldType.on('change', function(){
                setupConfigView.call(self);
            });

            this._popup = popup;
            this._form = form;
            this._fieldName = fieldName;
            this._fieldFunction = fieldFunction;
            this._fieldType = fieldType;
            this._fieldConfig = fieldConfig;
            this._presenterGrid = presenterGrid;
            //this._presenterGridCollection = presenterGridCollection;
            this._ModelPresenter = ModelPresenter;

            this.setModel(this.model);

            return this;
        },
        setModel: function(model){
            if(!model) return this;
            
            this.model = model;
            
            this._presenterGrid.setCollection(model.getCollectionPresenters());
            this._fieldFunction.setCollection(model.getCollectionFunctions());
                        
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
        '<div class="b-classpresenter{cid}"></div>'
    );

    function setupConfigView() {
        var self = this,
            model = this._popupModel;
        this._viewConfig && this._viewConfig.remove();
        if(this._fieldType.getValue()) {
            this._viewConfig = new (App.getView('ViewAs'+this._fieldType.getValue()+'Config'))();
            this._viewConfig.setConfig(model.get('Config') || {});
            this._form.add(this._viewConfig);
            this._viewConfig.on('edit', function(){
                updateConfigValue.call(self);
                self._form.trigger('dirtychange');
            });
        } else {
            this._viewConfig = null;
        }
    }

    function editPresenter(model){
        if(!model) {
            model = new this._ModelPresenter();
        }
        this._popupModel = model;
        this._form.setModel(model);
        setupConfigView.call(this);
        this._popup.setTitle(model.id ? model.get('Name'): 'Новое представление'); //!!! Исправлена ошибка
        this._popup.open();
        this._viewConfig && this._viewConfig.layout();
        this._fieldType.setReadOnly(!this._fieldFunction.getValue());
    }

    function updateConfigValue() {
        var config = (this._viewConfig && this._viewConfig.getConfig) ? this._viewConfig.getConfig() : undefined;
        this._fieldConfig.setValue(config);
    }

})();
