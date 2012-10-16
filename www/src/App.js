/*
 * @id 507c059153d51 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*

 * @require bootstrap/css/bootstrap.css
 * @require bootstrap/css/bootstrap-responsive.css
 
 * @require b/loading.css
 * @require b/effects.css
 * @require b/systemmsg.css
  
 * @require jquery/jquery.js
 * @require underscore/underscore.js
 * @require backbone/backbone.js
 * @require bootstrap/js/bootstrap.js
 
 */

var App = (function(){

    /* Global settings & overrides */

    _.templateSettings = {
        interpolate : /\{(.+?)\}/g
    };

    Backbone.sync = function(method, model, options){
        //if(model.__sync) model.__sync.abort();
        if(method=='create') method = 'update';
        if(method == 'update' && model instanceof Model) options.params = $.extend(model.attributes || {},  options.params);
        if(method=='delete' && model instanceof Model) options.params = {id: model.id };
        var request = App.rpc.request(model.api + '.' + method, options.params)
            .on('success', options.success, model)
            .on('error', options.error, model)
            .on('complete', options.complete, model);
        model.__sync = request;
        return request;
    }

    /* Core */

    var view = {},
        model ={},
        collection = {},

        systemMsg,
        isSupportBackgroundClipText = false,
        systemMsgTpl = _.template(
          '<div class="b-systemmsg">' +
             '<div class="alert alert-{type} alert-block">' +
                '<button type="button" class="close" data-dismiss="alert">×</button>' +
                '<h4 class="alert-heading">{title}</h4>' +
                '<p>{text}</p>' +
                '<p class="_buttons"></p>' +
              '</div>' +
           '</div>'
        );

     var self = {
        view: {
            getScrollbarWidth: function(){
                var self = arguments.callee;
                if(!self.width){
                    var div = $('<div style="width:50px;height:50px;overflow:auto;position:absolute;top:-200px;left:-200px;">'); 
                    // Append our div, do our calculation and then remove it 
                    $('body').append(div); 
                    var w1 = div.innerWidth();
                    var w2 = div.append('<div style="height:100px;width:100%;">').find('div').innerWidth(); 
                    $(div).remove();
                    self.width = (w1 - w2);
                }
                return self.width;                
            },
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
            },
            applyInset: function(el){
                if(isSupportBackgroundClipText && !el.is('._inset')) {
                    el
                        .addClass('effect-inset _inset')
                        .css({
                            'background-color': el.css('color'),
                            'color': 'transparent'
                        });
                }
                return el;
            }
        },
        msg: {
            alert: function(options){
                showSystemMsg( $.extend({
                    type: 'error'
                }, options));
            },
            warning: function(options){
                showSystemMsg( $.extend({
                    type: 'warning'
                }, options));
            },            
            success: function(options){
                showSystemMsg( $.extend({
                    type: 'success'
                }, options));
            },            
            okcancel: function(options){
                showSystemMsg( $.extend({
                    type: 'info',
                    modal: true,
                    buttons: ['ok', 'cancel']
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
        validate: function(attr, options){
            if (this.validateModel) {
                if(options.onlynew) {
                    for(var p in attr) {
                        if(attr[p]==this.attributes[p]) delete attr[p];
                    }
                }
                return this.validateModel(attr, options);
            }
            return false;
        },
        parse: function(resp){
            return resp && resp.model ? resp.model : resp;
        },
        parent: parentFn
    }),
    View = extendFn.call(Backbone.View, {
        initialize: function(options){
            if(!options) options ={};
            applyListeners(this, options.listeners);
            this.cid = _.uniqueId();
            this.init();
            this.render();
            this.$el
                .data('component', this)
                .attr('data-component', this.ctype || true);
            this.trigger('init');
        },
        init: emptyFn,
        render: function(){
            this.doRender();
            this.doPresenter();
            //this.trigger('render');
            return this;
        },
        doRender: emptyFn,
        doPresenter: emptyFn,
        hide: function(isNow){
            if(isNow) {
                this.$el.hide();
                return;
            }
            if(this.$el.is(':visible')) this.$el.fadeOut(200);
            else {
                /*if($('body').has(this.$el).length==0) this.$el.appendTo($('body')).hide().remove();
                else*/ this.$el.hide();
            }
            return this;
        },
        setLoading: function(active){
            self.view.setLoading(this.$el, active);
            return this;
        },
        show: function(){
            if(this.$el.is(':visible')) return this;
            this.$el.fadeIn(200);
            if(!this._isLayout) this.layout();
            return this;
        },
        layout: function(){
            if(this._isLayout || this.$el.is(':hidden')) return this;
            this.doLayout();
            this._isLayout = true;
            return this;
        },
        doLayout: emptyFn,
        parent: parentFn
    }),
    Collection = extendFn.call(Backbone.Collection, {
        initialize: function(models, options){
            applyListeners(this, this.listeners);
            if(options && options.params) this.params = options.params;
            this._isLocal = options && options.local && true;
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
            if(!options) options = {};
            options.params = $.extend({}, this.params, options.params);
            return Collection.__super__.fetch.call(this, options);
        },
        get: function(id){
            var model = Collection.__super__.get.apply(this, arguments);
            return model || Collection.__super__.getByCid.apply(this, arguments);
        },
        add: function(models){
            var model;
            for (var i = 0; i < models.length; i++) {
                model = this._byId[models[i].id];
                if(model) model.set(models[i]);
            }
            this.parent().add.apply(this, arguments);
        },
        isLocal: function(){
            return this._isLocal;
        },
        isFetched: function(){
            return this._fetched;
        },
        parse: function(resp){
            return resp && resp.data ? resp.data : resp;
        },
        parent: parentFn
    });

    (function(){
        var el = $('<div class="effect-inset"></div>').appendTo('body');
        isSupportBackgroundClipText = el.css('background-clip')=='text';
        el.remove();
    })();

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
    
    /* Мessages */
    
    function showSystemMsg(options){
        var closeTimeout,
            msg = $(systemMsgTpl(options))
            .appendTo($('body')),
            Button = App.getView('Button'),
            buttons = options.buttons,
            buttonsEl = msg.find('._buttons'),
            btn;
        if(systemMsg) systemMsg.triggerHandler('close');
        
        if(buttons) for(var i=0;i<buttons.length;i++){
            if(buttons[i]=='ok') {
                btn = new Button({
                    type: options.type,
                    text: 'OK',
                    click: function(){
                        close();
                        if(options.callback) options.callback();
                    }
                });      
            } else if(buttons[i]=='cancel'){
                btn = new Button({
                    text: 'Отмена',
                    click: function(){
                        close();
                    }
                });                
            }
            if(btn) buttonsEl.append(btn.$el);
        }
        else buttonsEl.remove();
        
        systemMsg = msg
            .css({
                'opacity': 0,
                'margin-top': -10,
                'left': '50%',
                'max-width': msg.width(),
                'margin-left': - msg.width() / 2
            })
            .find('.close').click(close).end()
            .animate({
                'margin-top': 0,
                opacity: 1
            }, 200)            
            .on({
                'close': close,
                'mouseenter': cancelClose,
                'mouseleave': startClose
            });
        if(options.modal) {
            options.isManualClose = true;
            msg.click(function(e){
                e.stopPropagation();
            });
            msg = msg.wrap('<div class="b-systemmsg-over">').parent()
                .hide().fadeIn(200)
                .click(close);
        }
                      
        startClose();

        function cancelClose(){
            clearTimeout(closeTimeout);
        }
        function startClose(){
            if(options.isManualClose) return;
            closeTimeout = setTimeout(close, 3000);
        }
        function close(){
            systemMsg = null;
            cancelClose();
            msg.fadeOut(200, function(){
                $(this).remove();
            });
            return false;
        }
    }


    return self;
})();
