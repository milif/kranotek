/*
 * @require App.js
 */

App.defineView('Container', {

    tagName: "div",
    className: "",
    ctype: 'container',

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
    doLayout: function(){
        this.parent().doLayout.apply(this, arguments);
        this._items.find('>[data-component]').each(function(){
            $(this).data('component').layout();
        });
        return this; 
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
         
            this._presenterOnce = true;
        }
        
    },
    add: function(component){
        this._items.append(component.$el || component);
        if(this.$el.is(':visible') && component.layout) component.layout();
        return this;
    }
});
