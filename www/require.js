/*
 * Параметры в URL:
 *   - debug=1  Принудительно отменяет режим компиляции
 */

(function(){
    var d = window.document,
        el = d.getElementById('require'),
        requireFolder = el.src.replace(/[^\/]+$/,''),
        requireConfig = el.src.replace('.js','.json'),
        rootPath = requireConfig.replace(/^.+:\/\/[^\/]+/,'').replace(/[^\/]+$/,''),
        builderPath,
        config,
        isDebug = /debug=1/.test(window.location.search),
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
            request = JSON.stringify({
                "compile": isDebug? false : config.compile||false,
                "require": args, 
                "rootPath": rootPath, 
                "includePath": config.includePath,
                "loadedScripts": loadedScripts
            });
        xhr.open('POST', builderPath, true);
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                if(isDebug) console.log('require.response',data);
                if(require.finish) require.finish();
                loadData(data.include, callback);
            }
        };
        if(isDebug) console.log('require',request);
        xhr.send(request);
    }    
    
    function loadData(data, callback){
        var count = 0;
        if(data.css) for (var i = 0; i < data.css.length; i++) {
            if(loadedScripts[data.css[i][0]]) continue;
            if(data.css[i][1]) {
                addStylesheet(data.css[i][1], onload);
                count++;
            }
            loadedScripts[data.css[i][0]] = true;
        }
        if(data.js) for (var i = 0; i < data.js.length; i++) {
            if(loadedScripts[data.js[i][0]]) continue;
            if(data.js[i][1]) {
                addScript(data.js[i][1], onload);
                count++;
            }
            loadedScripts[data.js[i][0]] = true;
        }             
        function onload(){
            if(isDebug) console.log('require.onload',this.src||this.href);
            if(count--==1 && callback) callback();
        }
    }

    function addScript(src, onload) {
        var headID = document.getElementsByTagName("head")[0];         
        var newScript = document.createElement('script');
        newScript.async = false;
        newScript.type = 'text/javascript';
        newScript.src = src;
        newScript.onload = onload;
        headID.appendChild(newScript);
        if(isDebug) console.log('require.load.js',src);
    }
    function addStylesheet(src, onload) {
        var headID = document.getElementsByTagName("head")[0];         
        var ss = document.createElement('link');
        ss.rel = 'stylesheet';
        ss.async = false;
        ss.href = src;
        headID.appendChild(ss);
        if(isDebug) console.log('require.load.css',src);   
        onload();
    }
    
    window.require = require;
})(window);
