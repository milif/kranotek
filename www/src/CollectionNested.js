/*
 * @id 507c059155025 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require App.js
 * @require RPC.js
 */

(function(){

    App.defineCollection('CollectionNested', {
        init: function(){
            this._byPath = {};
            this._fetchedNodes={};
            this._children={};
            this.each(function(model){
                addModel.call(this, model);
            });
        },
        rootPath: '/',
        getPath: function(node){
            return node.get('path');
        },
        pathToArray: function(path){
            var self = this,
                pathArray = [];
            if(path) $.each(path.split('/'), function(){
                if(this=='') return;
                var prefix = pathArray[pathArray.length-1];
                prefix = prefix ? prefix+'/' : self.rootPath;
                pathArray.push(prefix+this);
            });
            return pathArray;
        },
        getParent: function(path){
            return getPathParent(path);
        },
        getNode: function(path){
            return this._byPath[path];
        },
        isLeaf: function(path){
            return this._byPath[path] ? this._byPath[path].get('leaf') : false;
        },
        isFetched: function(path){
            return this._fetchedNodes[path] && true;
        },
        hasChildren: function(path){
            return path in this._children && this._children[path].length>0;
        },
        getChildren: function(path){
            return this._children[path] || [];
        },
        fetchNode: function(path, options){
            var self = this,
                successClb = options.success;
            
            delete this._children[path];
            
            this.fetch($.extend(options, {
                add: true,
                params: {
                    path: path ? path : this.rootPath
                },
                success: function(a){
                    self._fetchedNodes[path] = true;
                    if(successClb) successClb.apply(this,arguments);
                }
            }, true));
        },
        add: function(models, options){
            var path,
                parentPath,
                model;
            
            if(!$.isArray(models)) models = [models];
                
            for(var i=0; i<models.length; i++){
                if(! (models[i] instanceof this.model)) models[i]=new (this.model)(models[i]);
            }
                
            var resp = this.parent().add.call(this, models, $.extend({}, options, {silent: true}));
            
            for(var i=0; i<models.length; i++){
                addModel.call(this, models[i]);
            }
            if(!options.silent) {
                for(var i=0; i<models.length; i++){
                    this.trigger('add', models[i], this, options);
                }
                
            }
            return resp;
        },
        remove: function(models){
            var path,
                parentPath,
                model;
            if(!$.isArray(models)) models = [models];
            for(var i=0; i<models.length; i++){
                model = models[i];
                path = model.get('path');
                parentPath = getPathParent(path);
                
                delete this._byPath[path];
                this._children[parentPath] = _.reject(this._children[parentPath], function(node){ return (node.id||node.cid) == (model.id||model.cid); });
            }        
            return this.parent().remove.apply(this, arguments);
        }       
    });
    function addModel(model){ 
        var path = model.get('path');
        this._byPath[path] = model;
        var parentPath = getPathParent(path);
        this._children[parentPath] = this._children[parentPath] || [];
        this._children[parentPath].push(model); 
    }
    function getPathParent(path){
        return path.replace(/[\/][^\/]+$/,'').replace(/^$/,'/');      
    }    

})();

