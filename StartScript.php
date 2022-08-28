<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ScriptsBuilder</title>
    <link rel="stylesheet" href="styles.css">  
</head>
<body style="background-image: url(13.jpg);  background-size: cover;">
<br>
<div class="ClassicWay"><br><a href="index.html">Главная</a></div>

<?php
$host = 'localhost';
$user = 'root';
$password = 'root';
$db_name = 'ArinaDB';
$link = mysqli_connect($host, $user, $password, $db_name);
$query = "SELECT * FROM scriptstable WHERE Sbefore = 'BtnStart' or Sbefore = 'BtnForkStart'";
$result = mysqli_query($link, $query) or die(mysqli_error($link));

if($result)
    {
        echo ('<table class="TableAllScripts"><tr><td style="width: 20%">ТОЧКА ВХОДА</td><td style="width: 20%">СЛЕДУЮЩИЙ ШАГ</td><td style="width: 60%">ТЕКСТ</td></tr><tr><td>');
        $rows = mysqli_num_rows($result);
        $SHeadArray = array();
        for ($i = 0 ; $i < $rows ; ++$i)
        {
            $row = mysqli_fetch_row($result);
                echo "<form  method='POST' ><br><input class='btn' type='submit' name='Sname' value='$row[1]'>
                <input class='btn' type='hidden' name='SHid' value='$row[8]'></form><br>";
        }
        echo ('</td><td>');
        $IDArray = array();
        $id2=$_POST['Sname'];
        $idMother23=$_POST['SHid'];

        if($id2 && $idMother23){
            $query2 = "SELECT Safter,SAforks,SHeadScript,Stext,Stype FROM scriptstable where Sname = '$id2' and SHeadScript = '$idMother23'";
            $result2 = mysqli_query($link, $query2) or die(mysqli_error($link));
            $rows2 = mysqli_num_rows($result2);
            $STR = mysqli_fetch_assoc($result2);
            $MainText = $STR['Stext'];
            $STR2 = $STR['SAforks'];
            $Stype = $STR['Stype'];
            $STR = $STR['Safter'];
            
            $IDArray = explode(',',$STR2);
            array_push($IDArray, $STR);
        }
        for ($i = 0; $i < count($IDArray); ++$i){
            $query3 = "SELECT Sname FROM scriptstable WHERE Scrid = '$IDArray[$i]' and SHeadScript = '$idMother23'";
            $result3 = mysqli_query($link, $query3) or die(mysqli_error($link));
            if($result3)
            {
                $rows3 = mysqli_num_rows($result3);
                for ($k = 0 ; $k < $rows3 ; ++$k)
                {
                    $row3 = mysqli_fetch_row($result3);
                        for ($j = 0 ; $j < 1 ; ++$j) echo "<form method='POST' >
                        <input class='btn' type='submit' name='Sname' value='$row3[$j]'>
                        <input class='btn' type='hidden' name='SHid' value='$idMother23'></form><br>";
                }
            }
        }
        echo('</td><td valign="middle" align="left">');
        if ($Stype != 'Bridge') {
            $STRT = nl2br($MainText);
            echo($STRT);
        }
        
        echo('</td></tr></table>');
        
    }

?>



<script src="scripts.js"></script>
</body>
</html>