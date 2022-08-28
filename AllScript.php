<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AllScripts</title>
    <link rel="stylesheet" href="styles.css">  
</head>
<body style="background-image: url(13.jpg);  background-size: cover;">
<br>
<div class="ClassicWay"><br><a href="index.html">Главная</a></div>

<?php

//комментарий в php коде----------------------------------------------------------------
/*еще один комментарий в php коде*/

/*Устанавливаем соединение с БД */

$host = 'localhost';
$user = 'root';
$password = 'root';
$db_name = 'ArinaDB';
$idArray = array();

$link = mysqli_connect($host, $user, $password, $db_name);

$query = "SELECT SHeadScript,Sname,Stext FROM scriptstable WHERE Sbefore = 'BtnStart' or Sbefore = 'BtnForkStart'";
$result = mysqli_query($link, $query) or die(mysqli_error($link));

//while($row = mysqli_fetch_assoc($result)) {
//    $fromID = $row['SHeadScript'];
//}
//echo(var_dump($result));
echo('<br>');
if ($result){
    $col = mysqli_num_fields($result);
}
if ($result) {
    $rows = mysqli_num_rows($result);
    echo "<table class = 'TableAllScripts'>
    <tr><td class='IDTableTD'>ID</td>
    <td class='NameTableTD'>НАИМЕНОВАНИЕ</td>
    <td class='TXTTableTD'>ТЕКСТ</td>
    <td class='ActionTableTD'>ДЕЙСТВИЕ</td></tr>";
    //var_dump($rows);
    //echo('<br>');
    for ($i = 0 ; $i < $rows; ++$i)
    {
        $row = mysqli_fetch_row($result);
        //var_dump($row);
        //echo('<br>');
        $idEdit = $row[0];
        //echo($idEdit);
        echo "<tr>";

        for ($j = 0 ; $j < $col + 1; ++$j) {
            if ($j == 2){
                $STRT = nl2br($row[$j]);
                //echo "<td>Видать тут просто текст</td> ";
                echo "<td valign='middle' align='left'> $STRT </td> ";
            } elseif ($j == $col) {
                // ---------------------
                echo "<td valign='middle' align='center'>
                <form action='ScriptBuilder.php' method='post' target='_self'>
                <br>
                <button class='Create' type='submit' name='id' value='$idEdit'>Изменить</button>
                </form>
                <form action='DelScript.php' method='post' target='_self'>  
                <button class='Delete' type='submit' name='id' value='$idEdit'>Удалить</button>
                <br>
                </form>

                </td>";
                //----------------------
                //echo "<td>$idEdit </td> ";
            } else {
                //echo "<td>Видать тут пусто </td> ";
                echo "<td >$row[$j] </td> ";
                 
            }
        }
    echo "</tr>";
    }
    echo "</table>";
    
    // очищаем результат
    mysqli_free_result($result);
}

?>

<script src="scripts.js"></script>

</body>
</html>