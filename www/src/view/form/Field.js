/*
 * @require view/tooltip/Tooltip.js
 */
App.defineView('Field', {

    tagName: "div",
    className: "control-group",
    
    options: {
        label: ''
    },
    
    tpl: _.template(
        '<label class="b-field control-label _label{cid}" for="{name}{cid}">{label}</label>' +
        '<div class="controls"><div class="b-field-item _item{cid}"></div></div>'
    ),
    tplHiddenLabel: _.template(
        '<div><div class="b-field-item _item{cid}"></div></div>'
    ),
    init: function(){
        this._name = this.options.name;
    },   
    doRender: function(){
    
        var self = this;

        var tpl = this.options.hideLabel ? this.tplHiddenLabel : this.tpl;
        this.$el.append($(tpl({
            cid: this.cid,
            name: this._name,
            label: this.options.label
        })));
        
        
        if(this._name) this.$el
            .attr('data-form-field', this._name)
            .data('field', this);
        
        this._itemEl = this.$el.find('._item'+this.cid);
        
        return this;    
    },
    doPresenter: function(){
        
        if(!this._presenterOnce) {
         
            this._presenterOnce = true;
        }
        return this;
    },
    getName: function(){
        return this._name;
    },
    getValue: function(){
        return this._value;
    },
    setValue: function(v, isSilent){
        if(v===this._value) return this;
        this._value = v;
        if(!isSilent) this.trigger('change');
        return this;
    },
    enable: function(){
        this.$el.removeClass('disabled');
    },
    disable: function(){
        this.$el.addClass('disabled');
    },
    applyError: function(msg){
        this.$el.addClass('error');
        if(!this._error) {
            this._error = new (App.getView('Tooltip'))({
                target: this._itemEl,
                position: 'bottom',
                type: 'important',
                trigger: 'hover'
            });
        }
        this._error
            .setText(msg);  
        if(this._itemEl.is(':hover')) this._error.show();    
    },    
    clearError: function(){
        if(this._error) {
            this._error.destroy();
            delete this._error;
        }
        this.$el.removeClass('error');
    }
});
