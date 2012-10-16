/*
 * @id 507c059155ee6 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require view/form/Field.js
 */
App.defineView('FieldSelect', {

    extend: 'Field',

    options: {
        label: '',
        options: null,
        name: null,
        details: null
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
            items = this.options.options,
            options = '';

        if(items['null']) {
            options+='<option value="">'+items['null']+'</option>';
        }
        if(items) for(var p in items){
            if(p !== 'null') {
                options+='<option value="'+p+'">'+items[p]+'</option>';
            }
        }
        
        this._itemEl.append(this.itemTpl({
            cid: this.cid,
            name: this.options.name
        }));

        this._selectEl = this.$el.find('select');

        this.setReadOnly(this.options.readonly);

        this._selectEl
            .append(options)
            .on('change', function(){
                self.setValue($(this).val());
            });

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
    setReadOnly: function(isReadOnly){
        if( this._isReadOnly === isReadOnly ) return;
        
        var self = this;
        
        this._isReadOnly = isReadOnly;
        
        if(isReadOnly) this._selectEl.attr('disabled', true);
        else this._selectEl.removeAttr('disabled');     
    }     
});
