App.defineView('NestedList', {

    options: {
        path: null,
        collection: null,
        listMinWidth: 100   
    },
    
    tpl: _.template('<div class="container-fluid b-nestedlist">' +
              '<div class="row-fluid b-nestedlist-lists _lists{cid}"></div>' +
          '</div>'),
    tplList: _.template('<div class="b-nestedlist-lists-hh _list{cid}"><div class="b-nestedlist-lists-h">' +
                    '<table class="table table-hover _items{cid}"></table>' +
                '</div></div>'),
    tplItem: _.template('<tr class="b-nestedlist-item _item{cid}"><td >{item}</td></tr>'),
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
            .on('add remove', function(node){
                self.renderList(self.collection.getPath(node));
            }, this);
    },
    updateLists: function(state){
        var self = this,
            maxLists = Math.min(6, Math.floor(this.$el.width() / this.options.listMinWidth)),
            path = this.collection.pathToArray(this._state.path),
            level = path.length,
            isLeaf = this.collection.isLeaf(this._state.path),
            _lists = [],
            offset,
            listEl,
            currentPath,
            currentLevel,
            spanIndex,
            levelRange,
            scrollTop,
            scrollEl
            toolbar,
            newList = [];
            
        maxLists = Math.min(level + (isLeaf ? 0 : 1 ), maxLists);
        
        maxLists = 12/Math.ceil(12 / maxLists);
        //spanIndex = 12 / maxLists;
               
        offset = Math.min(level + (isLeaf ? 0 : 1 ) - maxLists, this._state.offset );
        
        if(!this._lists) this._lists = [];
        
        for(var i=level-maxLists-offset - (isLeaf ? 1 : 0 ); i<level-offset - (isLeaf ? 1 : 0 ); i++) {
            currentPath = path[i] || this.collection.rootPath;
            if(isLeaf && i == path.length-1) continue;
            if(this._lists[currentPath]) {
                listEl = this._lists[currentPath];
            } else {
                listEl = $(this.tplList({
                    cid: this.cid
                }))
                    .data('path', currentPath);
                    
                toolbar = new (App.getView('ToolbarHover'))();
                toolbar.add(new (App.getView('Button'))({
                    icon: 'icon-refresh',
                    listeners: {
                        'click': function(){
                            self.refreshList(
                                this.$el.closest('._list'+self.cid).data('path')
                            );
                        }
                    }
                }));
                listEl.append(toolbar.$el);
                   
                newList.push(listEl);
            }
            _lists.push(listEl);
            _lists[currentPath] = listEl;
            
        }
        
        /* TO DO: Animate */
        spanIndex = 12 / maxLists;
        this._listsEl.children().attr('_hide', 1);
        for (var i=0; i<_lists.length; i++){
            listEl = _lists[i];
            scrollEl = listEl.children().eq(0);
            scrollTop = scrollEl.scrollTop();
            listEl
                .removeClass('span1 span2 span3 span4 span6 span12')
                .addClass('span'+spanIndex)
                .appendTo(this._listsEl)
                .removeAttr('_hide');
            scrollEl.scrollTop(scrollTop);
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
            listEl;
        for(var i=0; i<this._lists.length;i++){
            this._lists[i]
                .find('._item'+this.cid+'.state_active').removeClass('state_active state_active-current');
        }
        
        for(var i=-1; i<path.length-1;i++){
            listEl = this._lists[path[i] || this.collection.rootPath];
            if(!listEl) continue;
            listEl
                .find('._item'+this.cid+'[data-path="'+path[i+1]+'"]')
                   .addClass('state_active'+(i==path.length-2 ? ' state_active-current' : ''));
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
        
        items = $(items)
            .appendTo(
                listEl
                    .find('._items'+this.cid)
                        .children().remove().end()
            );
            
        if(isNew) items.hide().fadeIn(200);
    },
    fetchNode: function(path){
        var self = this,
            elNode = this.getNode(path),
            elList = this._lists[path];

        self.setLoading(elNode, true);
        self.setLoading(elList, true); 
               
        this.collection.fetchNode(path, {
            silent: true,
            presenter: this,
            success: function(){
                self.renderList(path);
                self.updatePath();
            },
            complete: function(){
                self.setLoading(elNode, false);
                self.setLoading(elList, false);
            }
        });             
    },
    getNode: function(node){
        if(!node) return;
    },
    select: function(path){
        var current = _.clone(this._state);
        this._state.path = path;
        this.updateLists(current);
    }
});
