/*
 * @require App.js
 */
 
App.defineView('Toolbar', {

    tagName: "div",
    className: "btn-toolbar",

    groupTpl: _.template('<div class="btn-group"></div>'),
    init: function(){
    },    
    doRender: function(){
    
        var self = this;    
        
        this._groupsEl = this.$el;
        
        return this;    
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {         
            this._presenterOnce = true;
        }
        
    },
    add: function(component, groupIndex){
    
        if(!groupIndex) groupIndex = 0;
    
        var groupEl = this._groupsEl.find('>[data-index='+groupIndex+']');
        
        if(groupEl.length==0) {
            groupEl = $(this.groupTpl())
                .attr('data-index', groupIndex);
            this._groupsEl.children().each(function(){
                if($(this).data('index')>groupIndex) {
                    groupEl.insertBefore($(this));
                    return false;
                }
            });
            if(this._groupsEl.has(groupEl).length==0) this._groupsEl.append(groupEl);
        }
        groupEl.append(component.$el);
        
        return this;
    }
});
