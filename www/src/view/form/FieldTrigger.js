/*
 * @id 508bef22ab5f3 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require view/form/FieldText.js
 */
(function(App){
    App.defineView('FieldTrigger', {

        extend: 'FieldText',
        
        options: {
            readonly: true
        },   
        init: function(){
            this.parent().init.call(this);
        },   
        doRender: function(){
        
            this.parent().doRender.call(this);
        
            var self = this;
        
            this.$el
                .addClass('mod_trigger');
        
            $(tpl({
                'cid': this.cid
            }))
                .click(function(){
                    self.trigger('trigger');
                })
                .insertAfter(
                    this._itemEl
                );
            
            return this;
        }
    });

    var tpl = _.template('<a class="btn _trigger{cid}"><i class="icon-chevron-down"></i></a>');
    
})(App);
