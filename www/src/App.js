var App = (function(){

    /* Global settings*/

    _.templateSettings = {
        interpolate : /\{(.+?)\}/g
    };

    Backbone.sync = function(method, model, options){
        if(model instanceof Model) options.params = $.extend(model.changedAttributes() || {},  options.params);
        if(method=='create') method = 'update';
        return App.rpc.request(model.api + '.' + method, options.params)
            .on('success', options.success, model)
            .on('error', options.error, model)
            .on('complete', options.complete, model);
    }

    /* Core */

    var view = {},
        model ={},
        collection = {},
        
        systemMsg,
        systemMsgTpl = _.template(
          '<div class="b-systemmsg">' +
             '<div class="alert alert-{type} alert-block">' +
                '<button type="button" class="close" data-dismiss="alert">×</button>' +
                '<h4 class="alert-heading">{title}</h4>' +
                '<p>{text}</p>' +
              '</div>' +
           '</div>'
        );

     var self = {
        view: {
            setLoading: function(el, active){
                if(!el) return;
                if(active) {
                    el.addClass('state_loading');
                    var loading = $('<div class="b-loading"></div>')
                        .hide()
                        .appendTo(el)
                        .fadeIn(200);
                    if(el.height()<50) {
                        loading
                            .css({
                                'border-radius': el.css('border-radius'),
                                'background-color': el.css('background-color')
                            })
                            .addClass('mod_small');
                        
                    }
                } else {
                    el.children('.b-loading').fadeOut(200, function(){
                        $(this).remove();
                        el.removeClass('state_loading');
                    });
                }
                return this;
            }
        },
        msg: {
            alert: function(options){
                showSystemMsg( $.extend({
                    type: 'error'
                }, options));
            }
        },
        defineView: function(name, cfg){
            view[name] = getExtendable(View, cfg, 'getView').extend(cfg);
        },
        getView: function(name){
            return view[name];
        },
        defineModel: function(name, cfg){
            model[name] = getExtendable(Model, cfg, 'getModel').extend(cfg);
        },
        getModel: function(name){
            return model[name];
        },
        defineCollection: function(name, cfg){
            collection[name] = getExtendable( Collection, cfg, 'getCollection').extend(cfg);
        },
        getCollection: function(name){
            return collection[name];
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
    Model = extendFn.call(Backbone.Model, {
        initialize: function(){
            applyListeners(this, this.listeners);
        },
        parse: function(resp){
            return resp && resp.model ? resp.model : null;
        },
        parent: parentFn
    }),
    View = extendFn.call(Backbone.View, {
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
        hide: function(){
            if(this.$el.is(':visible')) this.$el.fadeOut(200);
            else this.$el.hide();
            return this;
        },
        setLoading: function(active){
            self.view.setLoading(this.$el, active);
            return this;
        },
        show: function(){
            this.$el.fadeIn(200);
            return this;
        },
        parent: parentFn
    }),
    Collection = extendFn.call(Backbone.Collection, {
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
            return Collection.__super__.fetch.apply(this, arguments);
        },
        isFetched: function(){
            return this._fetched;
        },
        parent: parentFn        
    });
    
    function emptyFn(){
        return this;
    }
    function parentFn(){
        return arguments.callee.caller.__owner__.__super__;
    }
    function extendFn(extend){
        var child = Backbone.Model.extend.apply(this, arguments);
        for(var p in extend) {
            if($.isFunction(extend[p])) extend[p].__owner__ = child;
        }
        child.extend = extendFn;
        return child;
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
    function showSystemMsg(options){
        var closeTimeout,
            msg = $(systemMsgTpl(options))
            .appendTo($('body'));
        if(systemMsg) systemMsg.triggerHandler('close');
        systemMsg = msg
            .css({
                'opacity': 0,
                'margin-top': -10,
                'left': '50%',
                'max-width': msg.width(),
                'margin-left': - msg.width() / 2
            })
            .animate({
                'margin-top': 0,
                opacity: 1
            }, 200)
            .on('click', '.close', close)
            .on({
                'close': close,
                'mouseenter': cancelClose,
                'mouseleave': startClose
            });
        startClose();
            
        function cancelClose(){
            clearTimeout(closeTimeout);
        }
        function startClose(){
            closeTimeout = setTimeout(close, 3000);
        }
        function close(){
            systemMsg = null;
            cancelClose();
            msg.fadeOut(200, function(){
                $(this).remove();
            });
        }
    }
    
    
    return self;
})();
