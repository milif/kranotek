App.defineView('ToolbarHover', {

    tagName: "div",
    className: "b-toolbarhover effect-autohide",

    tpl: _.template('<div class="b-toolbarhover-h _items{cid}"></div>'),
    init: function(){
    },    
    doRender: function(){
    
        var self = this;

        this.$el.append($(this.tpl({
            cid: this.cid
        })));
        
        this._items = this.$el.find('._items'+this.cid);        
        
        return this;    
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
            
                      
            this._presenterOnce = true;
        }
        
    },
    add: function(component){
        this._items.append(component.$el);
    },
    setPanel: function(el){
        this.$el.appendTo(el.$el || el);
        return this;
    }
});
