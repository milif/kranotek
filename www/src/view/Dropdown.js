(function(App){
    App.defineView('Dropdown', {

        tagName: "ul",
        className: "b-dropdown dropdown-menu",

        options: {
            target: null,
            position: 'bottom', // bottom | top | left | right
            event: 'click', // click | hover
            type: 'menu'    // menu | submenu
        },
        
        init: function(){
            var self = this;
            
            this.setPosition(this.options.position);
            this.setEvent(this.options.event);
            this.setType(this.options.type);
            this.setTarget(this.options.target);

            this._windowListeners = {
                'click scroll': function(e){
                    hide.call(self, e);
                }
            }
        },    
        
        doRender: function(){
        
            var self = this;

            this._listEl = this.$el;
         
            return this;    
        },
        addButton: function(component, index, submenu){
            var prevEl,
                itemEl = $(itemTpl({
                cid: this.cid
            }))
                .append(component.$el || component);
            if(submenu) {
                itemEl.addClass('dropdown-submenu');
                submenu
                    .setTarget(itemEl)
                    .setType('submenu')
                    .setPosition('right')
                    .setEvent('hover');
            }
                
            if(index!==null && index>=0) prevEl = this._listEl.find('._item'+this.cid+':eq('+index+')');
            if(!prevEl) {
                this._listEl.append(itemEl);
                index = this._listEl.find('._item'+this.cid).length -1;
            }
            else itemEl.insertBefore(prevEl);
            this.trigger('addbutton', index);
            return this;
        },
        getButtonIndex: function(button){
            var el = button.$el || button;
            return this._listEl.find('._item'+this.cid).index(el.parent());
        },
        removeButton: function(index){
            this._listEl.find('._item'+this.cid+':eq('+index+')').remove();
            return this;            
        },
        setType: function(type){
            this._type = type;
            return this;
        },
        setPosition: function(position){
            this._position = position;
            return this;
        },
        setEvent: function(event){
        
            var self = this;
        
            if(this._targetEl) this._targetEl.off(this._targetListeners);
        
            this._event = event;
            
            var self,
                targetListeners = {};
            
            targetListeners[this._event] = function(e){         
                show.call(self, e);
            };
            
            this._targetListeners = targetListeners;
            
            if(this._targetEl) this._targetEl.on(this._targetListeners);
            return this;
        },
        addSeparator: function(index){
            var prevEl,
                separatorEl = $(separatorTpl());
            if(index>=0) prevEl = this._listEl.find('._item'+this.cid+':eq('+index+')');
            if(!prevEl) this._listEl.append(separatorEl);
            else separatorEl.insertAfter(prevEl);
            return this;
        },
        setActive: function(index){
            this.$el
                .find('._item'+this.cid+'.active').removeClass('active')
                .find('._item'+this.cid+':eq('+index+')').addClass('active');
        },
        setTarget: function(target){
            if(!target) return this;
            if(this._targetEl) {
                this._targetEl.off(this._targetListeners);
            }
            this._targetEl = target.$el || target;
            this._targetEl.on(this._targetListeners);
            
            return this;
        }
    });
    
    var margin = 2,
        itemTpl = _.template(
            '<li class="_item{cid}"></li>'
        ),
        separatorTpl = _.template(
            '<li class="divider"></li>'
        );
    
    function show(e){
        if(this._isOpen) {
            hide.call(this, e);
            return;
        }
        
        var self = this;
        
        this._isOpen = true;
        clearTimeout(this._closeAction);
        
        setTimeout(function(){
            $(window).on(self._windowListeners);
        },0);          
        
        if(this._type == 'submenu') {
            showIn.call(this,e);
            return;
        }
        
        var width,
            height,
            diff,
            win = $(window),
            position = this._position,
            winWidth = win.width(),
            winHeight = win.height(),
            scrollTop = win.scrollTop(),
            scrollLeft = win.scrollLeft(),
            targetOffset = this._targetEl.offset(),
            align = (targetOffset.left + this._targetEl.outerWidth() / 2) < (winWidth / 2 + scrollLeft) ? 'left' : 'right';
                
        this.$el.appendTo('body').show();
        
        width = this.$el.outerWidth();
        height = this.$el.outerHeight();
        
        if(position=='bottom') {
            diff = winHeight + scrollTop - targetOffset.top - this._targetEl.outerHeight() - height;
            if(diff < 0) position='top';
        } else if(position=='top') {
            diff = targetOffset.top - height - scrollTop;
            if(diff < 0) position='bottom';
        } else if(position=='left') {
            diff = targetOffset.left - width - scrollLeft;
            if(diff < 0) position='right';
        } else if(position=='right') {
            diff = winWidth + scrollLeft - targetOffset.left - this._targetEl.outerWidth() - width;
            if(diff < 0) position='left';
        }
        
        if(position=='bottom') {
            this.$el.css({
                'top': targetOffset.top + this._targetEl.outerHeight() + margin,
                'left': align == 'right' ? 
                    targetOffset.left + this._targetEl.outerWidth() - width
                    : targetOffset.left 
            });
        } else if(position =='top') {
            this.$el.css({
                'top': targetOffset.top - height - margin,
                'left': align == 'right' ? 
                    targetOffset.left + this._targetEl.outerWidth() - width
                    : targetOffset.left 
            });
        } else if(position =='left') {
            this.$el.css({
                'top': targetOffset.top,
                'left': targetOffset.left - width + margin
            });
        } else if(position =='right') {
            this.$el.css({
                'top': targetOffset.top,
                'left': targetOffset.left + this._targetEl.outerWidth() - margin
            });
        }
        
        this.$el.on({
            'mouseleave': function(){
                autoHide.call(self);
            },
            'mouseenter': function(){
                clearTimeout(self._autoHide);
            },
        });
        
        this.$el.hide().fadeIn(50);
        
        this.trigger('dropdownshow');
    }
    function autoHide(){
        var self = this;
        this._autoHide = setTimeout(function(){
            hide.call(self);
        }, 1000);
    }
    function showIn(e){
        this.$el
            .appendTo(this._targetEl)
            .show();       
        
        var width,
            height,
            position = this._position,
            align = 'down',
            diff,
            win = $(window),
            winWidth = win.width(),
            winHeight = win.height(),
            scrollTop = win.scrollTop(),
            scrollLeft = win.scrollLeft(),
            targetOffset = this._targetEl.offset();
        
        width = this.$el.outerWidth();
        height = this.$el.outerHeight();         
        
        if(position=='right') {
            diff = winWidth + scrollLeft - targetOffset.left - this._targetEl.outerWidth() - width;
            if(diff < 0) position='left';            
        }
        if(align=='down') {
            diff = winHeight + scrollTop - targetOffset.top - height;
            if(diff < 0) align='up';           
        }        
        
        this.$el.css({
            'left': position=='right' ? '100%' : '-100%',
            'top': align=='down' ? 0 : -height + this._targetEl.outerHeight() + 12
        });        
        
        this.$el.hide().fadeIn(50);
    }
    function hide(e){
        if(!this._isOpen) return;
        var self = this;
        this._isOpen = false;
        this._closeAction = setTimeout(function(){
            self.$el.fadeOut(50, function(){
                $(this).detach();
                self.$el.off('mouseenter mouseleave');
            });        
        },0);
        $(window).off(this._windowListeners);
        this.trigger('dropdownhide');
    }
})(App);

