Ext.define('App.ui.Hint', {
    extend: 'Ext.Component',
    renderTpl: '<div class="app-hint mod_info"><b>{title}</b> <span>{text}</span></div>',
    renderSelectors: {
        titleEl: '.app-hint b',
        textEl: '.app-hint span'
    },    
    constructor: function(config){
        var me = this;        
        me.callParent([config]);
    },
    beforeRender: function () {
        this.renderData = {
            title: this.title,
            text: this.text
        }  
        return this.callParent();
    },
    setTitle: function(v){
        var me = this;
        me.title = v;
        if (me.rendered) {
            me.titleEl.update(v);
            me.updateLayout();
        }
        return me;    
    },
    setText: function(v){
        var me = this;
        me.text = v;
        if (me.rendered) {
            me.textEl.update(v);
            me.updateLayout();
        }
        return me;  
    }
});
