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
        
        this.$el.find('input')
            .on('input paste keyup propertychange', function(){
                self._value = $(this).val();
                self.trigger('change');
            });        
    },
    setValue: function(v){
        this.parent().setValue.apply(this, arguments);
        if(!this._isReadOnly) {
            this.$el.find('input').val(this._value);
        } else {
            this.$el.find('._input'+this.cid).text(this._value);
        }
    }    
});
