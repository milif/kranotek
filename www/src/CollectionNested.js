(function(){

    App.defineCollection('CollectionNested', {
        init: function(){
            this._byPath = {};
            this._fetchedNodes={};
            this._children={};
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
        isLeaf: function(path){
            return this._byPath[path] ? this._byPath[path].get('leaf') : false;
        },
        isFetched: function(path){
            return this._fetchedNodes[path] && true;
        },
        getChildren: function(path){
            return this._children[path];
        },
        fetchNode: function(path, options){
            var self = this,
                successClb = options.success;
            
            delete this._children[path];
            
            this.fetch($.extend(options, {
                params: {
                    path: path ? path : this.rootPath
                },
                success: function(a){
                    self._fetchedNodes[path] = true;
                    if(successClb) successClb.apply(this,arguments);
                }
            }, true));
        },
        add: function(models){
            var path,
                parentPath,
                model
                resp = this.parent().add.apply(this, arguments);
            for(var i=0; i<models.length; i++){
                model = this.get(models[i].id);
                path = model.get('path');
                this._byPath[path] = model;
                parentPath = getPathParent(path);
                this._children[parentPath] = this._children[parentPath] || [];
                this._children[parentPath].push(model);
            }
            return resp;
        },
        remove: function(models){
            var path,
                parentPath,
                model;
            for(var i=0; i<models.length; i++){
                model = this.get(models[i].id);
                path = model.get('path');
                parentPath = getPathParent(path);
                
                delete this._byPath[path];
                _.reject(this._children[parentPath], function(node){ return node.id == model.id; });
            }        
            return this.parent().remove.apply(this, arguments);
        }       
    });
    
    function getPathParent(path){
        return path.replace(/[\/][^\/]+$/,'').replace(/^$/,'/');      
    }    

})();

