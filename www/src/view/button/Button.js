App.defineView('Button', {

    tagName: "a",
    className: "btn",
    attributes: {
        'href': "javascript:void(0)"
    },

    options: {
        icon: null,
        size: 'small'
    },

    init: function(){
        var self = this;
        this.$el.on('click', function(){
            self.trigger('click');
        });
    },    
    doRender: function(){
    
        var self = this;
    
        this.$el.addClass('btn-' + this.options.size);
    
        if(this.options.icon) this.$el.append('<i class="'+this.options.icon+'"></i>');     
        
        return this;    
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
                                  
            this._presenterOnce = true;
        }
        
    }
});
