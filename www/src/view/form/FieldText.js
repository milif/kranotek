App.defineView('FieldText', {

    extend: 'Field',
    
    options: {
        label: '',
        name: null
    },    
        
    itemTpl: _.template(
        '<input id="{name}{cid}" name="{name}" type="text"/>'
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
        
        this.$el.find('input')
            .on('input paste keyup propertychange', function(){
                self._value = $(this).val();
                self.trigger('change');
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
    setValue: function(v){
        this.parent().setValue.apply(this, arguments);
        this.$el.find('input').val(this._value);
    }    
});
