<?php
$sRequest = file_get_contents('php://input');
$aRequest = json_decode( $sRequest, true );

$sRootPath = $_SERVER['DOCUMENT_ROOT'].$aRequest['rootPath'];
$aIncludePath = $aRequest['includePath'];
$aLoadedScripts = $aRequest['loadedScripts'];
$aSources = buildSources($aRequest['require']);

$aResult=array();
foreach($aSources as $sFile){
    $sType = preg_match('/\.js$/i',$sFile) ? 'js' : 'css';
    $sFile = str_replace($_SERVER['DOCUMENT_ROOT'],'',$sFile);
    if(isset($aLoadedScripts[$sFile])) continue;
    $aResult['include'][$sType][]=$sFile;
}
echo json_encode($aResult);

function buildSources($aRequire) {
    global $sRootPath, $aIncludePath;
    
    $aStack = array();
    $aSources = array();
    $aIndex = array();
    $aRequiresIndex=array();
    
    foreach($aRequire as $sItem){
        if($sFile = getFile($sItem)) $aStack[]=$sFile;
    }
     
    while (count($aStack)){ 
        $sFile = $aStack[count($aStack)-1];
        if(!isset($aRequiresIndex[$sFile])) {
            $aRequiresIndex[$sFile] = getRequires($sFile);
        }
        $aRequires = &$aRequiresIndex[$sFile];
        if(count($aRequires)) {
            $sFile = array_shift($aRequires);
            if(isset($aRequiresIndex[$sFile])) continue;
            $aStack[]=$sFile;
        } else {
            array_pop($aStack);
            $aSources[]= $sFile;
        }
     
    }    
    
    return $aSources;
}
function getRequires($sFile){
    global $sRootPath, $aIncludePath;
    $aRequires = array();
    preg_match_all ('/\@require\s*(.*?)\s*\n/i',file_get_contents($sFile),$aOut);
    foreach($aOut[1] as $sItem) {
        if($sFile = getFile($sItem)) $aRequires[]=$sFile;
    }
    return $aRequires;
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
