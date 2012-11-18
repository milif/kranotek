/*
 * @id 507c059155923 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require b/form.css
 * @require view/button/Button.js
 */
(function(){ 
    App.defineView('Form', {

        tagName: "form",
        className: "b-form form-horizontal",
        
        tpl: _.template(
            '<div class="b-form-fields _fields{cid}"></div>' +
            '<div class="b-form-buttons-h control-group">' +
                '<div class="b-form-buttons controls _buttons{cid}"></div>' +
            '</div>'
        ),
        
        options: {
            legend: null,
            model: null
        },
        
        legendTpl: _.template('<legend>{text}</legend>'),
        init: function(){
        
            var self = this;
        
            this._fields = {};
            this._errors = {};        
            
            this.on('dirtychange errorchange aftersave', function(isDirty){
                updateButtons.call(this);                
            });
        },   
        doRender: function(){
        
            var self = this;     
            
            this.$el.append($(this.tpl({
                cid: this.cid
            })));        
            
            if(this.options.legend) this.setLegend(this.options.legend); 
            
            this._fieldsEl = this.$el.find('._fields'+this.cid);
            this._buttonsEl = this.$el.find('._buttons'+this.cid);
            
            this._buttonSave = new (App.getView('Button'))({
                text: 'Сохранить',
                type: 'primary',
                listeners: {
                    'click': function(){
                        self.save();
                    },
                    'disableclick': function(){
                        self.validate();
                    }
                }                
            });
            this._buttonCancel = new (App.getView('Button'))({
                text: 'Отмена',
                listeners: {
                    'click': function(){
                        self.cancel();
                    }
                }
            });
            this.addButton(this._buttonSave);
            this.addButton(this._buttonCancel);
            
            
            checkDirtyChange.call(this);
            
            if(this.model) this.setModel(this.model);
            
            return this;    
        },
        doPresenter: function(){
            
            if(!this._presenterOnce) {
                this._presenterOnce = true;
                
                // Important! Remove all models listeners after remove view
                this.on('remove', function(){
                    unbindModel.call(this);
                });
                
                
                if(this.model) {
                    bindModel.call(this, this.model);
                }
            }
        },
        askIfDirty: function(callback, scope){
            if(this._isDirty) {
                var self = this;
                App.msg.okcancel({
                    type: 'warning',
                    title: 'Подтверждение действия',
                    text: 'Форма имеет не сохраненные данные. Вы можете отменить действие.',         
                    callback: function(){
                        self.cancel();
                        callback.call(scope || self);
                    }
                });
                return;
            }
            callback.call(scope || this);
        },
        setModel: function(model){
            this._errors = {};
            unbindModel.call(this);
            bindModel.call(this, model);
            return this;      
        },
        applyErrors: function(errors){
            if(!errors) return;
            var field;
            for(var i=0;i<errors.length;i++){
                this._errors[errors[i].name] = errors[i];
                field = this.getField(errors[i].name);
                if(!field) continue;
                field.applyError(errors[i].msg);
            }
            checkErrorChange.call(this);
        },
        validate: function(){
            if(!this._model) return this;
            this._model.set(this._model);
            return this;
        },
        getModel: function(){
            return this.model;
        },
        setLocal: function(isLocal){
            this._isLocal = isLocal;
            return this;
        },        
        save: function(){
            var self = this,
                button = this._buttonSave,
                isNew = this.model.isNew(),
                attrs = this.model.changedAttributes(this._model.attributes) || {},
                e = {};
                
            this.trigger('beforesave', e, isNew, attrs);
            if(e.cancel) return this;
            
            if(this._isLocal){
                this.model.set(attrs);
                bindModel.call(this, this.getModel());
                this.trigger( 'save', isNew ); 
                return this;
            }
                
            var isSave = this.model.save(attrs, {
                wait: true,
                success: function(){
                    bindModel.call(self, self.getModel());
                    self.trigger( 'save', isNew );
                },
                error: function(model, data){
                    if(data) self.applyErrors(data.errors);
                    self.trigger( 'error', isNew );
                },
                complete: function(){
                    button.setLoading(false);
                    self.trigger('aftersave');
                }
            }); 
            if(isSave) {
                button
                    .disable()
                    .setLoading(true);                
            }
            return this;        
        },
        cancel: function(){
            bindModel.call(this, this.model);
            this.trigger('cancel', this.model);
            return this;     
        },
        getField: function(name){
            return this._fields[name];
        },
        setLegend: function(text){
            if(!this._legendEl) {
                this._legendEl = $(this.legendTpl({
                    text: text
                })); 
                this.$el.prepend(this._legendEl);          
            } else {
                this._legendEl.html(text);
            }
            return this;
        },
        add: function(field){
            var self = this,
                name;
            if(this.$el.has(field.$el).length==0) this._fieldsEl.append(field.$el);
            if(field.$el.is('[data-form-field]')) {
                name = field.getName();
                this._fields[name] = field;
                if(this.model) field.setValue(this.model.get(name));
                field.on('change', function(){
                    if(self._inBind) return;
                    if(this.model) {
                        if(this._model.set(name, field.getValue(), {
                            onlynew: true
                        })) {
                            delete this._errors[name];
                            field.clearError();
                            checkErrorChange.call(this);
                        }
                        checkDirtyChange.call(this);
                    }
                    this.trigger('change:' + name, this);
                }, this);
            } else {
                field.$el.find('[data-form-field]').each(function(){
                    self.add($(this).data('field'));
                });
            }
            field.layout();
            return this;
        },
        addButton: function(component){
            this._buttonsEl.append(component.$el);
            return this;
        }    
        
    });
    function bindModel(model){
        
        var self=this,
            field;
    
        this.model = model;
        this._model = this.model.clone();
        
        this._inBind = true;
        
        for(var p in model.attributes) {
            field = this._fields[p];
            if(field) { 
                field.setValue(model.attributes[p]);
                field.clearError();
            }
        }
            
        this._model.on('error', function(m, errors){
            self.applyErrors(errors);
        });        
        
        this._model.set(model.attributes);
        this.model.on('change', function(value){
            var attr = this.model.changedAttributes(),
                field,
                isValid = this._model.set(attr); 
            for (var p in  attr){
                field = this.getField(p);
                if(field) field.setValue(attr[p]);
                if(isValid) {
                    delete this._errors[p];
                    if(field) field.clearError();                                                              
                }
            }
            checkErrorChange.call(this);
            checkDirtyChange.call(this);
        }, this);
        
        this._inBind = false;
        
        checkDirtyChange.call(this);
    }    
    function unbindModel(){
        if(this.model) this.model.off(null, null, this);
    }
    function updateButtons(){
        if(this._buttonSave) {
            if(this._isDirty && !this._isError) this._buttonSave.enable();
            else this._buttonSave.disable();
        }
        if(this._buttonCancel) {
            if(this._isDirty) this._buttonCancel.show();
            else this._buttonCancel.hide();
        }    
    }
    function checkErrorChange() {
        var isError = !$.isEmptyObject(this._errors);
        if(this._isError !== isError) {
            this._isError=isError;
            this.trigger('errorchange');
        }
    }    
    function checkDirtyChange() {
        if(!this.model) return;
        
        var isDirty = false;
        for(var p in this._fields){
            if(p=='id') continue;
            if(!_.isEqual(this._fields[p].getValue(), this.model.attributes[p]) ) {
                isDirty = true;
                break;
            }   
        }
            
        //var isDirty = this.model.attributes;
        if(this._isDirty !== isDirty) {
            this._isDirty=isDirty;
            this.trigger('dirtychange');
        }
    }
})();
