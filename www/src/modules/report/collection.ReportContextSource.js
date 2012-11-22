/*
* @require modules/report/model.ReportContextSource.js
* @require CollectionNested.js
*/
App.defineCollection('ReportContextSource', {
    model: App.getModel('ReportContextSource'),
    extend: 'CollectionNested',
    getName: function(node){
        return node.get('Name');
    }
});
