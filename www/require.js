(function(){
    var d = window.document,
        el = d.getElementById('require'),
        requireFolder = el.src.replace(/[^\/]+$/,''),
        requireConfig = el.src.replace('.js','.json'),
        rootPath = requireConfig.replace(/^.+:\/\/[^\/]+/,'').replace(/[^\/]+$/,''),
        builderPath,
        config,
        loadedScripts={};

    var xhr = new XMLHttpRequest();
    xhr.open('GET', requireConfig, false);
    xhr.send(null);          
    config = JSON.parse(xhr.responseText);
    builderPath = requireFolder + config.builderPath;

    function require(){
        var xhr = new XMLHttpRequest(),
            args = arguments,
            callback = typeof args[args.length-1] == 'function' ? args[args.length-1] : null,
            params = [];
        xhr.open('POST', builderPath, true);
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                if(require.finish) require.finish();
                loadData(data.include, callback);
            }
        };    
        xhr.send(JSON.stringify({
            "require": args, 
            "rootPath": rootPath, 
            "includePath": config.includePath,
            "loadedScripts": loadedScripts
        }));
    }    
    
    function loadData(data, callback){
        var count = 0;
        if(data.css) for (var i = 0; i < data.css.length; i++) {
            if(loadedScripts[data.css[i]]) continue;
            addStylesheet(data.css[i], onload);
            count++;
            loadedScripts[data.css[i]] = true;
        }
        if(data.js) for (var i = 0; i < data.js.length; i++) {
            if(loadedScripts[data.js[i]]) continue;
            addScript(data.js[i], onload);
            count++;
            loadedScripts[data.js[i]] = true;
        }             
        function onload(){
            if(count--==1 && callback) callback();
        }
    }
    
     
    function addScript(src, onload) {
        
        if(d.getElementById(src)) return;
        var headID = document.getElementsByTagName("head")[0];         
        var newScript = document.createElement('script');
        newScript.async = false;
        newScript.type = 'text/javascript';
        newScript.src = src;
        newScript.onload = onload;
        headID.appendChild(newScript);
    }
    function addStylesheet(src, onload) {
        if(d.getElementById(src)) return;
        var headID = document.getElementsByTagName("head")[0];         
        var ss = document.createElement('link');
        ss.rel = 'stylesheet';
        ss.async = false;
        ss.href = src;
        ss.onload = onload;
        headID.appendChild(ss);
    }
    
    window.require = require;
})(window);
