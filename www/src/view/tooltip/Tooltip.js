App.defineView('Tooltip', {

    options: {
        text: '',
        target: null,
        position: 'top',
        type: null,
        trigger: 'hover'
    },
    
    init: function(){
        this._tooltip = $(this.options.target).tooltip({
            placement: this.options.position,
            trigger: this.options.trigger,
            title: this.options.text
        }).data('tooltip');
        if(this.options.type) this._tooltip.tip().addClass('mod_'+this.options.type);
    },    
    doRender: function(){
    
        var self = this;
        
        this._items = this.$el.find('._items'+this.cid);        
        
        return this;    
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
            
                      
            this._presenterOnce = true;
        }
        
    },
    setText: function(text){
        if(this._tooltip.options.title == text) return;
        this._tooltip.options.title = text;
        if(this._tooltip.tip().is(':visible')) {
            this._tooltip.tip().find('.tooltip-inner').html(text);
        }
        return this;
    },
    hide: function(){
        this._tooltip.hide();
        return this;
    },
    destroy: function(){
        this._tooltip.destroy();
        return this;
    },    
    show: function(){
        if(this._tooltip.tip().is(':visible')) return  this;
        this._tooltip.show();
        return this;
    }
});
