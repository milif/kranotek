<?

$sRequest = file_get_contents('php://input');
$aRequest = json_decode( $sRequest, true );
if($aRequest['path'] == '/') $aRequest['path']='';
$path = $aRequest['path'].'/base';



echo json_encode(array('success'=>true,'data'=>array('data'=>array(
    array('id'=>$path."1",'path'=>$path."1", 'ClassName'=>"Node {$path}1", 'b'=>'d'),
    array('id'=>$path."2",'path'=>$path."2", 'ClassName'=>"Node {$path}2 (*)", 'b'=>'d', 'leaf'=>true),
    array('id'=>$path."3",'path'=>$path."3", 'ClassName'=>"Node {$path}3", 'b'=>'d'),
    array('id'=>$path."4",'path'=>$path."4", 'ClassName'=>"Node {$path}4", 'b'=>'d'),
    array('id'=>$path."5",'path'=>$path."5", 'ClassName'=>"Node {$path}5", 'b'=>'d'),
    array('id'=>$path."6",'path'=>$path."6", 'ClassName'=>"Node {$path}6", 'b'=>'d'),
        
))));
