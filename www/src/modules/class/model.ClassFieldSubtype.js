App.defineModel('ClassFieldSubtype', {
    defaults: {
        'id': null,
        'Value': ''
    },
    changePosition: function(index, options){
        if(!this.id) return this;
        if(!options) options = {};
        App.rpc.request(this.api + '.position', {
            'id': this.id,
            'index': index
        })
            .on('success', options.success, this)
            .on('error', options.error, this)
            .on('complete', options.complete, this);  
       return this;
    },
    validateModel: function(attrs){
        var errors = [],
            attr;

        attr = attrs.Value;
        if(typeof attr !='undefined') {
            if(attr.length == 0) {
                errors.push({ name: 'Value', msg: 'Значение не может быть пустым'});
            }
        }
        return errors.length > 0 ? errors : null ;
    },
    api: 'classfieldsubtype'
});
