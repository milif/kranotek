<?
echo json_encode(array(
  'data'=>array(
    array(
      'id'=>'23',
      'type'=>'Type5',
      'name'=>'Name23',
      'info'=>'Info',
      'params'=>array(
        array(
          'id'=>'123',
          'type'=>'Type5',
          'name'=>'Name1',
          'required'=>true,
          'isArray'=>true,
          'qty'=>23,
          'info'=>'info'
        )
      ),
      'return'=>array(
        array(
          'id'=>'123',
          'type'=>'Type2',
          'name'=>'Name1',
          'required'=>true,
          'isArray'=>true,
          'qty'=>23,
          'info'=>'info'
        )
      )
    ),
    array(
      'id'=>'45',
      'type'=>'type45',
      'name'=>'Name45',
      'info'=>'Info45',
      'params'=>array(
        array(
          'id'=>'123',
          'type'=>'Type1',
          'name'=>'Name145',
          'required'=>true,
          'isArray'=>true,
          'qty'=>145,
          'info'=>'info145'
        ),
        array(
          'id'=>'1234',
          'type'=>'Type1',
          'name'=>'Name1454',
          'required'=>false,
          'isArray'=>false,
          'qty'=>1454,
          'info'=>'info1454'
        ),
        array(
          'id'=>'1123',
          'type'=>'Type2',
          'name'=>'Name1145',
          'required'=>true,
          'isArray'=>true,
          'qty'=>1145,
          'info'=>'info1145'
        )
      ),
      'return'=>array(
        array(
          'id'=>'123',
          'type'=>'Type3',
          'name'=>'Name1',
          'required'=>true,
          'isArray'=>true,
          'qty'=>23,
          'info'=>'info'
        )
      )
    )
  ),
  'total'=>20
));