/*
 * @id 507c059155ee6 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require view/form/Field.js
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
            
            if(options.hasEmpty && options.options && !options.options['null']) options.options['null'] = options.emptyText;
            
            this._itemEl.append(this.itemTpl({
                cid: this.cid,
                name: this.options.name
            }));

            this._selectEl = this.$el.find('select')
                .on('change', function(){
                    self.setValue($(this).val());
                });

            this.setReadOnly(this.options.readonly);

            if(collection) this.setCollection(collection);
            else this.setOptions(items);

            if(this.options.details) {
                this._selectEl.width(175);
                var fieldElement = this._selectEl.parent();
                fieldElement.append($('<span>&nbsp;</span>'));
                fieldElement.append(this.options.details.$el);
            }

            this.on('change', function(){
                this._selectEl.val(this._value+"");
            });
            
            return this;
        },
        doPresenter: function(){

            var isOnce = this._presenterOnce;

            this.parent().doPresenter.call(this);

            if(!isOnce) {

            }
            return this;
        },
        setCollection: function(collection){
            if(this.collection) {
                this.collection.off(null, null, this);
            }
            this.collection = collection;
            if(!collection) return this;

            collection
                .on('add', function(model, collection, options){
                    if(this.options.hasEmpty) options.index++;
                    var optionEl = $(createOption.call(this, model.id, model.toString())),
                        prevEl = this._selectEl.find('>:eq('+options.index+')');
                    if(prevEl.length>0) {
                        optionEl.insertBefore(prevEl);
                    } else {
                        optionEl.appendTo(this._selectEl);
                    }
                }, this)
                .on('remove', function(model){
                    this._selectEl.find('[value="'+model.id+'"]').remove();
                }, this);
                
            var items = [];
            if(this.options.hasEmpty) items.push({text:this.options.emptyText, value: ""});
            
            collection.each(function(model){
                items.push({text: model.toString(), value: model.id||model.cid});
            });
            
            this.setOptions(items);
            
            return this;
        },
        setOptions: function(items){
        
            var options = '';        
            
            if($.isArray(items)) {
                for(var i=0;i<items.length;i++){
                    options+=createOption.call(this, items[i].value, items[i].text);
                }
            } else {
                if(items['null']) {
                    options+='<option value="">'+items['null']+'</option>';
                }
                if(items) for(var p in items){
                    if(p !== 'null') {
                        options+=createOption.call(this, p, items[p]);
                    }
                }            
            }           
            
            this._selectEl.html(options);
        },
        setReadOnly: function(isReadOnly){
            if( this._isReadOnly === isReadOnly ) return;
            
            var self = this;
            
            this._isReadOnly = isReadOnly;
            
            if(isReadOnly) this._selectEl.attr('disabled', true);
            else this._selectEl.removeAttr('disabled');     
        }     
    });
    
    function createOption(key, value){
        return '<option value="'+key+'" '+(key==this.getValue()?'selected':'')+'>'+value+'</option>';
    }
})(App);

