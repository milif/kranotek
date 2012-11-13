/*
 * @id 507c059155ee6 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require view/form/Field.js
 * @require CollectionNested.js
 * @require view/form/FieldTrigger.js
 * @require view/Popup.js 
 * @require view/NestedList.js
 */
(function(App){
    App.defineView('FieldSelect', {

        extend: 'Field',

        options: {
            label: '',
            options: null,
            collection: null,
            name: null,
            details: null,
            hasEmpty: false,
            emptyText: 'Не выбран'
        },

        itemTpl: _.template(
            '<select id="{name}{cid}" name="{name}"></select>'
        ),
        init: function(){
            this.parent().init.call(this);
        },
        doRender: function(){

            this.parent().doRender.call(this);

            var self = this,
                options =  this.options,
                collection = this.collection,
                items = options.options || {};
            
            if(collection) this.setCollection(collection);
            else this.setOptions(items);

            if(this.options.details) {
                var selectEl = getSelectEl.call(this);
                selectEl.width(175);
                var fieldElement = selectEl.parent();
                fieldElement.append($('<span>&nbsp;</span>'));
                fieldElement.append(this.options.details.$el);
            }
            
            return this;
        },
        doPresenter: function(){

            var isOnce = this._presenterOnce;

            this.parent().doPresenter.call(this);

            if(!isOnce) {

            }
            return this;
        },
        setCollection: function(collection, displayIndex){
            if(this.collection) {
                this.collection.off(null, null, this);
            }
            this.collection = collection;
            if(!collection) return this;

            if( collection instanceof App.getCollection('CollectionNested')) {
                setCollectionNested.call(this, collection);
                return this;
            }
            
            var self = this,
                selectEl=getSelectEl.call(this);
            
            collection
                .on('add', function(model, collection, options){
                    if(this.options.hasEmpty) options.index++;
                    var text = displayIndex ? model.get(displayIndex).toString() : model.toString();
                    var optionEl = $(createOption.call(this, model.id, text)),
                        prevEl = selectEl.find('>:eq('+options.index+')');
                    if(prevEl.length>0) {
                        optionEl.insertBefore(prevEl);
                    } else {
                        optionEl.appendTo(selectEl);
                    }
                }, this)
                .on('remove', function(model){
                    selectEl.find('[value="'+model.id+'"]').remove();
                }, this);    
            
            if(!collection.isLocal()) {
                if(!this._refreshButton) {
                    var selectEl = getSelectEl.call(this),
                        refreshButton = new (App.getView('Button'))({
                            icon: 'icon-refresh',
                            tooltip: 'Обновить список',
                            click: function(){
                                self.collection.fetch({
                                    silent: false,
                                    complete: function(){
                                        renderCollection.call(self, displayIndex);
                                    }
                                });                                
                            }
                        });
                    var fieldElement = selectEl.parent();
                    fieldElement.append($('<span>&nbsp;</span>'));
                    fieldElement.append(refreshButton.$el);           
                    this._refreshButton = refreshButton;
                }
                this._refreshButton.show();
            } else {
                this._refreshButton && this._refreshButton.hide();
            }
            if(!collection.isFetched()) {
                collection.fetch({
                    silent: false,
                    complete: function(){
                        renderCollection.call(self, displayIndex);
                    }
                });             
            } else {
                renderCollection.call(this, displayIndex);
            }
            
            return this;
        },
        setOptions: function(items){
        
            var options = this.options.hasEmpty ? '<option value="">'+this.options.emptyText+'</option>' : '';
            
            if($.isArray(items)) {
                for(var i=0;i<items.length;i++){
                    options+=createOption.call(this, items[i].value, items[i].text);
                }
            } else {
                /*if(items['null']) {
                    options+='<option value="">'+items['null']+'</option>';
                }*/
                if(items) for(var p in items){
                    if(p !== 'null') {
                        options+=createOption.call(this, p, items[p]);
                    }
                }            
            }           
            
            getSelectEl.call(this).html(options);
        },
        setReadOnly: function(isReadOnly){
            if( this._isReadOnly === isReadOnly ) return;
            
            var self = this,
                selectEl = getSelectEl.call(this);
            
            this._isReadOnly = isReadOnly;
            
            if(isReadOnly) selectEl.attr('disabled', true);
            else selectEl.removeAttr('disabled');     
        }
    });
    function renderCollection (displayIndex){
        var items = [];
                    
        this.collection.each(function(model){
            var text = displayIndex ? model.get(displayIndex).toString() : model.toString();
            items.push({text: text, value: model.id||model.cid});
        });
            
        this.setOptions(items);        
    }
    function getSelectEl(){
        if(!this._selectEl) {
            var self = this,
                options = this.options;
    
            this._itemEl.append(this.itemTpl({
                cid: this.cid,
                name: this.options.name
            }));

            this._selectEl = this.$el.find('select')
                .on('change', function(){
                    self.setValue($(this).val());
                });

            this.setReadOnly(this.options.readonly);
            
            this.on('change', function(){
                this._selectEl.val(this._value+"");
            });
        }
        if(this._selectEl.parent().length==0){
            this._itemEl
                .children().detach().end()
                .append(this._selectEl);
        }
        return this._selectEl;
     
    }
    function setCollectionNested(collection){
        if(!this._fieldTrigger) {
            var self = this;
            this._fieldTrigger = new (App.getView('FieldTrigger'))({
                listeners: {
                    'trigger': function(){
                        openPopupNested.call(self);
                    }
                }
            });
            this._fieldTrigger.setValue(this.getValue() || this.options.emptyText);
            this.on('change', function(){
                this._fieldTrigger.setValue(this.getValue() || this.options.emptyText);
            });
        }
        if(this._fieldTrigger.$el.parent().length==0) {
            this._itemEl
                .children().detach().end()
                .append(this._fieldTrigger.$el);
        }
    }
    function openPopupNested(){
        if(!this._popupNested){
            var self = this,
                popup = new (App.getView('Popup'))({
                    popupWidth: 700
                })
                    .setTitle(this.options.emptyText+":"),
                nestedList = new (App.getView('NestedList'))({
                    listeners: {
                        'appendlist': function(path, toolbar){
                            var nestedlist = this,
                                buttonSelect = new (App.getView('Button'))({
                                    disabled: true,
                                    size: 'small',
                                    icon:'icon-ok',
                                    tooltip: 'Выбрать',
                                    click: function(){
                                        var node=nestedlist.getListNode(path);
                                        self.setValue(nestedlist.collection.getNode(node));
                                        popup.close();
                                    }
                                });
                            toolbar.add(buttonSelect);
                            toolbar.buttonSelect = buttonSelect;
                        },
                        'selectionchange': function(selected){
                        
                            var current = selected[0],
                                toolbars = this.getToolbars();
                                
                            for(var path in toolbars){
                                var isSelectable = current!=this.collection.rootPath && current!=path && this.collection.isDescendant(path, current),
                                    e ={selectable: isSelectable};
                                self.trigger('beforeenableselect', e, current);
                                if(e.selectable){
                                    toolbars[path].buttonSelect.enable();
                                } else {
                                    toolbars[path].buttonSelect.disable();
                                }
                            }
 
                        }                                           
                    }
                });
            popup.add(nestedList);
            this._popupNested = popup;
            this._nestedList = nestedList;
        }
        this._nestedList
            .setCollection(this.collection);
        
        this._popupNested.open();
    }
    function createOption(key, value){
        return '<option value="'+key+'" '+(key==this.getValue()?'selected':'')+'>'+value+'</option>';
    }
})(App);

