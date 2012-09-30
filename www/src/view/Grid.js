(function(App){
    App.defineView('Grid', {

        options: {
            maxHeight: 222,
            collection: null,
            collumns: null,
            selectable: false,
            minColumnWidth: 50,
            emptyText: 'Нет данных'
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
            
            this._toolbar = new (App.getView('ToolbarHover'))();
            this._toolbar
                .add(new (App.getView('Button'))({
                    icon: 'icon-refresh',
                    type: 'small',
                    click: function(){
                        self.fetch();
                    }
                }), 10)
                .setPanel(this);
            
            addColumns.call(this, this.options.columns);
            
            setTimeout(function(){
                if(self.collection.isFetched()) {
                   refreshList.call(self);
                } else {
                    self.fetch();
                }            
            },0);
            
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
                    // TODO
                }, this)           
                .on('add', function(model, collection, options){
                    addModel.call(self, model, options.index);
                }, this)
                .on('remove', function(model){
                    removeModel.call(self, model);
                }, this);
        },        
        doLayout: function(){
            var columns = this._columns,
                column,
                width,
                widthRelativeEl,
                scrollbarWidth = 20,
                widthEl = this.$el.width() - scrollbarWidth,
                widthRelative = 0,
                widthFixed = 0;
            for(var i=0;i<columns.length;i++){
                column = columns[i];
                width = columns[i].width;
                if(width>10) {
                    this._colsEl.find('col:eq('+i+')').attr('width', width+'px');
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
                    this._colsEl.find('col:eq('+i+')').attr('width', width+'px');
                }
            }
            var headLastCol = this._headHEl.find('col:last');
            headLastCol.attr('width', parseInt(headLastCol.attr('width'))+scrollbarWidth);
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
        fetch: function(){
          
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
            this._emptyEl.fadeOut(200);
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
            trEl.replaceWith(renderRow.call(self, model));
        }, this);
        
        this._length++;
        
        updateEmpty.call(this);
               
    }
    function renderRow(model){
        var tr='',
            trEl;
            
        for (var i=0;i<this._columns.length;i++){
            tr+= tdTpl({
                cid: this.cid,
                text: model.get(this._columns[i].key)
            });
        }
        
        trEl = $(trTpl({
            cid: this.cid,
            id: model.id,
            items: tr
        }));
        
        return  trEl;
    }
    function removeModel(model){
        var itemEl = this._bodyEl.find('>[data-id="'+model.id+'"]');
        if(itemEl.length==0) return;
        if(itemEl.is(':visible')) {
            itemEl.fadeOut(200, function(){
                $(this).remove();
            });
        } else {
            itemEl.remove();
        }
        
        this._length--;
        if(model.id == this._selectedRow) this.select();
        updateEmpty.call(this);
        
    }
    function addColumns(columns){
        var column;
        this._columns = this._columns.concat(columns);
        for(var i=0;i<columns.length;i++){
            columns[i].width = columns[i].width || 1;
            column = thTpl({
                text: columns[i].name
            });
            this._colsEl.append('<col/>');
            this._headEl.append(column);
        }
    }
    
    var tpl = _.template(
        '<div class="b-grid"><div class="b-grid-h">' +
            '<div class="b-grid-head _head-h{cid}">' +
                '<table class="table">' +
                  '<colgroup class="_cols{cid}"></colgroup>' +
                  '<thead>' +
                    '<tr class="_head{cid}"></tr>' +
                  '</thead>' +
                '</table>' +
            '</div>' +
            '<div class="b-grid-body _body-h{cid}">' +
                '<table class="table table-striped table-hover">' +
                  '<colgroup class="_cols{cid}"></colgroup>' +
                  '<tbody class="_body{cid}"></tbody>' +
                '</table>' + 
                
            '</div>' +
        '</div><div class="b-grid-empty _empty{cid}">{emptytext}</div></div>'
        ),
        thTpl = _.template('<th><div class="b-grid-th-h">{text}</div></th>'),
        trTpl = _.template('<tr data-id={id} class="b-grid-row _row{cid}">{items}</tr>'),
        tdTpl = _.template('<td class="b-grid-td t-bg"><div class="b-grid-td-h _td{cid}">{text}</div></td>');
    
})(App);

