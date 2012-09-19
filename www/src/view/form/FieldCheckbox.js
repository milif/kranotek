App.defineView('FieldCheckbox', {

    extend: 'Field',
    
    options: {
        label: '',
        options: null,
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
        
        this.$el.find('input')
            .on('click', function(){
                self._value = $(this).is(':checked');
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
        var item = this.$el.find('input');
        if(v) item.attr('checked', true);
        else item.removeAttr('checked');
    }    
});
