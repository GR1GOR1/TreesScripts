<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
        $array = array(11, 10, 1, 2, 2, 3, 4, 5, 4);
        $result = array_unique($array);
        //var_dump($result);
        $a=1;
        $hs = -1;
        for( $i = 0; $i <= count($result); ++$i ){
        
                if( !in_array($a, $result) )
                {
                    $hs = $a;
                }
                else{
                    ++$a;
                }
        }
        var_dump($a);
    
        if( $hs = -1){
            $MAX = -1;
            //цикл фор
            for( $i = 0; $i <= count($result); $i++ ){
                if ($MAX < $result[$i]){
                    $MAX = $result[$i];
                }
            }
        $hs =  $MAX + 1;
        }
    ?>
</body>
</html>