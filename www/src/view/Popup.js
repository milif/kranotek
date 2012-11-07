/*
 * @id 507c0591555d8 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require b/popup.css
 * @require view/container/Container.js
 */
(function(App){
    App.defineView('Popup', {

        options: {
            title: '',
            popupWidth: 300
        },
        
        init: function(){
        },    
        doRender: function(){
        
            var self = this,
                width = this.options.popupWidth;
            
            this._container = new (App.getView('Container'))();
            this._container.$el.addClass('b-popup-body');
            
            this.$el = $(tpl({
                cid: this.cid,
                title: this.options.title
            }))
                .on('click', function(){
                    self.close();
                })
                .on('click', '._popup'+this.cid, function(e){
                    e.stopPropagation();
                })
                .on('click', '._close'+this.cid, function(){
                    self.close();
                })
                .find('._body'+this.cid).append(this._container.$el).end();
            
            this._titleEl = this.$el.find('._title'+this.cid);
            this._footerEl = this.$el.find('._footer'+this.cid).remove();
            this._popupEl = this.$el.find('._popup'+this.cid);
            
            this._windowListeners = {
                'keydown': function(e){
                    if(e.keyCode == 27) {
                        if($('.b-popup:last').get(0)!=self.$el.get(0)) return;
                        self.close();
                        return false;
                    }
                }            
            };
            
            return this;    
        },
        open: function(){
            if(this._isOpen) return this;
            this._isOpen = true;
            $('body').append(this.$el);
            
            var html = $('html'),
                width = html.width();
            html
                .addClass('noscroll')
                .css({
                    marginRight: html.width()-width
                });
            
            this.$el.hide().fadeIn(300);
            
            this._popupEl
                .width(Math.min($(window).width()-30, this.options.popupWidth));       
            
            $(window).on(this._windowListeners);
            this.trigger('open');            
            return this;
        },
        close: function(){
            if(!this._isOpen) return this;
            this._isOpen = false;
            this.$el.fadeOut(300, function(){
                $(this).detach();
                
                if($('.b-popup').size()==0) $('html')
                    .removeClass('noscroll')
                    .css({
                        marginRight: 0
                    });                
            });
            $(window).off(this._windowListeners);
            $('.tooltip').fadeOut(200);
            this.trigger('close');
            return this;
        },
        setTitle: function(v){
            this._titleEl.html(v);
            return this;
        }, 
        addButton: function(component){
            if(this.$el.has(this._footerEl).length==0) this._footerEl.insertAfter(this.$el.find('._body'+this.cid));
            this._footerEl.append(component.$el || component);
            
            return this;
        },
        add: function(){
            this._container.add.apply(this._container, arguments);
            return this;
        } 
    });
    
    var tpl = _.template(
        '<div class="b-popup">' +
            '<div class="b-popup-h">' +
                '<div class="b-popup-hh">' +
                    '<div class="modal _popup{cid}">' +
                      '<div class="modal-header">' +
                        '<button type="button" class="close _close{cid}">×</button>' +
                        '<h3 class="_title{cid}">{title}</h3>' +
                      '</div>' +
                      '<div class="modal-body _body{cid}"></div>' +
                      '<div class="modal-footer _footer{cid}"></div>' +
                    '</div>' + 
                '</div>' +     
            '</div>' +    
        '</div>'
    );
    
})(App);

