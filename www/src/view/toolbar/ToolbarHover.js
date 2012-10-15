/*
 * @require b/toolbarhover.css
 * @require view/toolbar/Toolbar.js
 */
 
App.defineView('ToolbarHover', {

    extend: 'Toolbar',

    hoverTpl: _.template('<div class="b-toolbarhover effect-autohide"><div class="b-toolbarhover-h _toolbar{cid}"></div></div>'),
    init: function(){
    },    
    doRender: function(){
        
        this.parent().doRender.apply(this, arguments);
        
        var self = this;
        
        var el = $(this.hoverTpl({
            cid: this.cid
        }));
        
        this._toolbar = el.find('._toolbar'+this.cid)
            .append(this.$el);
        
        this.$el = el;
        
        return this;
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
            
                      
            this._presenterOnce = true;
        }
        
        this.parent().doPresenter.apply(this, arguments);
        
        return this;
    },
    setPanel: function(el){
        var self = this;
        this.$el.appendTo(el.$el || el);
        return this;
    }
});
