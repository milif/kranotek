/*
 * @id 508ff3ac3f608 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require App.js
 * @require view/button/Button.js 
 * @require view/Dropdown.js
 * @require b/diagram.css 
 */

(function(App){
    App.defineView('Diagram', {

        tagName: "div",
        className: "b-diagram",

        options: {
        },
        
        init: function(){
            this._listEls = {};
            this._menubutton = {};
        },    
        
        doRender: function(){
        
            var self = this;
         
            this.$el.append(tpl({
                cid: this.cid
            }));
         
            this._rootListEl = this.$el.find('._rootList'+this.cid);
         
            this.setCollection(this.collection);
            
            this.$el.on('click','._caption'+this.cid, function(e){
                var target = $(e.target),
                    nodeEl = target.closest('._node'+self.cid),
                    node = nodeEl.data('node'),
                    path = self.collection.getPath(node),
                    menu = self._menubutton[node.id]||self._menubutton[node.cid];
                
                if( 
                    (menu&&target.closest(menu.$el).length>0)
                    ||
                    self._inMove
                ) return;
                
                self.trigger('clicknode', path, node);
            });
         
            return this;    
        },
        setCollection: function(collection){
            if(this.collection) {
                this.collection.off(null,null,this);
            }
            if(!collection) return this;
            
            this.collection = collection;
            
            var self = this;
            
            collection
                .on('add', function(node, collection, options){
                    addNode.call(this, node);
                },this)
                .on('remove',function(node){
                    removeNode.call(this, node);
                },this)
                .on('move', function(node, parentPath, beforePath){                    
                    moveNode.call(this, node, parentPath, beforePath);
                }, this)
                .on('change', function(node){
                    editNode.call(this, node);
                }, this);
            if(this.collection) {
                if(self.collection.isFetched() || self.collection.isLocal()) {
                    refresh.call(self);
                } else {
                    if(self.$el.is(':visible')) self.fetch();
                }            
            }
            return this;
        },
        setMenu: function(node, menu){
            if(!node) return;
            var self = this,
                listEl = this._listEls[node.id]||this._listEls[node.cid];
            if(!listEl) return this;
            
            var button = new (App.getView('Button'))({
                size: 'small',
                menu: menu,
                click: function(){
                    if(self._inMove) stopActionMove.call(self);
                }
            });
            this._menubutton[node.id||node.cid] = button;
            listEl.closest('._node'+this.cid)
                .data('menu').append(button.$el);
            
            return this;
        },
        getMenu: function(node){
            if (!node) return;
            var button = this._menubutton[node.id]||this._menubutton[node.cid];
            if(!button) {
                var menu = new (App.getView('Dropdown'))();
                this.setMenu(node, menu);
                button=this._menubutton[node.id||node.cid];
            };        
            
            return button.getMenu();
        },
        fetch: function(){
            if(!this.collection) return;
            
            var self = this;
          
            App.view.setLoading(self.$el, true);
                   
            this.collection.fetch({
                silent: true,
                success: function(){
                    refresh.call(self);
                },
                complete: function(){
                    App.view.setLoading(self.$el, false);
                }
            });            
        },
        layout: function(){
            this.parent().layout.apply(this, arguments);
            if(this.collection && (!this.collection.isFetched()) && (!this.collection.isLocal())) this.fetch();
            return this;
        }       
    });
    
    function refresh(){
        var collection = this.collection,
            stack = _.clone(collection.getChildren(collection.rootPath)).reverse(),
            children = {},
            current,
            path,
            el;
     
        this._rootListEl.children().remove();
        this._listEls=[];
        this._menubutton=[];
     
        while (stack.length>0){ 
            current = stack.pop();
            addNode.call(this, current);
            
            path = collection.getPath(current);
            children = collection.getChildren(path);
            for(var i=children.length-1;i>=0;i--) {
                stack.push(children[i]);
            }
        }        

    }
    
    var tpl = _.template('<div class="b-diagram-root _rootList{cid}"></div>'),
        nodeTpl = _.template(
            '<div class="b-diagram-node _node{cid} scheme_{scheme}">' +
                '<div class="b-diagram-link _link{cid}">' +
                    '<div class="b-diagram-link-h">' +
                        '<div class="b-diagram-link-hh">' +
                            '<div class="b-diagram-link-arrowline"></div>' +
                            '<div class="b-diagram-link-arrow"></div>' +
                        '</div>' +                    
                    '</div>' +
                    '<div class="b-diagram-linkline"></div>' +                   
                '</div>' +
                '<div class="b-diagram-caption _captionh{cid}">' +
                    '<div class="b-diagram-caption-h t-bg _caption{cid} _menu{cid}">' +
                        '<span class="b-diagram-caption-name _name{cid}">{name}</span>' +                      
                    '</div>' +
                '</div>' + 
                '<div class="b-diagram-children _listH{cid}">' +
                    '<div class="b-diagram-childrenline"></div>' + 
                    '<div class="b-diagram-children-h _list{cid}"></div>' +
                '</div>' +
                
            '</div>'
        );
        moveTpl = _.template('<div class="b-diagram-move _move{cid}">' +
            '<div class="b-diagram-move-up"><i class="icon-arrow-down"></i><i class="icon-arrow-down"></i><i class="icon-arrow-down"></i></div>' +
            '<div class="b-diagram-move-down"><i class="icon-arrow-up"></i><i class="icon-arrow-up"></i><i class="icon-arrow-up"></i></div>' +
        '</div>');
    
    function removeNode(node){
        var path = this.collection.getPath(node),
            parentPath = this.collection.getParent(path),
            parentNode = this.collection.getNode(parentPath),
            listEl = this._listEls[node.id]||this._listEls[node.cid],
            parentListEl;
        if(parentNode) parentListEl = this._listEls[parentNode.id]||this._listEls[parentNode.cid];
            
        if(!listEl) return;
        
        if(parentListEl && !this.collection.hasChildren(parentPath)) {
            parentListEl.closest('._listH'+this.cid).hide();
        }
        listEl.closest('._node'+this.cid).remove();        
        
    }
    function addNode(node){
        var path = this.collection.getPath(node),
            parentPath = this.collection.getParent(path),
            parentNode = this.collection.getNode(parentPath),
            parentListEl = this._rootListEl;
            
        if(parentNode) parentListEl = this._listEls[parentNode.id] || this._listEls[parentNode.cid] || parentNode;
        
        parentListEl
            .closest('._listH'+this.cid).show().end()
            .append(
                renderNode.call(this, node)
            );
    }
    function renderNode(node){
        var self = this,
            el = $(nodeTpl({
                name: node.toString(),
                cid: this.cid,
                scheme: node.get('scheme') || 'default'
            })),
            path = this.collection.getPath(node);
        this._listEls[node.id||node.cid] = el.find('._list'+this.cid)
            .closest('._listH'+this.cid).hide().end();
        el.data({
            'menu': el.find('._menu'+this.cid),
            'node': node
        });
        if(node.get('moveable')) {
            this.getMenu(node)
                .addButton(new (App.getView('Button'))({
                    text: 'Переместить',
                    click: function(){
                        actionMove.call(self, self.collection.getPath(node));
                    }
                }))
                .addSeparator()
        }
        this.trigger('rendernode', node);
        return el;
    }
    function actionMove(path){
        App.msg.info({  
            title: 'Перенос ноды',
            text: 'Выберите место в которое желаете поместить ноду'
        });
        
        if(this._inMove) {
            stopActionMove.call(this);
        }
        
        this._inMove = true;
        this._movePath = path;
        delete this._movePos;
        
        
        if(!this._moveEvents) {
            var self = this;
            this._moveTarget = '._caption'+this.cid;
            this._moveEl = $(moveTpl({
                cid: this.cid
            })),
            this._moveEvents = App.isTouch() ? {
                'click': function(e){
                    var path = self._movePath;
                    if(
                        self.collection.isDescendant(
                            path, self.collection.getPath($(this).closest('._node'+self.cid).data('node'))
                        )
                    ) {
                        stopActionMove.call(self);
                        return;
                    } 

                    if(!self._dropMenu) {
                        var Button = App.getView('Button');
                        
                        var dropMenu=new (App.getView('Dropdown'))();
                        dropMenu
                                .addButton(new Button({
                                    text:'Поместить внутрь',
                                    click: function(){
                                        self._movePos='center';
                                        moveTo.call(self, dropMenu.getTarget());
                                    }
                                }))
                                .addButton(new Button({
                                    text:'Поместить перед',
                                    click: function(){
                                        self._movePos='top';
                                        moveTo.call(self, dropMenu.getTarget());
                                    }
                                }))
                                .addButton(new Button({
                                    text:'Поместить после',
                                    click: function(){
                                        self._movePos='bottom';
                                        moveTo.call(self, dropMenu.getTarget());
                                    }
                                }));
                                 
                        self._dropMenu = dropMenu;
                        
                    }
                    self._dropMenu
                        .setTarget($(this))
                        .show();                    
                }           

            } : {
                'mouseenter': function(){
                    var path = self._movePath;
                    if(self.collection.isDescendant(
                        path, self.collection.getPath($(this).closest('._node'+self.cid).data('node'))
                    )) return;
                    self._moveEl
                        .on(self._moveEventsMove)
                        .hide()
                        .appendTo($(this))
                        .fadeIn(200);
                },
                'mouseleave': function(){
                    self._moveEl
                        .off(self._moveEventsMove)
                        .detach();
                },
                'click': function(e){
                    stopActionMove.call(self);
                    return;                   
                }           

            };
            
            this._moveWindowListeners = {
                'keydown': function(e){
                    if(e.keyCode == 27) {
                        stopActionMove.call(self);
                        return false;
                    }
                }       
            }            
            this._moveEventsMove = {
                'mousemove': function(e){
                    var el = $(this),
                        height = el.outerHeight(),
                        y = el.offset().top + height - e.pageY,
                        _pos;
                    
                    if(y<height/3) {
                        _pos='bottom';
                    } else if(y<height/3*2) {
                        _pos='center';
                    } else {
                        _pos='top';
                        
                    }
                    if(_pos!=self._movePos) {
                        self._movePos=_pos;
                        el
                            .removeClass('pos_top pos_center pos_bottom')
                            .addClass('pos_'+_pos);
                    }
                    
                },
                'click': function(){
                    moveTo.call(self, $(this));
                }                
            }            
        
        } 
    
        $(window).on(this._moveWindowListeners);    
        this.$el.on(this._moveEvents, this._moveTarget); 
  
    }
    function stopActionMove(){
        this._moveEl
            .off(this._moveEventsMove)
            .detach();
        $(window).off(this._moveWindowListeners);
        this.$el.off(this._moveEvents, this._moveTarget);
        if(this._dropMenu) {
            this._dropMenu
                .setTarget()
                .hide();
        }
        this._inMove = false;
    }
    function moveTo(el){
        var path = this._movePath,
            pos = this._movePos,
            nodeEl = el.closest('._node'+this.cid),
            pathTo = this.collection.getPath(nodeEl.data('node')),
            index;
                    
        stopActionMove.call(this);

        var moveOptions = { isMovable: true };
        this.trigger('beforemove', pathTo, moveOptions);
        if(!moveOptions.isMovable) {
            App.msg.alert({  
                title: 'Невозможен перенос ноды',
                text: 'В это место невозможно переместить ноду'
            });
            return;
        }
                   
        if(pos=='top') {
            this.collection.move(path, this.collection.getParent(pathTo), pathTo);
        } else if(pos=='bottom') {
            this.collection.move(path, this.collection.getParent(pathTo), this.collection.getPath(nodeEl.next().data('node')));
        } else {
            this.collection.move(path, pathTo);
        }
    }        
    function moveNode(node, parentPath, beforePath){
        var listEl = this._listEls[node.id]||this._listEls[node.cid];
        if(!listEl) return;
        var nodeEl = listEl.closest('._node'+this.cid),
            beforeNode = this.collection.getNode(beforePath),
            parentNode = this.collection.getNode(parentPath),
            parentListEl,
            beforeNodeEl;
        if(beforeNode) {
            var beforeListEl = this._listEls[beforeNode.id]||this._listEls[beforeNode.cid];
            if(beforeListEl) beforeNodeEl = beforeListEl.closest('._node'+this.cid);
        } else if(parentNode){
            var parentListEl = this._listEls[parentNode.id]||this._listEls[parentNode.cid];
        }
        
        if(nodeEl.parent().children().length==1) nodeEl.closest('._listH'+this.cid).hide();
        
        if(beforeNodeEl) {
            nodeEl.insertBefore(beforeNodeEl);
        } else {
            nodeEl
                .appendTo(parentListEl || this._rootListEl)
                .closest('._listH'+this.cid).show();
        }    
    }

    function editNode(node){
        var listEl = this._listEls[node.id]||this._listEls[node.cid],
            nodeEl = listEl.closest('._node'+this.cid);
        nodeEl.find('>._captionh'+this.cid+' ._name'+this.cid).text(node.get('Name'));
    }
    
})(App);

