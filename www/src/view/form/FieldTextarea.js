/*
 * @id 507c059155ac3 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require view/form/Field.js
 */
App.defineView('FieldTextarea', {

    extend: 'Field',
    
    options: {
        label: '',
        name: null
    },    
        
    itemTpl: _.template(
        '<textarea id="{name}{cid}" rows="3" name="{name}"></textarea>'
    ),
    init: function(){
        this.parent().init.call(this);
    },   
    doRender: function(){
    
        this.parent().doRender.call(this);
    
        var self = this;             
        
        this._itemEl.append(this.itemTpl({
            cid: this.cid,
            name: this.options.name
        }));
        
        this.$el.find('textarea')
            .on('input paste keyup propertychange', function(){
                self.setValue($(this).val());
            });
        
        this.on('change', function(){
            this.$el.find('textarea').val(this._value);
        });
        
        return this;    
    },
    doPresenter: function(){
    
        var isOnce = this._presenterOnce;
    
        this.parent().doPresenter.call(this);
        
        if(!isOnce) {
            
        }
        
        return this;
    } 
});
