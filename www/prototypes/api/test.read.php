<?

$sRequest = file_get_contents('php://input');
$aRequest = json_decode( $sRequest, true );
if($aRequest['path'] == '/') $aRequest['path']='';
$path = $aRequest['path'].'/base';



echo json_encode(array('success'=>true,'data'=>array('data'=>array(
    array('id'=>$path."1", 'key'=>"Key 1", 'value'=>'Value 1' , 'comment'=> 'Comment Comment Comment Comment Comment Comment Comment CommentComment Comment Comment'),
array('id'=>$path."2", 'key'=>"Key 2", 'value'=>'Value 2' , 'comment'=> 'Comment Comment Comment Comment Comment Comment Comment CommentComment Comment Comment'),
array('id'=>$path."3", 'key'=>"Key 3", 'value'=>'Value 3' , 'comment'=> 'Comment Comment Comment Comment Comment Comment Comment CommentComment Comment Comment'),
array('id'=>$path."4", 'key'=>"Key 4", 'value'=>'Value 4' , 'comment'=> 'Comment Comment Comment Comment Comment Comment Comment CommentComment Comment Comment'),
array('id'=>$path."5", 'key'=>"Key 5", 'value'=>'Value 5' , 'comment'=> 'Comment Comment Comment Comment Comment Comment Comment CommentComment Comment Comment'),
array('id'=>$path."6", 'key'=>"Key 6", 'value'=>'Value 6' , 'comment'=> 'Comment Comment Comment Comment Comment Comment Comment CommentComment Comment Comment'),
array('id'=>$path."7", 'key'=>"Key 7", 'value'=>'Value 7' , 'comment'=> 'Comment Comment Comment Comment Comment Comment Comment CommentComment Comment Comment'),    
      
))));
