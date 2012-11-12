/*
 * @id 508bd6240f30b - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
* @require view/Grid.js
* @require view/button/Button.js
* @require view/Form/FieldText.js
* @require view/Form/FieldCheckbox.js
 */
(function(){
    App.defineView('ViewAsTableConfig', {

        extend: 'Container',

        options: {
            fluid: true
        },
        init: function(){
            this.parent().init.apply(this, arguments);
            this.$el.addClass('b-viewastableconfig');
        },
        doRender: function(){
            this.parent().doRender.apply(this, arguments);

            var self = this;
                 
            this.add(tpl({
                cid: this.cid
            }));

            App.defineModel('ViewAsTableConfig', {
                defaults: {
                    'title': '',
                    'fieldName': '',
                    'columnWidth': '',
                    'isVisible': true
                }
            });
            App.defineCollection('ViewAsTableConfig',{
                model: App.getModel('ViewAsTableConfig')
            });

            var FieldText = App.getView('FieldText'),
                FieldCheckbox = App.getView('FieldCheckbox'),
                Button = App.getView('Button'),
                ViewAsTableConfigCollection = new (App.getCollection('ViewAsTableConfig'))(null, {
                    local: true
                }),
                Grid = App.getView('Grid'),
                addButton = new Button({
                    tooltip: 'Добавить значение',
                    size: 'small',
                    icon: 'icon-plus',
                    click: function(){
                        var model = new self._model({});
                        self._collection.add(model , {silent: false});
                        self._grid.edit(model.cid);
                    }
                }),
                removeButton =  new Button({
                    disabled: true,
                    size: 'small',
                    tooltip: 'Удалить значение',
                    icon: 'icon-remove',
                    click: function(){
                        var ids = grid.getSelection(),
                            model = grid.collection.get(ids[0]);
                        App.msg.okcancel({
                            title: 'Удаление значения',
                            text: 'Вы действительно хотите удалить значение?',
                            callback: function(){
                                if(model) model.destroy({
                                    wait: true,
                                    silent:false
                                });
                            }
                        });
                    }
                }),
                grid = new Grid({
                    reorderable: true,
                    selectable: true,
                    columns: [
                        { name: 'Заголовок', key: 'title', width: 1, editor: new FieldText() },
                        { name: 'Название поля', key: 'fieldName', width: 1, editor: new FieldText() },
                        { name: 'Ширина столбца', key: 'columnWidth', width: 1, editor: new FieldText() },
                        { name: 'Видимо', key: 'isVisible', width: 1, align: 'center', editor: new FieldCheckbox() }
                    ],
                    listeners: {
                        'selectionchange': function(id){
                        }
                    }
                });

                grid.setCollection(ViewAsTableConfigCollection);

            grid.getToolbar()
                .add(addButton, 1)
                .add(removeButton, 2);

            this.add(grid);

            grid.on('edit moverow', function(){
                self.trigger('edit');
            });

            this._grid = grid;
            this._model = App.getModel('ViewAsTableConfig');
            this._collection = ViewAsTableConfigCollection;

            return this;

        },
        setConfig: function(config) {
            var self = this;
            _.each(config, function(item){
                self._collection.add(new self._model(item));
            });
        },
        getConfig: function(config) {
            return this._collection.toJSON();
        },
        layout: function() {
            this._grid.layout();
        }
    });

    var tpl = _.template(
        '<div class="b-viewastableconfig{cid}"></div>'
    );
})();
