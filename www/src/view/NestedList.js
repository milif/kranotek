(function(){
    App.defineView('NestedList', {

        options: {
            path: null,
            collection: null,
            listMinWidth: 200,
            emptyText: 'Нет данных'
        },
        
        tpl: _.template('<div class="b-nestedlist _lists{cid}"></div>'),
        tplList: _.template('<div class="b-nestedlist-lists-hh _list{cid}"><div class="b-nestedlist-lists-h _scroll{cid}">' +
                        '<table class="table table-hover _items{cid}"></table><div class="b-nestedlist-empty _empty{cid}">{emptytext}</div>' +
                    '</div></div>'),
        tplItem: _.template('<tr class="b-nestedlist-item t-bg _item{cid}"><td class="t-bg" >{item}</td></tr>'),
        init: function(){
        
            var self = this;
            
            this.$el.on('click', "._item"+this.cid, function(){
                self.select($(this).data('path'));
            });
        
            this._state = {
                'path': this.options.path || this.collection.rootPath,
                'offset': 0
            }
        },    
        doRender: function(){
        
            var self = this;
        
            this.$el.append($(this.tpl({
                cid: this.cid
            })));
            
            this._listsEl = this.$el.find('._lists'+this.cid);
            
            this.updateLists();

            return this;    
        },
        doPresenter: function(){
            
            var self = this;
            
            if(!this._presenterOnce) {
                
                // Important! Remove all models listeners after remove view
                this.on('remove', function(){
                    this.collection.off(null, null, this);
                }); 
                           
                this._presenterOnce = true;
            }
            
            this.collection 

                .on('reset', function(){
                    // TO DO
                }, this)            
                .on('add', function(node){
                    var path = self.collection.getPath(node),
                        parentPath = self.collection.getParent(path);
                    self.renderList(parentPath);
                }, this)
                .on('remove', function(node){
                    var path = this.collection.getPath(node),
                        parentPath = this.collection.getParent(path),
                        listEl = this._lists[parentPath];
                    if(listEl) listEl.find('[data-path="'+path+'"]').fadeOut(200, function(){
                        $(this).remove();
                    });
                    if(this._state.path.search(path) != -1 ) this.select(parentPath); 
                    if(this.collection.getChildren(parentPath).length==0) self.renderList(parentPath);
                }, this);
        },
        updateLists: function(state){
            var self = this,
                maxLists = Math.max(1,Math.min(6, Math.floor(this.$el.width() / this.options.listMinWidth))),
                path = this.collection.pathToArray(this._state.path),
                level = path.length,
                isLeaf = this.collection.isLeaf(this._state.path),
                _lists = [],
                offset,
                listEl,
                currentPath,
                currentLevel,
                width,
                levelRange,
                scrollTop,
                scrollEl,
                toolbar,
                children,
                newList = [];
                
            maxLists = Math.min(level + (isLeaf ? 0 : 1 ), maxLists);
                   
            offset = Math.min(level + (isLeaf ? 0 : 1 ) - maxLists, this._state.offset );
            
            if(!this._lists) this._lists = [];
            
            for(var i=level-maxLists-offset - (isLeaf ? 1 : 0 ); i<level-offset - (isLeaf ? 1 : 0 ); i++) {
                currentPath = path[i] || this.collection.rootPath;
                if(isLeaf && i == path.length-1) continue;
                if(this._lists[currentPath]) {
                    listEl = this._lists[currentPath];
                } else {
                    listEl = $(this.tplList({
                        cid: this.cid,
                        emptytext: this.options.emptyText
                    }))
                        .data('path', currentPath);
                        
                    toolbar = new (App.getView('ToolbarHover'))();
                    toolbar.add(new (App.getView('Button'))({
                        icon: 'icon-refresh',
                        type: 'small',
                        listeners: {
                            'click': function(){
                                self.refreshList(
                                    this.$el.closest('._list'+self.cid).data('path')
                                );
                            }
                        }
                    }), 10);
                    toolbar.setPanel(listEl);
                    listEl.data('toolbar', toolbar);
                    this.trigger('appendlist', currentPath, toolbar);
                    newList.push(listEl);
                }
                _lists.push(listEl);
                _lists[currentPath] = listEl;
                
            }
            
            /* TO DO: Animate */
            width = (( 100 - (_lists.length -1 ) * 2.5 ) / _lists.length) + '%';
            children = this._listsEl.children().attr('_hide', 1);
            for (var i=0; i<_lists.length; i++){
                listEl = _lists[i];
                if(children.index(listEl) != i) {
                    scrollEl = listEl.children().eq(0);
                    scrollTop = scrollEl.scrollTop();
                    listEl
                        .appendTo(this._listsEl);
                    scrollEl.scrollTop(scrollTop);                   
                } 
                listEl
                    .width(width)
                    .removeAttr('_hide');
            }
            this._listsEl.children('[_hide]').remove();
     
            this._lists = _lists;
            
            for (var i=0; i<newList.length; i++){
                currentPath = newList[i].data('path');
                if(this.collection.isFetched(currentPath)) {
                    this.renderList(currentPath);
                } else {
                    this.refreshList(currentPath);
                } 
            }
     
            this.updatePath(state);
     
            return this; 
        },
        updatePath: function(state){
            
            var path = this.collection.pathToArray(this._state.path),
                listEl,
                itemEl,
                scrollEl;
            
            for(var i=-1; i<path.length-1;i++){            
                listEl = this._lists[path[i] || this.collection.rootPath];
                if(!listEl) continue;
                itemEl = listEl
                    .find('._item'+this.cid+'[data-path="'+path[i+1]+'"]');
                if(itemEl.length>0 && !itemEl.is('.state_active')) {
                    listEl
                        .find('._item'+this.cid+'.state_active').removeClass('state_active state_active-current');          
                    scrollEl = listEl.find('._scroll'+this.cid);
                    scrollEl.animate({
                        scrollTop: itemEl.offset().top - itemEl.parent().offset().top - scrollEl.height()/2 + itemEl.height()/2
                    }, 200); 
                }           
                itemEl.addClass('state_active'+(i==path.length-2 ? ' state_active-current' : ''));
            }

        },
        refreshList: App.debounce( function(path) { // Important!!!
            this.fetchNode(path);
        }, 100, false, true),
        renderList: function(path){
            var listEl = this._lists[path];
            if(!listEl) return;
            
            var nodes = this.collection.getChildren(path),
                isNew = listEl.children().length==0,
                items = [];
            
            for(var i=0; i<nodes.length; i++) {
                items.push(
                    $(this.tplItem({
                        cid: this.cid,
                        item: this.collection.getName(nodes[i])
                    }))
                        .attr('data-path', this.collection.getPath(nodes[i]))
                        .get(0)
                );
            }
            
            if(nodes.length == 0) {
                items = listEl
                    .find('._items'+this.cid).hide().end()
                    .find('._empty'+this.cid).show();

                App.view.applyInset(items);
            } else {
                items = $(items)
                    .appendTo(
                        listEl
                            .find('._empty'+this.cid).hide().end()
                            .find('._items'+this.cid)
                                .show()
                                .children().remove().end()
                    );            
            }
   
            if(isNew) items.hide().fadeIn(200);
        },
        fetchNode: function(path){
            var self = this,
                elList = this._lists[path];

            App.view.setLoading(elList, true);
                   
            this.collection.fetchNode(path, {
                silent: true,
                presenter: this,
                success: function(){
                    self.renderList(path);
                    self.updatePath();
                },
                complete: function(){
                    App.view.setLoading(elList, false);
                }
            });             
        },
        getListNode: function(path){
            if(this._state.path==path || !this._state.path) return;
            if (path =='/' ) path = '';
            return path + /\/[^\/]+/.exec(this._state.path.replace(path))[0];
        }, 
        select: function(path, isSilent){
            if( path == this._state.path ) return;
            var current = _.clone(this._state);
            this._state.path = path;
            this.updateLists(current);
            if(!isSilent) this.trigger('selectionchange', [path], [current.path]);
        },
        getListToolbar: function(path){
            var listEl = this._lists[path];
            return listEl ? listEl.data('toolbar') : null;
        },
        isSelectedList: function(path){
            return path != this._state.path;
        },
        getLists: function(){
            var lists = [];
            for(var i=0;i<this._lists.length;i++){
                lists.push(this._lists[i].data('path'));
            }
            return lists;
        },
        getToolbar: function(path){
            
        }
    });
})();
