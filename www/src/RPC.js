/*
 * @id 507c0591550f7 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require App.js
 */

(function(App){

    function Request(api, params){
        var self = this;
        this.request = $.ajax({
                url: (App.env.apiUrl || '') + '/api/' + api + (App.env.apiUrlSuffix || ''),
                type: 'post',
                data: JSON.stringify(params),
                dataType: 'json',
                contentType: 'application/json',
                success: function(a,b,c){
                    if(a.success) {
                        self.trigger('success', a.data,b,c);
                        return;
                    }
                    if(a.error) showError(a);
                    self.trigger('error', a.data,b,c);
                },
                error: function(a,b,c){
                    if(a.statusText=='abort') return;
                    showError(a);
                    self.trigger('error', a,b,c);
                },
                complete: function(a,b,c){
                    if(a.statusText=='abort') return;
                    self.trigger('complete', a,b,c);
                }                           
        });
    }
    
    Request.prototype = _.extend({
        abort: function(){
            this.request.abort();
            return this;
        }
    }, Backbone.Events);

    var self = {
        request: function(api, params){
            return new Request(api, params);
        }
    };
    
    App.rpc = self;

    function showError(resp){
        var error = typeof resp.error == 'object' ? resp.error : {
            title: resp.status + ' ' + resp.statusText,
            msg: 'Ошибка выполнения запроса'
        };  
        App.msg.alert({
            title: error.title,
            text:  error.msg
        });        
    }
    
})(App);
