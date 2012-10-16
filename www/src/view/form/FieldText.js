/*
 * @id 507c059155e01 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require view/form/Field.js
 */
App.defineView('FieldText', {

    extend: 'Field',
    
    options: {
        label: '',
        readonly: false,
        name: null
    },    
        
    itemTpl: _.template(
        '<input id="{name}{cid}" name="{name}" value="{value}" type="text"/>'
    ),
    itemReadOnlyTpl: _.template(
        '<span class="input uneditable-input _input{cid}">{value}</span>'
    ),
    init: function(){
        this.parent().init.call(this);
    },   
    doRender: function(){
    
        this.parent().doRender.call(this);
    
        var self = this;             
        
        this.setReadOnly(this.options.readonly);
        
        this.on('change', function(){
            if(!this._isReadOnly) {
                this.$el.find('input[type="text"]').val(this._value);
            } else {
                this.$el.find('._input'+this.cid).text(this._value);
            }
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
        
        this._itemEl
            .children().remove().end()
            .append((!isReadOnly ? this.itemTpl : this.itemReadOnlyTpl)({
                cid: this.cid,
                name: this.options.name,
                value: this._value || ""
            }));
        if(this.options.width) this._itemEl
            .children().width(this.options.width);
        this.$el.find('input[type="text"]')
            .on('input paste keyup propertychange', function(){
                self.setValue($(this).val());
            });        
    } 
});
