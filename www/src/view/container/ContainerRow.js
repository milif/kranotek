/*
 * @require App.js
 */
App.defineView('ContainerRow', {

    tagName: "div",
    className: "",

    options: {
        fluid: true
    },

    init: function(){
        this.$el.addClass('row' + (this.options.fluid ? '-fluid' : '') );
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
    add: function(component, index, offset){
        component.$el
            .addClass( 'span' + index + ( offset ? ' offset' + offset : '' ) );
        this._items.append(component.$el);
        return this;
    }
});
