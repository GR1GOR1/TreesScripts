<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ScriptsBuilder</title>
    <link rel="stylesheet" href="styles.css">  
    <link rel="stylesheet" href="showDialog.css">  
    <script src="//code.jquery.com/jquery-1.12.4.min.js"></script>
</head>
<body style="background-color: beige;">
<br>
<?php
        $var = $_POST['id'];
        if ($var) {
            $host = 'localhost';
            $user = 'root';
            $password = 'root';
            $db_name = 'ArinaDB';
            $idArray = array();
            $cachArray = array();
            $link = mysqli_connect($host, $user, $password, $db_name);

            $query = "SELECT * FROM scriptstable WHERE SHeadScript = '$var'";
            $result = mysqli_query($link, $query) or die(mysqli_error($link));

            $rows = mysqli_num_rows($result);
            $col = mysqli_num_fields($result);
            for ($i = 0; $i < $rows; $i++){
                $row = mysqli_fetch_row($result);
                for ($j = 0; $j < $col; $j++){
                    array_push($cachArray, $row[$j]); 
                } 
                array_push($idArray, $cachArray);
                $cachArray = array();
            }
        }
        
        $data = json_encode($idArray);
?>


<div class="ClassicWay"><br><a href="index.html">Главная</a></div>
    
    <div class = "MainMap" id="ZeroMap">
        <div class="BackConstr"></div>
        <table>
            <tr>
                <td>
                    <div class = "CreateBlock" style="margin-top: 5%;"><button class = "AddBlock" id = "BtnStart" onclick="getid(this)">Create block</button></div>
                </td>
                <td>
                    <div class = "CreateFork" style="margin-top: 5%;"><button class = "AddFork" id = "BtnForkStart" onclick="getid(this)">Create fork</button></div>
                </td>
                <td>
                    <div style="margin-top: 5%;"><button class = "SaveDBButton" id = "BtnSaveDB" onclick="getid(this)">Сохранить</button></div>
                </td>
            </tr>
        </table>
        <div class = "BlockOut" id = "0"></div>
        <div class = "EndScriptBlock" id = "EndScript">
            <div class = "CreateBlock" ><button class = "AddBlock" id = "BtnEnd" onclick="getid(this)">Block</button></div>
            <div class = "CreateFork" ><button class = "AddFork" id = "BtnForkEnd" onclick="getid(this)">Fork</button></div>
            <div class = "CreateFork" ><button class = "AddBridge" id = "BtnBridgeEnd" onclick="getid(this)">Bridge</button></div>
        </div>
    </div>


<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="showDialog.js"></script>
<script src="scripts.js"></script>
<script>

    data =  '<?=$data?>';
    data = data.split('\n').join('\\n');
    data = $.parseJSON(data);
    

    var StartElem;
    if (data) {
        for (var i = 0; i < data.length; i++) {
        var RRow = data[i];
        if (RRow[3] == "BtnStart" || RRow[3] == "BtnForkStart") {
            StartElem = RRow;
        }
    }
    

    CreateTree(data);
    }
    
</script>
</body>
</html>