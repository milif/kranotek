App.defineView('Button', {

    tagName: "a",
    className: "btn",
    attributes: {
        'href': "javascript:void(0)"
    },

    options: {
        icon: null,
        text: null,
        size: null,
        type: null,
        tooltip: null,
        disabled: null
    },

    init: function(){
        var self = this;
        if(this.options.click) this.on('click', this.options.click);
        this.$el.on('click', function(){
            if($(this).is('.disabled')) {
                self.trigger('disableclick');
                return;
            }
            self.trigger('click');
        });
    },    
    doRender: function(){
    
        var self = this;
    
        if(this.options.size) this.$el.addClass('btn-' + this.options.size);
    
        if(this.options.icon) this.$el.append('<i class="'+this.options.icon+'"></i>'); 
        if(this.options.text) this.$el.append(this.options.text);    
        if(this.options.type) this.$el.addClass('btn-'+this.options.type);
        if(this.options.tooltip) {
            new (App.getView('Tooltip'))({
                target: this.$el,
                text: this.options.tooltip,
                position: 'bottom'
            });
        }
        
        if(this.options.disabled) this.disable();
        
        return this;    
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
                                  
            this._presenterOnce = true;
        }
        
    },
    enable: function(){
        this.$el.removeClass('disabled');
        return this;
    },
    disable: function(){
        this.$el.addClass('disabled');
        return this;
    }
});
