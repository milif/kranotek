/*
 * @id 508ff3ac3f608 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require App.js
 * @require view/button/Button.js 
 * @require b/diagram.css 
 */

(function(App){
    App.defineView('Diagram', {

        tagName: "div",
        className: "b-diagram",

        options: {
        },
        
        init: function(){
            this._listEls = [];
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
                    menu = nodeEl.data('menubutton');
                
                if(menu&&target.closest(menu.$el).length>0) return;
                
                self.trigger('clicknode', self.collection.getPath(node), node);
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
                },this);
            if(this.collection) {
                if(self.collection.isFetched() || self.collection.isLocal()) {
                    refresh.call(self);
                } else {
                    if(self.$el.is(':visible')) self.fetch();
                }            
            }
            return this;
        },
        setMenu: function(path, menu){
            var listEl = this._listEls[path];
            if(!listEl) return this;
            
            var button = new (App.getView('Button'))({
                size: 'small',
                menu: menu
            });
            listEl.closest('._node'+this.cid)
                .data('menubutton', button)
                .data('menu').append(button.$el);
            
            return this;
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
                '<div class="b-diagram-caption"><div class="b-diagram-caption-h t-bg _caption{cid} _menu{cid}"><span class="b-diagram-caption-name">{name}</span></div></div>' + 
                '<div class="b-diagram-children _listH{cid}">' +
                    '<div class="b-diagram-childrenline"></div>' + 
                    '<div class="b-diagram-children-h _list{cid}"></div>' +
                '</div>' +
                
            '</div>'
        );
    
    function removeNode(node){
        var path = this.collection.getPath(node),
            parentPath = this.collection.getParent(path),
            listEl = this._listEls[path],
            parentListEl = this._listEls[parentPath];
            
        if(!listEl) return;
        
        if(parentListEl && !this.collection.hasChildren(parentPath)) {
            parentListEl.closest('._listH'+this.cid).hide();
        }
        listEl.closest('._node'+this.cid).remove();        
        
    }
    function addNode(node){
        var path = this.collection.getPath(node),
            parentPath = this.collection.getParent(path),
            parentListEl = this._listEls[parentPath] || this._rootListEl;
        parentListEl
            .closest('._listH'+this.cid).show().end()
            .append(
                renderNode.call(this, node)
            );
         this.trigger('addnode', path, node);
    }
    function renderNode(node){
        var el = $(nodeTpl({
            name: node.toString(),
            cid: this.cid,
            scheme: node.get('scheme') || 'default'
        }));
        this._listEls[this.collection.getPath(node)] = el.find('._list'+this.cid)
            .closest('._listH'+this.cid).hide().end();
        el.data({
            'menu': el.find('._menu'+this.cid),
            'node': node
        });
        return el;
    }
    
})(App);

