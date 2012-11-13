/*
 * @id 509ba02dbd4e6 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
* @require modules/report/model.FormReportNodeData.js
* @require modules/class/collection.Class.js
*/
App.defineCollection('FormReportNodeData', {
    extend: 'CollectionNested',
    model: App.getModel('FormReportNodeData'),    
    fetchNode: function(path, options){
        var self = this,
            successClb = options.success,
            completeClb = options.complete;
        
        delete this._children[path];

        var ClassCollection = new (App.getCollection('Class'))();

        if(path == '/') {
            ClassCollection.fetch($.extend(options, {
                silent: true,
                params: {
                    path: path ? path : this.rootPath
                },
                success: function(){
                    _.each(ClassCollection.models, function(model) {
                        model.set('Name', model.get('ClassName'));
                        self.add(model, {silent: true});
                    });
                    self._fetchedNodes[path] = true;
                    if(successClb) successClb.apply(self,arguments);
                    if(completeClb) completeClb.call(self);
                },
                complete: function(){
                    App.view.setLoading(self.$el, false);
                }
            }));
        } else {
            var presenterCollection = new (App.getCollection('ClassPresenter'))(null, {
                params: {
                    'ClassId': this.id
                }
            });
            presenterCollection.fetch($.extend(options, {
                silent: true,
                params: {
                    path: path ? path : this.rootPath
                },
                success: function(){
                    _.each(ClassCollection.models, function(model) {
                        self.add(model, {silent: true});
                    });
                    self._fetchedNodes[path] = true;
                    if(successClb) successClb.apply(self,arguments);
                    if(completeClb) completeClb.call(self);
                },
                complete: function(){
                    App.view.setLoading(self.$el, false);
                }
            }));
        }
    }
});