(function(){
    var d = window.document,
        el = d.getElementById('require'),
        attr = el.attributes,
        builderPath = /^(.*?\/)[^\/]*$/.exec(attr.src)[1]+'builder/';

    function require(){
        var xhr = new XMLHttpRequest(),
            callback;
        xhr.open('GET', builderPath, true);
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                if(callback) callback();
            }
        };    
        xhr.send(JSON.stringify(params));
    }    
    
    data = eval("(" + xhr.responseText + ")");
    
    ns = createNamespaceObj(data.ns);
    ns[0][ns[1]] = {
        env: data.env,
        ns: ns
    };   
    
    if(data.css && data.css.beforepageload) {
        bf = data.css.beforepageload;
        for (var i = 0; i < bf.length; i++) {
            write('<link id="'+bf[i]+'" rel="stylesheet" href="'+bf[i]+'">');
        }         
    }    
    
    if(data.js && data.js.beforepageload) {
        bf = data.js.beforepageload;
        for (var i = 0; i < bf.length; i++) {
            write('<script id="'+bf[i]+'" type="text/javascript" src="'+bf[i]+'"></'+'script>');
        }         
    }   
    
    window.onload = function(){
        if(data.css && data.css.pageload) {
            bf = data.css.pageload;
            for (var i = 0; i < bf.length; i++) {
                addStylesheet(bf[i]);
            }         
        }    
        if(data.js && data.js.pageload) {
            bf = data.js.pageload;
            for (var i = 0; i < bf.length; i++) {
                addScript(bf[i]);
            }         
        }        
    };     
    
    function createNamespaceObj(name) {

        var d = name.split('.'),
            c=window;
        
        for(var i=0; i<d.length-1; i++) {
            c[d[i]]=c[d[i]] || {};
            c=c[d[i]];
        }
        
        return [c, d[d.length-1]];
    }    
    
    function write(content) {
        document.write(content);
    }
     
    function addScript(src) {
        if(d.getElementById(src)) return;
        var headID = document.getElementsByTagName("head")[0];         
        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.src = src;
        headID.appendChild(newScript);
    }
    function addStylesheet(src) {
        if(d.getElementById(src)) return;
        var headID = document.getElementsByTagName("head")[0];         
        var ss = document.createElement('link');
        ss.rel = 'stylesheet';
        ss.href = src;
        headID.appendChild(ss);
    }
    
    window.require = require;
})(window);
