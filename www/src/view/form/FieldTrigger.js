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
        
            $(tpl({
                'cid': this.cid
            }))
                .click(function(){
                    self.trigger('trigger');
                })
                .insertAfter(
                    this.$el
                        .addClass('mod_trigger')
                        .find("._input"+this.cid)
                );
            
            return this;
        }
    });

    var tpl = _.template('<a class="btn _trigger{cid}"><i class="icon-chevron-down"></i></a>');
    
})(App);
