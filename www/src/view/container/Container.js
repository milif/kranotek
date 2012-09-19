App.defineView('Container', {

    tagName: "div",
    className: "",

    options: {
        fluid: true
    },

    init: function(){
        this.$el.addClass('container' + (this.options.fluid ? '-fluid' : '') );
    },    
    doRender: function(){
    
        var self = this;
        
        this._items = this.$el;        
        
        return this;    
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
         
            this._presenterOnce = true;
        }
        
    },
    add: function(component){
        this._items.append(component.$el);
        return this;
    }
});
