App.defineView('FieldSelect', {

    extend: 'Field',
    
    options: {
        label: '',
        options: null,
        name: null
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
        
        if(items) for(var p in items){
           options+='<option value="'+p+'">'+items[p]+'</option>'; 
        }
        
        this._itemEl.append(this.itemTpl({
            cid: this.cid,
            name: this.options.name
        }));
        
        this.$el.find('select')
            .append(options)
            .on('change', function(){
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
        this.$el.find('select').val(this._value+"");
    }    
});
