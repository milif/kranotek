App.defineModel('ModelClass', {
    api: 'class',
    validate: function(){
        var errors = {},
            text = this.get('text') || '';
        
        if(text.length < 5) 
        
        return {
            fields: {
                'text': 
            }
        }
    }    
});
