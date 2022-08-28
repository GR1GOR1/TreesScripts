<?php
$host = 'localhost';
$user = 'root';
$password = 'root';
$db_name = 'ArinaDB';

$link = mysqli_connect($host, $user, $password, $db_name);

$json = $_POST['myData'];
$json = json_decode($json);


$hs = -1;
for( $i = 0; $i<count($json); $i++ ) {
    foreach($json[$i] as $key => $value) {
        if ($key == 'Shead') {
            $Shead = $value;
        }
        if ($Shead != null) {
            $hs = $Shead; 
            $query = "DELETE FROM `scriptstable` WHERE SHeadScript = $hs";
            $result = mysqli_query($link, $query) or die(mysqli_error($link));
        }
    }

}
//---------------------------------------------------------------------------------
if ($hs == -1 ) {
    $query2 = "SELECT SHeadScript FROM scriptstable ORDER BY SHeadScript";
    $result2 = mysqli_query($link, $query2) or die(mysqli_error($link));


    $j = 0;
    while($row = mysqli_fetch_assoc($result2)) {
        $fromID[$j] = $row['SHeadScript'];
        ++$j;
    }
    $fromID = array_unique($fromID);

    $a = 1;
    for( $i = 0; $i <= count($fromID); ++$i ){
        
        if( !in_array($a, $fromID) ) {
            $hs = $a;
        } else {
            ++$a;
        }
    }


    if ($hs == -1) {
        $MAX = -1;
        for( $i = 0; $i <= count($fromID); $i++ ){
            if ($MAX < $fromID[$i]){
                $MAX = $fromID[$i];
            }
    }
    $hs =  $MAX + 1;
    }
}

//---------------------------------------------------------------------------------
for( $i = 0; $i<count($json); $i++ ) {
    foreach($json[$i] as $key => $value) {
        if ($key == 'id') {
            $id= $value;
        }
        if ($key == 'name') {
            $name= $value;
        }
        if ($key == 'text') {
            $text= $value;
        }
        if ($key == 'before') {
            $idBefore= $value;
        }
        if ($key == 'after') {
            $idAfter= $value;
        }
        if ($key == 'type') {
            $type = $value;
        }
        if ($key == 'Aforks') {
            $aforks = implode(",", $value);
        }
        if ($key == 'mother') {
            $mother= $value;
        }
    }

    $query2 = "INSERT INTO scriptstable VALUES ('$id', '$name', '$text', '$idBefore', '$idAfter','$type','$aforks','$mother','$hs')";
    $result2 = mysqli_query($link, $query2) or die(mysqli_error($link));
}

?>