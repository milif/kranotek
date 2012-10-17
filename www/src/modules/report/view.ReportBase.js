/*
 * @id 507ea0e8efc21 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */

/*
* @require view/container/Container.js
* @require view/Grid.js
* @require view/NestedList.js
* @require view/button/Button.js
* @require view/tabbar/Tabbar.js
* @require view/form/Form.js
* @require view/form/FieldTextarea.js
* @require view/form/FieldText.js
* @require view/form/FieldCheckbox.js
* @require modules/report/collection.ReportContextSource.js
* @require modules/class/collection.ClassFunction.js
* @require modules/class/collection.ClassFunctionField.js
* @require modules/report/model.ReportContextSource.js
* @require modules/class/model.ClassFunction.js
* @require modules/class/model.ClassFunctionField.js
*/
(function(){
    App.defineView('ReportBase', {
        extend: 'Container',
        options: {
            fluid: true
        },
        init: function(){
            this.parent().init.apply(this, arguments);
        },
        doRender: function(){
            this.parent().doRender.apply(this, arguments);
            var self = this,
            mainGrid = new Grid({
                selectable: true,
                columns: [
                    { name: 'Название', key: 'Name', width: 1 }
                ],
                listeners: {
                    'selectionchange': function(id){
                        var model = this.collection.get(id);
                        (model && model.id) ? contextContainer.show() : contextContainer.hide();
                        updateContextGrid.call(self);
                    }
                }
            }),
            contextGrid = new Grid({
                selectable: true,
                columns: [
                    { name: 'Название', key: 'Name', width: 1 }
                ]
            }),
            contextContainer = new Container({});

            this._mainGrid = mainGrid;
            this._contextGrid = contextGrid;
            this._contextContainer = contextContainer;
            this._contextNestedListSelected = undefined;

            this.add(mainGrid);
            this.add(contextContainer);
            this.add(contextGrid);
        },
        doPresenter: function(){
            var isOnce = this._presenterOnce;
            this.parent().doPresenter.apply(this, arguments);
        },
        setSource: function(collection, columns) {
            this._mainGrid.setCollection(collection);
            if(columns) {
                this._mainGrid.changeColumns(columns);
            }
            return this;
        },
        setSourceColumns: function(columns) {
            this._mainGrid.changeColumns(columns);
            return this;
        },
        setContextCollection: function(collection) {
            var self = this;
            if(!this._contextNestedList) {
                var contextNestedList = new (App.getView('NestedList'))({
                    collection: collection,
                    emptyText: 'Нет данных',
                    listeners: {
                        'beforeselectionchange': function(e, selected, deselected){
                            e.cancel = true;
                            this.select(selected[0], true);
                            var current = selected[0],
                                model = this.collection.getNode(current);
                            self._contextNestedListSelected = model;
                            updateContextGrid.call(self);
                        }
                    }
                });
                this._contextNestedList = contextNestedList;
                this._contextContainer.hide();
                this._contextContainer.add(this._contextNestedList);
                return this;
            }

            this._contextNestedList.setCollection(collection);

            return this;
        },
        setContextSource: function(collection, columns) {
            this._contextGrid.setCollection(collection);
            if(columns) {
                this._contextGrid.changeColumns(columns);
            }
            return this;
        },
        setContextSourceColumns: function(columns) {
            this._contextGrid.changeColumns(columns);
            return this;
        }
    });

    var Grid = App.getView('Grid'),
        Container = App.getView('Container');

    function updateContextGrid() {
        var mainGridSelected = this._mainGrid.getSelection(),
            contextCollection;
        if((typeof mainGridSelected[0] !== 'undefined') &&
            this._contextNestedListSelected) {
            contextCollection = this._contextNestedListSelected.getContextSource(mainGridSelected[0]);
        }
        if(contextCollection) {
            this.setContextSource(contextCollection);
        }
    }

})();