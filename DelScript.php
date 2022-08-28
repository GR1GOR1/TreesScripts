<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css"> 
</head>
<body style="background-image: url(13.jpg);  background-size: cover;"></body>
<div class="ClassicWay"><br><a href="index.html">Главная</a></div><br>
<div class="ClassicWay"><br><div class="ClsWay"><a href="AllScript.php">Список скриптов</a></div></div> <br>
<?php

    $id=$_POST['id'];
    echo "<h1>Скрипт успешно удален! <br/><h1>";
    echo ('<br>');
    $host = 'localhost';
    $user = 'root';
    $password = 'root';
    $db_name = 'ArinaDB';

    $link = mysqli_connect($host, $user, $password, $db_name);

    $query = "DELETE FROM scriptstable WHERE SHeadScript = '$id' ";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));


?>

</body>
</html>