App.defineView('FieldTextarea', {

    extend: 'Field',
    
    options: {
        label: '',
        name: null
    },    
        
    itemTpl: _.template(
        '<textarea id="{name}{cid}" rows="3" name="{name}"></textarea>'
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
        
        this.$el.find('textarea')
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
        this.$el.find('textarea').val(this._value);
    }    
});
