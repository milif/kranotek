App.defineCollection('CollectionClassFunction', {
    model: App.getModel('ModelClassFunction'),
    getName: function(node){
        return node.get('Name');
    }
});
