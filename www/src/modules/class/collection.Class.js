/*
 * @require modules/class/model.Class.js
 * @require CollectionNested.js   
 */
App.defineCollection('Class', {
    model: App.getModel('Class'),
    extend: 'CollectionNested',
    getName: function(node){
        return node.get('ClassName');
    }
});
