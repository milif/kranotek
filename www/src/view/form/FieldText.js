(function(){ 
App.defineView('FieldText', {

    extend: 'Field',
    
    options: {
        label: '',
        readonly: false,
        name: null
    },    
        
    itemTpl: _.template(
        '<input id="{name}{cid}" name="{name}" value="{value}" type="text"/>'
    ),
    itemTplCheckable: _.template(
        '<input type="checkbox" id="check-{name}{cid}" name="check-{name}"/> '+
        '<input id="{name}{cid}" disabled="true" name="{name}" value="{value}" type="text"/>'
    ),
    itemReadOnlyTpl: _.template(
        '<span class="input uneditable-input _input{cid}">{value}</span>'
    ),
    init: function(){
        this.parent().init.call(this);
    },   
    doRender: function(){
    
        this.parent().doRender.call(this);
    
        var self = this;             
        
        this.setReadOnly(this.options.readonly);
        
        this.on('change', function(){
            if(!this._isReadOnly) {
                this.$el.find('input[type="text"]').val(this._value);
            } else {
                this.$el.find('._input'+this.cid).text(this._value);
            }
            if(self.options.checkable) {
                syncValueWithCheckbox.call(self);
            }
        });

        if(this.options.checkable) {
            var checkboxEl = this.$el.find('input[type="checkbox"]');
            checkboxEl.on('change', function(){
                syncCheckbox.call(self);
            });
        }
        
        return this;    
    },
    doPresenter: function(){
    
        var isOnce = this._presenterOnce;
    
        this.parent().doPresenter.call(this);
        
        if(!isOnce) {
            
        }
        return this;
    },
    setReadOnly: function(isReadOnly){
        if( this._isReadOnly === isReadOnly ) return;
        
        var self = this;
        
        this._isReadOnly = isReadOnly;
        
        this._itemEl
            .children().remove().end()
            .append((!isReadOnly ? this.options.checkable ? this.itemTplCheckable : this.itemTpl : this.itemReadOnlyTpl)({
                cid: this.cid,
                name: this.options.name,
                value: this._value || ""
            }));
        
        this.$el.find('input[type="text"]')
            .on('input paste keyup propertychange', function(){
                self.setValue($(this).val());
            });        
    } 
});

function syncCheckbox() {
    if(!this._isReadOnly) {
        var checkboxEl = this.$el.find('input[type="checkbox"]'),
            isChecked = checkboxEl.is(':checked'),
            inputEl = this.$el.find('input[type="text"]');
        if(isChecked) {
            inputEl.attr('disabled', false);
        } else {
            this.setValue();
            inputEl.attr('disabled', true);
        }
    }
}
function syncValueWithCheckbox() {
    if(!this._isReadOnly) {
        var checkboxEl = this.$el.find('input[type="checkbox"]');
        if(this._value || this._value === 0) {
            checkboxEl.attr('checked', true);
        } else {
            checkboxEl.attr('checked', false);
        }
    }
}
})();