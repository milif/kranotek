var App = (function(){
     var self = {
        view: {},
        model: {},
        collection: {},
        defineView: function(name, cfg){
            this.view[name] = getExtendable(View, cfg, 'getView').extend(cfg);
        },
        getView: function(name){
            return this.view[name];
        },
        defineModel: function(name, cfg){
            this.model[name] = getExtendable(Model, cfg, 'getModel').extend(cfg);
        },
        getModel: function(name){
            return this.model[name];
        },
        defineCollection: function(name, cfg){
            this.collection[name] = getExtendable( Collection, cfg, 'getCollection').extend(cfg);
        },
        getCollection: function(name){
            return this.collection[name];
        },
        debounce: function( fn, wait, immediate, useAttribute ){
        
            if(!useAttribute) return _.debounce.call(_, fn, wait, immediate);
            
            var args = {},
                attrFn = _.uniqueId('_debounce');
                
            function wrap() {
                var arg = arguments[0] || "null",
                    wrap;
                if( typeof arg == 'string' || $.isNumeric(arg) ) {
                    if(!args[arg]) {
                        args[arg] = _.debounce.call(_, fn, wait, immediate);
                    }
                    wrap = args[arg];
                } else {
                    if(!arg[attrFn]) {
                        arg[attrFn] = _.debounce.call(_, fn, wait, immediate);
                    }
                    wrap = arg[attrFn];
                }
                wrap.apply(this, arguments);
            }
            
            return wrap;
        }       
    },
    Model = Backbone.Model.extend({
        initialize: function(){
            applyListeners(this, this.listeners);
        }
    }),
    View = Backbone.View.extend({
        initialize: function(options){
            if(!options) options ={};
            applyListeners(this, options.listeners);
            this.cid = _.uniqueId();
            this.init();
            if(this.el) this.render();                  
            this.trigger('init');
        },
        init: emptyFn,
        render: function(){
            this.doRender();
            this.doPresenter();
            this.trigger('render');
            return this;
        },
        doRender: emptyFn,                              
        doPresenter: emptyFn,
        setLoading: function(el, active){
            if(!el) return;
            if(active) {
                el.addClass('state_loading');
                $('<div class="b-loading"></div>')
                    .hide()
                    .appendTo(el)
                    .fadeIn(200);
            } else {
                el.children('.b-loading').fadeOut(200, function(){
                    $(this).remove();
                    el.removeClass('state_loading');
                });
            }
        }
    }),
    Collection = Backbone.Collection.extend({
        initialize: function(){
            applyListeners(this, this.listeners);
            this.init();
            if(this.model) this.api = this.model.prototype.api;
            this._fetched = !this.api;
        },
        init: emptyFn,
        getName: function(node){
            return node.get('name');
        },
        fetch: function(options){
            this._fetched = true;
            //if(!options.silent) this.trigger('beforefetch', options);
            return Collection.__super__.fetch.apply(this, arguments);
        },
        isFetched: function(){
            return this._fetched;
        }                             
    });
    
    function emptyFn(){
        return this;
    }
    function applyListeners(obj, listeners){
        if(!listeners) return;
        for(var p in listeners) {
            obj.on(p, listeners[p]);
        }
    }
    function getExtendable(base, cfg, method){
        if(cfg.extend) {
            base = self[method](cfg.extend);
            delete cfg.extend;
        }
        return base;
    }
    
    return self;
})();

/* Global settings*/

_.templateSettings = {
    interpolate : /\{(.+?)\}/g
};

Backbone.sync = function(method, model, options){
    return App.rpc.request(model.api + '.' + method, options.params)
        .on('success', options.success, model)
        .on('error', options.error, model)
        .on('complete', options.complete, model);
}
