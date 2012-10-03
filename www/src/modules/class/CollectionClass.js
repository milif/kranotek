App.defineCollection('CollectionClass', {
    model: App.getModel('ModelClass'),
    extend: 'CollectionNested',
    getName: function(node){
        return node.get('ClassName');
    }
});
