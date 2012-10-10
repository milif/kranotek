(function(App){
    App.defineView('Grid', {

        options: {
            maxHeight: 222,
            collection: null,
            collumns: null,
            selectable: false,
            minColumnWidth: 50,
            emptyText: 'Нет данных',
            autoFetch: false
        },      
        
        init: function(){
            this._length = 0;
            this._columns = [];
        },
        doRender: function(){
        
            var self = this;
            
            this.$el = $(tpl({
                cid: this.cid,
                emptytext: this.options.emptyText
            }));
            this._colsEl = this.$el.find('._cols'+this.cid);
            this._headEl = this.$el.find('._head'+this.cid);
            this._headHEl = this.$el.find('._head-h'+this.cid);
            this._bodyEl = this.$el.find('._body'+this.cid)
                .on('click', '._row'+this.cid, function(){
                    self.select($(this).data('id'));
                });
            this._bodyHEl = this.$el.find('._body-h'+this.cid)
                .css('max-height', this.options.maxHeight)
                .scroll(function(){
                    self._headHEl.scrollLeft($(this).scrollLeft());
                });
            this._emptyEl = this.$el.find('._empty'+this.cid);
            
            this._refreshButton = new (App.getView('Button'))({
                icon: 'icon-refresh',
                type: 'small',
                click: function(){
                    self.fetch();
                }
            });
            this._toolbar = new (App.getView('ToolbarHover'))();
            this._toolbar
                .add( this._refreshButton , 10)
                .setPanel(this);
            
            this.$el.on('mouseenter', '._hover'+this.cid, function(){
                var el = $(this);
                if(el.data('tooltip')) return;
                self._hoverAction = setTimeout(function(){
                    el.css('position', 'absolute');
                    var width = el.width();
                    el.css('position', 'static');
                    if(el.width()<width) {
                        var tooltip = el.data('tooltip');
                        if(!tooltip) {
                            var tooltip = new (App.getView('Tooltip'))({
                                delay: { show: 300 },
                                target: el,
                                position: 'top'
                            });
                            el.data('tooltip', tooltip);
                        }
                        tooltip
                            .setText(el.text())
                            .show();
                    }
                }, 500);
            });
            this.$el.on('mouseleave', '._hover'+this.cid, function(){
                clearTimeout(self._hoverAction);
            });
            
            addColumns.call(this, this.options.columns);
            
            this.setCollection(this.collection);
            
            return this;
        },
        doPresenter: function(){
            
            var self = this;
            
            if(!this._presenterOnce) {
                
                // Important! Remove all models listeners after remove view
                this.on('remove', function(){
                    unbindCollection.call(this);
                });
                           
                this._presenterOnce = true;
            }
            
            bindCollection.call(this);
            
        },        
        doLayout: function(){
            var columns = this._columns,
                column,
                width,
                widthRelativeEl,
                scrollbarWidth = App.view.getScrollbarWidth(),
                widthEl = this.$el.width() - scrollbarWidth,
                widthRelative = 0,
                widthFixed = 0;

            for(var i=0;i<columns.length;i++){
                column = columns[i];
                width = columns[i].width;
                if(width>10) {
                    this._colsEl.find('._col'+this.cid+':eq('+i+')').css('width', width+'px');
                    widthFixed+=width;
                } else {
                    widthRelative+=width;
                }
            }
            widthRelativeEl=widthEl-widthFixed;
            for(var i=0;i<columns.length;i++){
                column = columns[i];
                width = columns[i].width;
                if(width<=10) {
                    width=Math.max(this.options.minColumnWidth, parseInt(widthRelativeEl * (width/widthRelative) ));
                    this._colsEl.find('._col'+this.cid+':eq('+i+')').css('width', width+'px');
                }
            }
            
            this._headHEl.css('margin-right', scrollbarWidth+'px');
            this._bodyHEl.find('table').width(widthEl);
        
        },
        layout: function(){
            this.parent().layout.apply(this, arguments);
            if(this.collection && !this.collection.isFetched()) this.fetch();
            return this;
        },
        getToolbar: function(){
            return this._toolbar;
        },
        select: function(id){
            var changed = this._selectedRow!==id,
                prev = this._selectedRow;
            if(!changed) return;
            this._selectedRow=id;
            this._bodyEl
                .find('>.state_active').removeClass('state_active').end()
                .find('>[data-id="'+id+'"]').addClass('state_active').end();
            this.trigger('selectionchange', id,  prev );    
            return this;    
        },
        getSelection: function(){
            return this._selectedRow ? [this._selectedRow] : [];
        },
        setCollection: function(collection){
            var self = this;        
            unbindCollection.call(this);
            this.collection = collection;
            bindCollection.call(this);
            
            this.select();
            
            if(!collection || collection.isLocal()) {
                this._refreshButton.disable();
            } else {
                this._refreshButton.enable();
            }
            
            setTimeout(function(){
                if(!self.collection) return;
                if(self.collection.isFetched() || self.collection.isLocal()) {
                   refreshList.call(self);
                } else {
                    if(self.$el.is(':visible')) self.fetch();
                }
            },0);  
            
            return this;
        },
        fetch: function(){
            if(!this.collection) return;
            
            var self = this;
          
            App.view.setLoading(self.$el, true);
                   
            this.collection.fetch({
                silent: true,
                success: function(){
                    refreshList.call(self);
                },
                complete: function(){
                    App.view.setLoading(self.$el, false);
                }
            });
        }
    });
    function unbindCollection(){
        if(!this.collection) return;
        this.collection.off(null, null, this);
    }
    function bindCollection(){
        if(!this.collection) return;
        var self = this;
        this.collection
            .on('reset', function(){
                // TODO
            }, this)           
            .on('add', function(model, collection, options){
                addModel.call(self, model, options.index);
            }, this)
            .on('remove', function(model){
                removeModel.call(self, model);
            }, this);    
    }
    function refreshList() {
        this._length=0;
        var scrollTop = this._bodyHEl.scrollTop(),
            scrollLeft = this._bodyHEl.scrollLeft();
        this._bodyEl.children().remove();
        var models = this.collection.models;
        for (var i=0;i<models.length;i++){
            addModel.call(this, models[i], i);
        }
        updateEmpty.call(this);
        this._bodyEl.fadeIn(200);
        this._bodyHEl
            .scrollTop(scrollTop)
            .scrollLeft(scrollLeft);

    }
    function updateEmpty(){

        var isEmpty = this._length==0;
        if(isEmpty === this._isEmpty) return;

        this._isEmpty = isEmpty;
        
        if(isEmpty) {
            this._emptyEl.fadeIn(200);
            this._bodyEl.hide();
            App.view.applyInset(this._emptyEl);
        } else {
            this._emptyEl.hide();
             this._bodyEl.fadeIn(200);
        }
                 
    }
    function addModel(model, index){
    
        var self = this,
            trEl,
            prevEl;
        
        trEl = renderRow.call(this, model);
        
        if(this._length>index) {
            prevEl = this._bodyEl.find('>:eq('+index+')');
        }
        
        if(prevEl && prevEl.length>0) {
            trEl.insertBefore(prevEl);
        } else {
            trEl.appendTo(this._bodyEl);
        }
        model.off('change', null, this);
        model.on('change', function(){
            var newRow = renderRow.call(self, model);
            trEl.replaceWith(newRow);
            trEl = newRow;
        }, this);
        
        this._length++;
        
        updateEmpty.call(this);
               
    }
    function renderRow(model){
        var tr='',
            trEl,
            value;
      
        for (var i=0;i<this._columns.length;i++){
            value = model.get(this._columns[i].key);
            if(this._columns[i].render) value = this._columns[i].render.call(this, value);
            if(typeof value=='boolean') value=value ? '<i class="icon-ok"></i>' : '';
            tr+= tdTpl({
                cid: this.cid,
                text: value,
                align: this._columns[i].align || 'left'
            });
        }
        
        trEl = $(trTpl({
            cid: this.cid,
            id: model.id || model.cid,
            items: tr
        }));
      
        if(this._selectedRow == (model.id || model.cid)) trEl.addClass('state_active');        
        
        return  trEl;
    }
    function removeModel(model){
        var itemEl = this._bodyEl.find('>[data-id="'+(model.id || model.cid)+'"]');
        if(itemEl.length==0) return;
        if(itemEl.is(':visible')) {
            itemEl.fadeOut(200, function(){
                $(this).remove();
            });
        } else {
            itemEl.remove();
        }
        
        this._length--;
        if((model.id || model.cid) == this._selectedRow) this.select();
        updateEmpty.call(this);
        
    }
    function addColumns(columns){
        var column;
        this._columns = this._columns.concat(columns);
        for(var i=0;i<columns.length;i++){
            columns[i].width = columns[i].width || 1;
            column = thTpl({
                cid: this.cid,
                text: columns[i].name,
                align: columns[i].align || 'left'
            });
            this._colsEl.last().append('<col class="_col'+this.cid+'"/>');
            this._headEl.append(column);
        }
    }
    
    var tpl = _.template(
        '<div class="b-grid"><div class="b-grid-h">' +
            '<div class="b-grid-head _head-h{cid} _head{cid} _cols{cid}"></div>' +
            '<div class="b-grid-body _body-h{cid}">' +
                '<table class="table table-striped table-hover">' +
                  '<colgroup class="_cols{cid}"></colgroup>' +
                  '<tbody class="_body{cid}"></tbody>' +
                '</table>' + 
                
            '</div>' +
        '</div><div class="b-grid-empty _empty{cid}">{emptytext}</div></div>'
        ),
        thTpl = _.template('<div class="b-grid-th align_{align} _col{cid}"><div class="b-grid-th-h _hover{cid}">{text}</div></div>'),
        trTpl = _.template('<tr data-id={id} class="b-grid-row _row{cid}">{items}</tr>'),
        tdTpl = _.template('<td class="b-grid-td t-bg align_{align}"><div class="b-grid-td-h _td{cid} _hover{cid}">{text}</div></td>');
    
})(App);

