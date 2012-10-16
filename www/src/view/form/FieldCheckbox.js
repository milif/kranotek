/*
 * @id 507c059155fc6 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require view/form/Field.js
 */
App.defineView('FieldCheckbox', {

    extend: 'Field',
    
    options: {
        label: '',
        readonly: false,
        name: null
    },    
        
    itemTpl: _.template(
        '<input type="checkbox" id="{name}{cid}" name="{name}"/>'
    ),
    init: function(){
        this.parent().init.call(this);
    },   
    doRender: function(){
    
        this.parent().doRender.call(this);
    
        var self = this;             
        
        this._itemEl.append(this.itemTpl({
            cid: this.cid,
            name: this.options.name
        }));
        
        this._inputEl = this.$el.find('input')
            .on('click', function(){
                self.setValue($(this).is(':checked'));
            });
        
        this.setReadOnly(this.options.readonly);
        
        this.on('change', function(){
            var item = this.$el.find('input');
            if(this._value) item.attr('checked', true);
            else item.removeAttr('checked');
        });        
        
        return this;    
    },
    setReadOnly: function(isReadOnly){
        if( this._isReadOnly === isReadOnly ) return;
        
        var self = this;
        
        this._isReadOnly = isReadOnly;
        
        if(isReadOnly) this._inputEl.attr('disabled', true);
        else this._inputEl.removeAttr('disabled');
               
    },
    doPresenter: function(){
    
        var isOnce = this._presenterOnce;
    
        this.parent().doPresenter.call(this);
        
        if(!isOnce) {
            
        }
        return this;
    }
});
