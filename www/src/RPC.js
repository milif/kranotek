(function(ns){

    function Request(api, params){
        var self = this;
        this.request = $.ajax({
                url: (App.env.apiUrl || '') + '/api/' + api + (App.env.apiUrlSuffix || ''),
                type: 'post',
                data: JSON.stringify(params),
                dataType: 'json',
                contentType: 'application/json',
                success: function(a,b,c){
                    self.trigger('success', a,b,c);
                },
                error: function(a,b,c){
                    self.trigger('error', a,b,c);
                },
                complete: function(a,b,c){
                    self.trigger('complete', a,b,c);
                }                           
        });
    }
    
    Request.prototype = _.extend({}, Backbone.Events);

    var self = {
        request: function(api, params){
            return new Request(api, params);
        }
    };
    
    ns.rpc = self;
    
})(App);
