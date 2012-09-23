<?
$sRequest = file_get_contents('php://input');
$aRequest = json_decode( $sRequest, true );

echo json_encode(array(
    'success'=>true,
    'data'=>array_merge($aRequest, array("id"=> "34r4r"))
));
