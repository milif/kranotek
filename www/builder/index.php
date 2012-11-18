<?php

$sRequest = file_get_contents('php://input');
$aRequest = json_decode( $sRequest, true );

$DOCUMENT_ROOT = preg_replace('/\/$/','',$_SERVER['DOCUMENT_ROOT']);
$sRootPath = $DOCUMENT_ROOT.$aRequest['rootPath'];
$bIsCompile = isset($aRequest['compile']) && $aRequest['compile'];
$aIncludePath = $aRequest['includePath'];
$aLoadedScripts = $aRequest['loadedScripts'];
$aLog = array();

$fLoggin = getLogginFile(); 
if(is_file($fLoggin)) unlink($fLoggin);

$aResult=array();
if($bIsCompile) {
    $sHash = md5($sRequest);
    $sCacheDir = $sRootPath.'c/'.$sHash;
    if(is_dir($sCacheDir)) {
        if ($oHandle = opendir($sCacheDir)) {
            while (false !== ($sEntry = readdir($oHandle))) {
                $sFile = $sCacheDir.'/'.$sEntry;
                if(is_file($sFile)) {
                    if(preg_match('/include$/i',$sEntry)){
                        $sType = getFileType(str_replace('.include','',$sFile));
                        $aInclude = json_decode(file_get_contents($sFile), true);
                        $aMerge = $aResult['include'][$sType];
                        $aResult['include'][$sType] = array_merge($aInclude, $aMerge ? $aMerge : array() );
                    } else {
                        $sFile = str_replace($DOCUMENT_ROOT,'',realpath($sFile));
                        $sType = getFileType($sFile);
                        $aResult['include'][$sType][]=array($sFile, $sFile);                    
                    }
                }
            }
        }        
    } else {
        mkdir($sCacheDir, 0777, true);             
        $aSources = buildSources($aRequest['require']);
        foreach($aSources as $sType=>$aFiles){
            $sContent = '';
            foreach ($aFiles as $sFile){
                $sFileContent = file_get_contents($sFile[1]);
                if($sType=='css') {
                    $GLOBALS['CSS_TO_ROOT'] = str_replace($sRootPath, '', dirname($sFile[1]));
                    $sFileContent= preg_replace_callback ( '/url\s*\(([^\)]+)\)/i', 'setAbsolutePath' , $sFileContent);
                }
                $sContent .= $sFileContent."\n\n";
                $aResult['include'][$sType][]=array($sFile[0]);
            }        
            $sContent = compile($sType, $sContent);
            $sFile = $sCacheDir.'/'.uniqid().'.'.$sType;
            file_put_contents($sFile.'.include', json_encode($aResult['include'][$sType]));
            file_put_contents($sFile, $sContent);
            $sFile = str_replace($DOCUMENT_ROOT,'',realpath($sFile));
            $aResult['include'][$sType][]=array($sFile,$sFile);
        }    
    }
} else {
    $aSources = buildSources($aRequest['require']);
    foreach($aSources as $sType=>$aType){
        foreach($aType as $iKey=>$aFile){
            $aSources[$sType][$iKey][1] = str_replace($DOCUMENT_ROOT,'',$aFile[1]);
        }                
    }
    $aResult['include']=$aSources;
}

if($aLog) $aResult['log']=$aLog;

header('Content-type: application/json');
echo json_encode($aResult);

function buildSources($aRequire) {
    global $sRootPath, $aIncludePath, $aLoadedScripts;
    
    $aStack = array();
    $aSources = array();
    $aIndex = array();
    $aFilesData=array();
    $aAddedSources = array();
    
    foreach($aRequire as $sItem){
        if($sFile = getFile($sItem)) $aStack[]=$sFile;
    }
     
    while (count($aStack)){ 
        $sFile = $aStack[count($aStack)-1];
        if(!isset($aFilesData[$sFile])) {
            $aFileData = getFileData($sFile);
            $aFilesData[$sFile] = $aFileData;
        }
        $sUID = $aFilesData[$sFile]['uid'];
        $aRequires = &$aFilesData[$sFile]['requires'];
        if(count($aRequires)) {
            $sFile = array_shift($aRequires);
            if(isset($aFilesData[$sFile])) continue;
            $aStack[]=$sFile;
        } else {
            array_pop($aStack);
            if(isset($aLoadedScripts[$sUID])) continue;
            $sType = getFileType($sFile);
            if(!isset($aAddedSources[$sUID])) {
                $aSources[$sType][]= array($sUID, $sFile);
                $aAddedSources[$sUID] = true;
            }
        }
     
    }
    return $aSources;
}
function getFileData($sFile){
    global $sRootPath, $aIncludePath;
    
    $aRequires = array();
    $sContent = file_get_contents($sFile);
    preg_match_all ('/\@require\s*(.*?)\s*\n/i', $sContent, $aOut);
    $sUid = getUid($sContent, $sFile);    
    foreach($aOut[1] as $sItem) {
        if($sFile = getFile($sItem)) $aRequires[]=$sFile;
    }
    return array('uid'=>$sUid, 'requires'=>$aRequires);
}
function getUid(&$sContent, $sFile){
    if(preg_match ('/\@id\s*([^\s]*)(\s+|\n)/i', $sContent, $aUid)){
        $sUid = $aUid[1];
    } else {
        $sUid = uniqid();
        $sContent = "/*\n * @id ".$sUid." - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) "."\n */\n".$sContent;      
        if(!file_put_contents($sFile, $sContent)) die('Нет прав на запись в файл '.$sFile);
    };  
    return $sUid;   
}
function getFile($sItem){
    global $sRootPath, $aIncludePath;
    
    $sFile = $sRootPath.$sItem;
    if(!is_file($sFile)) foreach($aIncludePath as $sPath){
        $sFile = $sRootPath.$sPath.$sItem;              
        if(is_file($sFile)) {
            break;
        }
    }
    return is_file($sFile) ? realpath($sFile) : null;
}
function getFileType($sFile){
    return preg_match('/\.js$/i',$sFile) ? 'js' : 'css';
}
function compile($sType, $sContent){
    $fLoggin = getLogginFile(); 
    $fContent = __DIR__.'/compile'.uniqid();
    $fOutputContent = __DIR__.'/compile'.uniqid();
    if($sType=='js') {
        file_put_contents($fContent, $sContent);
        $sCompilerFile = __DIR__.'/google-closure/compiler.jar';
        $sCMD = "java -jar $sCompilerFile --js $fContent --js_output_file $fOutputContent 2>$fLoggin";
        exec($sCMD);
        $sContent = file_get_contents($fContent); //file_get_contents($fOutputContent);
        unlink($fContent );
        unlink($fOutputContent);
    } elseif($sType=='css') {
        file_put_contents($fContent, $sContent);
        $sCompilerFile = __DIR__.'/yuicompressor/yuicompressor-2.4.8pre.jar';
        $sCMD = "java -jar $sCompilerFile --type css -v $fContent >$fOutputContent 2>$fLoggin";
        exec($sCMD);
        $sContent = file_get_contents($fOutputContent);
        unlink($fContent );
        unlink($fOutputContent);        
    }
    return $sContent;
}
function setAbsolutePath($aMatches){ 
    if(preg_match('/^\//',$aMatches[1])) return $aMatches[0];
    $aMatches[1] = preg_replace('/[\'"]/i','',$aMatches[1]);
    $sUrl = 'url("../../'.$GLOBALS['CSS_TO_ROOT'].'/'.$aMatches[1].'")';
    return $sUrl;
}
function getLogginFile(){
    return __DIR__.'/log.txt';
}
function _log($msg){
    global $aLog;
    $aLog[] = $msg;
}
