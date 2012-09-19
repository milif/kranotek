<?
$sRequest = file_get_contents('php://input');
$aRequest = json_decode( $sRequest, true );
exit;
echo json_encode(array(
    'sucess'=>true,
    'model'=>array_merge($aRequest, array("id"=> "34r4r"))
));
