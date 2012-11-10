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
            return node?node.get('path'):null;
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
        getName: function(node){
            return node.toString();
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
        isDescendant: function(parentPath, path){
            return path.indexOf(parentPath)>=0;
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
        getDescendants: function(path){
            var stack = [this.getNode(path)],
                node,
                children,
                descentdants =[];
            
            while (stack.length>0) {
                node = stack.pop();
                if(node) descentdants.push(node);
                children = this._children[this.getPath(node)];
                if(children) {
                    children = children.reverse();
                    for(var i=0;i<children.length;i++){
                        stack.push(children[i]);
                    }
                }
            }
            descentdants.splice(0,1);
            return descentdants;
        },
        move: function(path, targerPath, beforePath){
            var descendants = this.getDescendants(path),
                currentParentPath = this.getParent(path),
                currentParentChildren = this._children[currentParentPath],
                parentChildren = this._children[targerPath],
                newPath = path.replace(currentParentPath.replace(/^\/$/,''), targerPath).replace(/\/\//,'/'),
                node=this.getNode(path),
                _node,
                _path;
            
            if(newPath == beforePath) return this;
            
            delete this._byPath[path];
            
            if(parentChildren) for(var i=0;i<parentChildren.length;i++){
                if(parentChildren[i]==node) {
                    parentChildren.splice(i,1);
                    i--;
                }
            }
            if(currentParentChildren) for(var i=0;i<currentParentChildren.length;i++){
                if(currentParentChildren[i]==node) {
                    currentParentChildren.splice(i,1);
                    i--;
                }
            }
            
            node.set('path', newPath);
            addModel.call(this, node, beforePath);
            for(var i=0;i<descendants.length;i++){
                _path=this.getPath(descendants[i]);
                delete this._children[this.getParent(_path)];
            }
            for(var i=0;i<descendants.length;i++){
                _node=descendants[i];
                _path=this.getPath(_node);
                
                delete this._byPath[_path];
                
                _node.set('path', _path.replace(path, newPath));
                addModel.call(this, _node);
            }
            
            this.trigger('move', node, this.getParent(this.getPath(node)), beforePath);
            return this;
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
    function addModel(model, beforePath){ 
        var path = model.get('path');
        this._byPath[path] = model;
        var parentPath = getPathParent(path),
            children = this._children[parentPath] = this._children[parentPath] || [],
            index = children.length;
        if(beforePath){
            for(var i=0;i<children.length;i++){
                if(children[i].get('path')==beforePath) {
                    index=i;
                    break;
                }
            }
        }
        children.splice(index, 0, model); 
    }
    function getPathParent(path){
        return path.replace(/[\/][^\/]+$/,'').replace(/^$/,'/');      
    }    

})();

