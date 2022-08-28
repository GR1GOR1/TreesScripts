var output = document.querySelector('.BlockOut');
var index = 1;
var indexButton = 1;
var CashindexButton = 0;
var BeforeIndexButton = 0;
var MotherFlag = 0;
var SHeadScript = null;
var ForbiddenBlocks = [];

//Создание структуры для передачи в БД-----
var ElementsSctruct = new Map();
class TreeNode {
    constructor (id, name, text, before, after, type, Aforks, mother, Shead) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.before = before;
        this.after = after;
        this.type = type;
        this.Aforks = Aforks;
        this.mother = mother;
        this.Shead = Shead;
    }
}
//-----------------------------------------
function buttonInit(){

    document.querySelectorAll('.AddBlock').forEach(
        item => item.addEventListener('click', CreateBlock)
    );
    document.querySelectorAll('.AddFork').forEach(
        item => item.addEventListener('click', CreateFork)
    );
    document.querySelectorAll('.AddBridge').forEach(
        item => item.addEventListener('click', CreateBridge)
    );
    document.querySelectorAll('.Parametrs_Text_button').forEach(
        item => item.addEventListener('click', SettingBlock)
    );
    document.querySelectorAll('.Remove_Block_button').forEach(
        item => item.addEventListener('click', deleteBlock)
    );
    document.querySelectorAll('.SaveDBButton').forEach(
        item => item.addEventListener('click', datetodb)
    );

}
function getid(obj){//Получаем id действия
    CashindexButton = obj.id;


}
//----------Передача данных на сервер------
function datetodb () {

    var MassForServ = [];

    for (let value of ElementsSctruct.values()) {
        MassForServ.push(value);
    }

    for (var i = 0; i < MassForServ.length; i++) {
        
        MassForServ[i].name = MassForServ[i].name.split('"').join('`');
        MassForServ[i].name = MassForServ[i].name.split("'").join('`');

        MassForServ[i].text = MassForServ[i].text.split('"').join('`');
        MassForServ[i].text = MassForServ[i].text.split("'").join('`');
    
    }
    var Jdata = JSON.stringify(MassForServ);

    $.ajax({
        type: "POST",
        url: "DBWork.php",
        data: {myData: Jdata},
        success: function(data) {
            console.log(data);
            alert("Сценарий успешно сохранен!");
            document.location.href = "http://localhost:8080/Success.html";

        },
        error: function(data) {
        console.log('error');
        }
    }); 
}
//----------Обработка блоков---------------
function NewBlockInitialization(ButtonId, BlockId, Name, Text, BeforeId, AfterId, Type, Aforks, mother) {

    var AfterChangedElem = null;
    var BeforeChandgedElem = null;
    var TypeBefore = null;

    if (ButtonId == 'BtnForkStart' || ButtonId == 'BtnStart') {
        
        if (ElementsSctruct.size < 1) {

            var ElemTree = new TreeNode(BlockId,Name,Text, ButtonId, 'EndScriptBlock', Type, Aforks, mother, SHeadScript);
            ElementsSctruct.set(BlockId, ElemTree);

        } else {
            for (let BAfter of ElementsSctruct.values()) {

                if (BAfter.before == 'BtnForkStart' || BAfter.before == 'BtnStart') {
    
                    var ChandgeStartElem = BAfter;
    
                } 

            }

            var ElemTree = new TreeNode(BlockId,Name,Text, ChandgeStartElem.before, ChandgeStartElem.id, Type, Aforks, mother, SHeadScript);
            ElementsSctruct.set(BlockId, ElemTree);
            ChandgeStartElem.before = ElemTree.id;
        }
        

    } else if (ButtonId == 'BtnBridgeEnd' || ButtonId == 'BtnForkEnd' || ButtonId == 'BtnEnd') {

        if (ElementsSctruct.size < 1) {
            
            var ElemTree = new TreeNode(BlockId,Name,Text, 'BtnStart', 'EndScriptBlock', Type, Aforks, mother, SHeadScript);
            ElementsSctruct.set(BlockId, ElemTree);

        } else {
            
            var ElemTree = new TreeNode(BlockId,Name,Text, null, null, Type, Aforks, false, null, SHeadScript);
            ElementsSctruct.set(BlockId, ElemTree);
            
            for (let BAfter of ElementsSctruct.values()) {
                
                if (BAfter.after == 'EndScriptBlock') {

                    if (BAfter.after == 'EndScriptBlock' && BAfter.mother == true) {
    
                        ElemTree.before = BAfter.id;
                        BAfter.after = ElemTree.id;
                    } else {
                        BAfter.after = ElemTree.id;
                    }
                    
                }
            }
            
            ElemTree.mother = true;
            ElemTree.after = 'EndScriptBlock';
            
        }
    


    } else {
        
        var ElemTree = new TreeNode(BlockId,Name,Text, BeforeId, AfterId, Type, Aforks, mother, SHeadScript);
        ElementsSctruct.set(BlockId, ElemTree);
        ButtonId = parseInt(ButtonId.match(/\d+/));
        if (ButtonId > 0) {
            BeforeChandgedElem = ElementsSctruct.get(ButtonId); //Получаем предыдущий блок
            TypeBefore = BeforeChandgedElem.type;
    
            //Проверяем проставление типа блока
            if (BeforeChandgedElem.type == 'FBlock' && ElemTree.type != 'Fork'){
                if (ElemTree.type != 'Bridge') {
                    ElemTree.type = 'FBlock';
                }
                ElemTree.mother = false;
            }
    
            //ИНИЦИАЛИЗАЦИЯ БЛОКА
            if (TypeBefore == 'TBlock' || TypeBefore == 'FBlock') {
    
                if (BeforeChandgedElem.after && BeforeChandgedElem.after!='EndScriptBlock'){
    
                    AfterChangedElem = ElementsSctruct.get(BeforeChandgedElem.after); //Получаем предыдущий after блок
                    AfterChangedElem.before = BlockId; //Меняем у предыдущего after значение следующего
                    ElemTree.after = AfterChangedElem.id; //Ставим значение следующего блока
        
                } else {
                    if (BeforeChandgedElem.type != 'Fork') {
                        BeforeChandgedElem.after = BlockId;
                    }
                    
                }
        
                ElemTree.before = BeforeChandgedElem.id; //Устанавливаем связь с предыдущим блоком
                BeforeChandgedElem.after = BlockId; //Меняем последующий у блока, из которого был создан данный
    
            } else if (TypeBefore == 'Fork') { //ВИЛКА

                if (BeforeChandgedElem.type == 'FBlock' || BeforeChandgedElem.type == 'Fork'){
                    ElemTree.mother = false;
                }

                BeforeChandgedElem.Aforks.push(BlockId);
                ElemTree.before = BeforeChandgedElem.id; //Устанавливаем связь с предыдущим блоком
                if (BeforeChandgedElem.after) {
                    ElemTree.after = BeforeChandgedElem.after;
                }
                
            }
    
        }
        
    }

    if (BeforeChandgedElem != null || ElementsSctruct.size == 1) {
        if (BeforeChandgedElem && BeforeChandgedElem.type == 'Fork' && !ElemTree.after){
            alert('действия с вилкой')
            ElemTree.after = BeforeChandgedElem.after;
        } else if (!ElemTree.after) {
            ElemTree.after = 'EndScriptBlock';
        }
    }

}
function SettingBlock(){
    CashindexButton = parseInt(CashindexButton.match(/\d+/));
    var InfoElem = ElementsSctruct.get(CashindexButton);
    
    showDialog({
        title: 'Настройки', 
        message: '<input type="text" placeholder="Наименование" id = "inputvaluename" value = "' + InfoElem.name + '">' +
                '<textarea style="height: 500px; " type="text" placeholder="Текст" id = "inputvaluetext" value = "">' + InfoElem.text + '</textarea>',
        buttons: {
            'Сохранить': function(){
                var newName = document.getElementById("inputvaluename").value;
                var newText = document.getElementById("inputvaluetext").value;
                var FindBlock = 'BlockNameOut_' +  InfoElem.id;
                InfoElem.name = newName;
                InfoElem.text = newText;
                if (InfoElem.type == 'Bridge') {
                InfoElem.Aforks = newText.split(',');
                
                    for (var i = 0; i < InfoElem.Aforks.length; i++) {
                        InfoElem.Aforks[i] = parseInt(InfoElem.Aforks[i]);
                    }
                }
                
                document.getElementById(FindBlock).value = newName;
                alert('Изменения успешно сохранены!')
                
            }
        }
    })

}
function deleteBlock (){

    CashindexButton = parseInt(CashindexButton.match(/\d+/));
    var delElem = ElementsSctruct.get(CashindexButton);
    //Получаем предыдущий блок
    var Type = delElem.type;
    //Выполняем процедуры перемены местами
    //МЕЖДУ БЛОКАМИ
    if (delElem.before != "BtnStart" && delElem.after != "EndScriptBlock" && delElem.before != "BtnForkStart"){ //Не первый и не последний блок
        
        var BeforeChandgedElem = ElementsSctruct.get(delElem.before); //Получаем пред блок
        var AfterChangedElem = ElementsSctruct.get(delElem.after); //Получаем след блок

        for (let value of ElementsSctruct.values()) {
        
            if (value.after == delElem.id) {
                value.after = delElem.after;
                
            }
            
            if (value.before == delElem.id) {
                value.before = delElem.before;
                
            }
        }

        if (Type == 'TBlock'|| Type == 'FBlock') { //Удаляем текстовый блок
        
            document.getElementById("Out_Block_" + delElem.id).remove();
    
        } else if (Type == 'Fork') { //Удаляем вилку

            document.getElementById('Del_Fork' + CashindexButton).remove();
        
        }  else if (Type == 'Bridge') { //Удаляем мост

            document.getElementById('Bridge_' + CashindexButton).remove();
        }


    // ПЕРВЫЙ БЛОК
    } else if (delElem.before == "BtnStart" || delElem.before == "BtnForkStart") { 

        if (delElem.after != "EndScriptBlock") { // Проверяем, если есть последующий блок

            var AfterChangedElem = ElementsSctruct.get(delElem.after);
            AfterChangedElem.before = "BtnStart";

        }
        if (Type == 'TBlock' || Type == 'FBlock') { //Удаляем текстовый блок
            document.getElementById("Out_Block_" + delElem.id).remove();
        } else if (Type == 'Fork') { //Удаляем вилку
            document.getElementById('Del_Fork' + CashindexButton).remove();
        } else if (Type == 'Bridge') { //Удаляем мост
            document.getElementById('Bridge_' + CashindexButton).remove();
        }

    // ПОСЛЕДНИЙ БЛОК
    } else if (delElem.after == "EndScriptBlock"){ //Последний блок
        var BeforeChandgedElem = ElementsSctruct.get(delElem.before);
        BeforeChandgedElem.after = "EndScriptBlock";

        for (let value of ElementsSctruct.values()) {
        
            if (value.after == delElem.id) {
                value.after = delElem.after;
                
            }
        }

        if (Type == 'TBlock' || Type == 'FBlock') { //Удаляем текстовый блок
            document.getElementById("Out_Block_" + delElem.id).remove();
        } else if (Type == 'Fork') { //Удаляем вилку
            document.getElementById('Del_Fork' + CashindexButton).remove();
        } else if (Type == 'Bridge') { //Удаляем мост
            document.getElementById('Bridge_' + CashindexButton).remove();
        }

    } else if (ElementsSctruct.get(delElem.before).type == 'Fork'){
        var cachElem = ElementsSctruct.get(delElem.before);
        for (var i = 0; i < cachElem.Aforks.length; i++) {
            if (cachElem.Aforks[i] == delElem.id) {
                cachElem.Aforks.splice(i,1);
            }
        }

    }

    if (delElem.before != "BtnStart" && delElem.after != "EndScriptBlock" && delElem.before != "BtnForkStart") {
        if (ElementsSctruct.get(delElem.before).type == 'Fork'){

            var cachElem = ElementsSctruct.get(delElem.before);
            for (var i = 0; i < cachElem.Aforks.length; i++) {
                if (cachElem.Aforks[i] == delElem.id) {
                    cachElem.Aforks.splice(i,1);
                }
            }
        }
    }
    if (delElem.type != 'Bridge'){

        deleteForkfromBlock(delElem.Aforks);    
    }
    
    ElementsSctruct.delete(CashindexButton);
    
    if (ElementsSctruct.size < 1) {
        output = document.querySelector('.BlockOut');
        index = 1;
        indexButton = 1;
        CashindexButton = 0;
        BeforeIndexButton = 0;
    }

}

function deleteForkfromBlock (Mass){
    var CheckElemFork;
    var falseMass = [];
    for (var i = 0; i < Mass.length; i++){
        if (ElementsSctruct.get(Mass[i])) {
            CheckElemFork = ElementsSctruct.get(Mass[i]);
            if (CheckElemFork.Aforks && CheckElemFork.Aforks.length > 0) {
                
                deleteForkfromBlock(CheckElemFork.Aforks);
            
            }
            if (CheckElemFork.type == 'FBlock' && CheckElemFork.after != "EndScriptBlock") {
    
                falseMass.push(CheckElemFork.after);
                
                deleteForkfromBlock(falseMass);
    
            }

            if (CheckElemFork.mother == false) {
                ElementsSctruct.delete(Mass[i]);    
            }
        }
        
    }
}

function CreateBlock(){

    let BlockNew = document.createElement('div');
    BlockNew.setAttribute("id", index);
    
    var NewBlockStruct = '<div class = "MainForForks" id ="Out_Block_' + (indexButton) + '">' + 
    '<div style="margin-bottom: -30px; margin-top: -30px; font-size:68px; color: brown;">&#11015;</div><br>' 
    + '<table class="TextBlockTable"><tr><td><input type="checkbox" name="" class = "Check_Block" id="Check_Text_' + (index) + '"></td>' 
    + '<td colspan="2"><button style="float: right;" class = "Remove_Block_button" id="Remove_Block_Text_' + (index) + '" onclick="getid(this)"><div class="RemTxtBur">╳</div></button>' 
    + '<button class = "Parametrs_Text_button" style="float: right;" id="Parametrs_Text_' + (index) + '" onclick="getid(this)"><div class="RemTxtBur">☰</div></button>id: ' + (indexButton) + '</td></tr>'
    + '<tr><td colspan="3"><input readonly id = "BlockNameOut_' + (index) + '" type="text" value="Блок №' + (index)
    + '"></td></tr>'

    + '<tr><td><div class = "CreateBlock"><button class = "AddBlock" id ="Block_' + (indexButton) +
    '" onclick="getid(this)"><b>T</b></button></div></td>'

    + '<td><div class = "CreateFork"><button class = "AddFork" id ="Block_' + (indexButton) +
    '" onclick="getid(this)"><b>F</b></button></div></td>'

    + '<td><div class = "CreateBridge"><button class = "AddBridge" id ="Block_' + (indexButton) +
    '" onclick="getid(this)"><b>B</b></button></div></td></tr>'

    + '</table>'
    + '</div>';

    BlockNew.innerHTML = NewBlockStruct;
    var Varr = [];
    
    if (CashindexButton == 'BtnStart'){

        output = document.querySelector('.BlockOut');
        output.after(BlockNew);
        NewBlockInitialization(CashindexButton, index, ('Блок №' + index),'', CashindexButton, null, 'TBlock', Varr, true);

    } else if (CashindexButton == 'BtnEnd') {

        output = document.querySelector('.EndScriptBlock');
        output.before(BlockNew);
        NewBlockInitialization(CashindexButton, index, ('Блок №' + index),'', CashindexButton, null, 'TBlock', Varr, true);

    } else if (CashindexButton.indexOf('Fork_') > -1) {

        NewBlockInitialization(CashindexButton, index, ('Блок №' + index),'', CashindexButton, null, 'FBlock', Varr, false);
        CashindexButton = 'Out_' + CashindexButton;
        output = document.getElementById(CashindexButton);
        output.after(BlockNew);

    } else if (CashindexButton.indexOf('Block_') > -1) {
        
        NewBlockInitialization(CashindexButton, index, ('Блок №' + index),'', CashindexButton, null, 'TBlock', Varr, true); //Нет данных по блоку
        CashindexButton = 'Out_' + CashindexButton;
        output = document.getElementById(CashindexButton);
        output.after(BlockNew);
    }

    index++;
    indexButton++;
    buttonInit();
}

function CreateFork() {
    
    let ForkNew = document.createElement('div');
    ForkNew.setAttribute("id", index);


    var NewForkStruct = '<div class = "MainForForks" id = "Del_Fork' + (index) + '">'
    + '<div style="margin-bottom: -30px; margin-top: -30px; font-size:68px; color: brown;">&#11015;</div><br>'
    + '<table class = "ForkBlockTable"><tr><td><input type="checkbox" name="" class = "Check_Fork" id="Check_Fork_' + (index) + '">' 
    + 'id: ' + (indexButton) + '<button class = "Parametrs_Text_button" style="margin-left: 56px;" id="Parametrs_Text_' + (index) + '" onclick="getid(this)"><div class="RemFrkBur">☰</div></button>'
    + '<button class = "Remove_Block_button" id="Remove_Fork_Text_' + (index) + '" onclick="getid(this)"><div class="RemFrkBur">╳</div></button></td></tr>'
    + '<tr><td><input readonly id = "BlockNameOut_' + (index) + '" type="text" value="Вилка №' + (index)
    + '"></td></tr>'

    + '<tr><td class = "ForkBlock"><div class = "CreateBlock"><button class = "AddBlock" id ="Fork_' + (indexButton) +
    '" onclick="getid(this)"><b>T</b></button></div>'

    + '<div class = "CreateFork"><button class = "AddFork" id ="Fork_' + (indexButton) +
    '" onclick="getid(this)"><b>F</b></button></div>'

    + '<div class = "CreateBridge"><button class = "AddBridge" id ="Fork_' + (indexButton) +
    '" onclick="getid(this)"><b>B</b></button></div></td></tr>'

    + '<tr class = "ForkBlock" style="border-top: solid;"><td class = "ForkBlock" id = "Out_Fork_' + (indexButton) + '">  </td></tr>'

    + '</table>'
    + '</div>';

    ForkNew.innerHTML = NewForkStruct;

    var Varr = [];
    
    if (CashindexButton == 'BtnForkStart'){

        NewBlockInitialization(CashindexButton, index, ('Вилка №' + index),'', CashindexButton, null, 'Fork', Varr, true);
        output = document.querySelector('.BlockOut');
        output.after(ForkNew);

    } else if (CashindexButton == 'BtnForkEnd') {

        NewBlockInitialization(CashindexButton, index, ('Вилка №' + index),'', CashindexButton, null, 'Fork', Varr, true);
        output = document.querySelector('.EndScriptBlock');
        output.before(ForkNew);

    } else if (CashindexButton.indexOf('Fork_') > -1) {

        NewBlockInitialization(CashindexButton, index, ('Вилка №' + index),'', CashindexButton, null, 'Fork', Varr, false);
        CashindexButton = 'Out_' + CashindexButton;
        output = document.getElementById(CashindexButton);
        output.after(ForkNew);


    } else if (CashindexButton.indexOf('Block_') > -1) {

        NewBlockInitialization(CashindexButton, index, ('Вилка №' + index),'', CashindexButton, null, 'Fork', Varr, true);
        CashindexButton = 'Out_' + CashindexButton;
        output = document.getElementById(CashindexButton);
        output.after(ForkNew);
    }

    index++;
    indexButton++;
    buttonInit();

}

function CreateBridge() {

    let BridgeNew = document.createElement('div');
    BridgeNew.setAttribute("id", index);
    

    var NewBridgeStruct = '<div class = "MainForForks" id = "Bridge_' + (index) + 
    '"><div style="margin-bottom: -30px; margin-top: -30px; font-size:68px; color: brown;">&#11015;</div><br>'
    +'<table class = "BridgeBlockTable"><tr><td><input type="checkbox" name="" class = "Check_Block" id="Check_Text_' + (index) + '"></td>' 
    + '<td colspan="2"><button style="float: right;" class = "Remove_Block_button" id="Remove_Block_Text_' + (index) + '" onclick="getid(this)"><div class="RemTxtBur">╳</div></button>' 
    + 'id: ' + (indexButton) + '<button class = "Parametrs_Text_button" id="Parametrs_Text_' + (index) + '" onclick="getid(this)"><div class="RemTxtBur">☰</div></button></td></tr>'

    +'<tr><td colspan="3"><input readonly id = "BlockNameOut_' + (index) + '" type="text" value="Мост № ' + (index)
    + '"></td></tr> <tr><td colspan="3">МОСТ</td></tr></table></div>';

    BridgeNew.innerHTML = NewBridgeStruct;


    var Varr = [];
    
    if (CashindexButton == 'BtnBridgeEnd') {

        NewBlockInitialization(CashindexButton, index, 'Мост № ' + (index),'', 'Мост № ' + CashindexButton, null, 'Bridge', Varr, true);
        output = document.querySelector('.EndScriptBlock');
        output.before(BridgeNew);

    } if (CashindexButton.indexOf('Fork_') > -1) {
        
        NewBlockInitialization(CashindexButton, index, 'Мост № ' + (index),'', 'Мост № ' + CashindexButton, null, 'Bridge', Varr, false);
        CashindexButton = 'Out_' + CashindexButton;
        output = document.getElementById(CashindexButton);
        output.after(BridgeNew);

    } else if (CashindexButton.indexOf('Block_') > -1) {

        NewBlockInitialization(CashindexButton, index, 'Мост № ' + (index),'', 'Мост № ' + CashindexButton, null, 'Bridge', Varr, true);
        CashindexButton = 'Out_' + CashindexButton;
        output = document.getElementById(CashindexButton);
        output.after(BridgeNew);
    
    }

    index++;
    indexButton++;
    buttonInit();

}

function CreateTree (data) {
    var RowData;
    var flag = true;
    var array = [];
    var TreeStartNode;
    for (var i = 0; i < data.length; i++) {
        RowData = data[i];
        for (var j = 0; j < RowData.length; j++) {
            
            if (RowData[7] != 1) {
                flag = false;
                
            }
            if (RowData[6].length > 0){
                array = RowData[6].split(',');
            }
            for (var k = 0; k < array.length; k ++) {
                array[k] = parseInt(array[k]);
            }
            if (RowData[3] != 'BtnStart' && RowData[3] != 'BtnForkStart' && RowData[3] != 'EndScriptBlock'){
                RowData[3] = parseInt(RowData[3])
            }
            if (RowData[4] != 'BtnStart' && RowData[4] != 'BtnForkStart' && RowData[4] != 'EndScriptBlock'){
                RowData[4] = parseInt(RowData[4])
            }
            var ElemTree = new TreeNode(parseInt(RowData[0]),RowData[1],RowData[2], RowData[3], RowData[4], RowData[5], array, flag, parseInt(RowData[8]));
            ElementsSctruct.set(parseInt(RowData[0]), ElemTree);
            if (RowData[3] == 'BtnStart' || RowData[3] == 'BtnForkStart'){
                TreeStartNode = ElemTree;
            }
            if (RowData[8]) {
                Shead = parseInt(RowData[8]);
            }
        }
        index++;
        indexButton++;
        array = [];
        flag = true;
    }
    VisualTree(TreeStartNode);
}

function VisualTree(TSN) {

    if (TSN.type == 'TBlock'){
        
        CreateBlock2(TSN.name,TSN.id,TSN.before,TSN.id);

        if (TSN.after != 'EndScriptBlock'){
            var checkmother = null;
            var TBB = TSN.type;
            var NewTSN = ElementsSctruct.get(TSN.after);
        
            if (NewTSN.mother) {
                checkmother = NewTSN.mother;
            }
    
            if (TSN.type == 'FBlock' && checkmother != false) {
                
            } else {
            if (TBB == 'TBlock' || TBB == 'FBlock') {
                TBB = TBB.slice(1) + '_' + TSN.id;
            } else if (TBB == 'Fork') {
                TBB = TBB + '_' + TSN.id;
            }
            if (NewTSN) {
                
                var CachNTNSB = NewTSN.before; 
                NewTSN.before = TBB;
                VisualTree(NewTSN);
                NewTSN.before = CachNTNSB;
            
            }
            }
        }
    } else if (TSN.type == 'FBlock'){
        
            CreateBlock2(TSN.name,TSN.id,TSN.before,TSN.id);
        
        if (TSN.after != 'EndScriptBlock' && ForbiddenBlocks.indexOf(TSN.after) == -1){

            var checkmother = null;
            var TBB = TSN.type;
            var NewTSN = ElementsSctruct.get(TSN.after);
            
            if (NewTSN.mother) {
                checkmother = NewTSN.mother;
            }
    
                if (TBB == 'TBlock' || TBB == 'FBlock') {
                    TBB = TBB.slice(1) + '_' + TSN.id;
                } else if (TBB == 'Fork') {
                    TBB = TBB + '_' + TSN.id;
                }

                if (NewTSN) {

                    var CachNTNSB = NewTSN.before; 
                    NewTSN.before = TBB;
                    VisualTree(NewTSN);
                    NewTSN.before = CachNTNSB;
                }
        }

    }

    if (TSN.type == 'Fork'){
        CreateFork2(TSN.name,TSN.id,TSN.before,TSN.id);

        

        if (TSN.after != 'EndScriptBlock' && ForbiddenBlocks.indexOf(TSN.after) == -1) {
            ForbiddenBlocks.push(TSN.after);
            var TBB = 'Del_Fork' + TSN.id;
            
            var NewTSN = ElementsSctruct.get(TSN.after);
            
            var CachNTNSB = NewTSN. before;
            NewTSN.before = TBB;
            
            VisualTree(NewTSN);
            NewTSN.before = CachNTNSB;
        
        }
        if (TSN.Aforks.length < 1) {
            var TBB = TSN.type;
            var NewTSN = ElementsSctruct.get(TSN.after);
            if (TBB == 'TBlock' || TBB == 'FBlock') {
                TBB = TBB.slice(1) + '_' + TSN.id;
            } else if (TBB == 'Fork') {
                TBB = TBB + '_' + TSN.id;
            }
            var CachNTNSB = NewTSN.before;
            NewTSN.before = TBB;
            VisualTree(NewTSN);
            NewTSN.before = CachNTNSB;
        }
        
        if (TSN.Aforks.length > 0) {
            MotherFlag = TSN.id;
            for (var i = 0; i < TSN.Aforks.length; i++) {
                var TBB = TSN.type;
                var NewTSN = ElementsSctruct.get(TSN.Aforks[i]);
                if (TBB == 'TBlock' || TBB == 'FBlock') {
                    TBB = TBB.slice(1) + '_' + TSN.id;
                } else if (TBB == 'Fork') {
                    TBB = TBB + '_' + TSN.id;
                }
                    var CachNTNSB = NewTSN.before;
                    NewTSN.before = TBB;   
                    VisualTree(NewTSN);
                    NewTSN.before = CachNTNSB;
            }
        }

    }

    if (TSN.type == 'Bridge') {

        CreateBridge2(TSN.name,TSN.id,TSN.before,TSN.id);

        if (TSN.after != 'EndScriptBlock' && ForbiddenBlocks.indexOf(TSN.after) == -1){

            var checkmother = null;
            var TBB = TSN.type;
            var NewTSN = ElementsSctruct.get(TSN.after);
            
            if (NewTSN.mother) {
                checkmother = NewTSN.mother;
            }
    
                if (TBB == 'TBlock' || TBB == 'FBlock') {
                    TBB = TBB.slice(1) + '_' + TSN.id;
                } else if (TBB == 'Fork') {
                    TBB = TBB + '_' + TSN.id;
                }else if (TBB == 'Bridge') {
                    TBB = TBB + '_' + TSN.id;
                }

                if (NewTSN) {

                    var CachNTNSB = NewTSN.before; 
                    NewTSN.before = TBB;
                    VisualTree(NewTSN);
                    NewTSN.before = CachNTNSB;
                }
        }

    }
}

function CreateBlock2(NAME,Oldindex,OldCashindexButton,OldindexButton){

    let BlockNew = document.createElement('div');
    BlockNew.setAttribute("id", Oldindex);
    
    var NewBlockStruct = '<div class = "MainForForks" id ="Out_Block_' + (OldindexButton) + '">' + 
    '<div style="margin-bottom: -30px; margin-top: -30px; font-size:68px; color: brown;">&#11015;</div><br>' 
    + '<table class="TextBlockTable"><tr><td><input type="checkbox" name="" class = "Check_Block" id="Check_Text_' + (Oldindex) + '"></td>' 
    + '<td colspan="2"><button style="float: right;" class = "Remove_Block_button" id="Remove_Block_Text_' + (Oldindex) + '" onclick="getid(this)"><div class="RemTxtBur">╳</div></button>' 
    + '<button class = "Parametrs_Text_button" style="float: right;" id="Parametrs_Text_' + (Oldindex) + '" onclick="getid(this)"><div class="RemTxtBur">☰</div></button>id: ' + (OldindexButton) + '</td></tr>'
    + '<tr><td colspan="3"><input readonly id = "BlockNameOut_' + (Oldindex) + '" type="text" value="' + (NAME)
    + '"></td></tr>'

    + '<tr><td><div class = "CreateBlock"><button class = "AddBlock" id ="Block_' + (OldindexButton) +
    '" onclick="getid(this)"><b>T</b></button></div></td>'

    + '<td><div class = "CreateFork"><button class = "AddFork" id ="Block_' + (OldindexButton) +
    '" onclick="getid(this)"><b>F</b></button></div></td>'

    + '<td><div class = "CreateBridge"><button class = "AddBridge" id ="Block_' + (OldindexButton) +
    '" onclick="getid(this)"><b>B</b></button></div></td></tr>'

    + '</table>'
    + '</div>';

    BlockNew.innerHTML = NewBlockStruct;
    
    if (OldCashindexButton == 'BtnForkStart' || OldCashindexButton == 'BtnStart'){

        output = document.querySelector('.BlockOut');
        output.after(BlockNew);

    } else if (OldCashindexButton == 'BtnEnd') {

        output = document.querySelector('.EndScriptBlock');
        output.before(BlockNew);

    } else if (OldCashindexButton.indexOf('Fork_') > -1) {

        OldCashindexButton = 'Out_' + OldCashindexButton;
        output = document.getElementById(OldCashindexButton);
        output.after(BlockNew);

    } else if (OldCashindexButton.indexOf('Block_') > -1) {
        
        OldCashindexButton = 'Out_' + OldCashindexButton;
        output = document.getElementById(OldCashindexButton);
        output.after(BlockNew);
    } else if (OldCashindexButton.indexOf('Del_Fork') > -1) {

        output = document.getElementById(OldCashindexButton);
        output.after(BlockNew);

    } else if (OldCashindexButton.indexOf('Bridge') > -1) {
        
        output = document.getElementById(OldCashindexButton);
        output.after(BlockNew);

    }

    index++;
    indexButton++;
    buttonInit();
}

function CreateFork2(NAME,Oldindex,OldCashindexButton,OldindexButton) {
    
    let ForkNew = document.createElement('div');
    ForkNew.setAttribute("id", index);


    var NewForkStruct = '<div class = "MainForForks" id = "Del_Fork' + (Oldindex) + '">'
    + '<div style="margin-bottom: -30px; margin-top: -30px; font-size:68px; color: brown;">&#11015;</div><br>'
    + '<table class = "ForkBlockTable"><tr><td><input type="checkbox" name="" class = "Check_Fork" id="Check_Fork_' + (Oldindex) + '">' 
    + 'id: ' + (OldindexButton) + '<button class = "Parametrs_Text_button" style="margin-left: 56px;" id="Parametrs_Text_' + (Oldindex) + '" onclick="getid(this)"><div class="RemFrkBur">☰</div></button>'
    + '<button class = "Remove_Block_button" id="Remove_Fork_Text_' + (Oldindex) + '" onclick="getid(this)"><div class="RemFrkBur">╳</div></button></td></tr>'
    + '<tr><td><input readonly id = "BlockNameOut_' + (Oldindex) + '" type="text" value="' + NAME
    + '"></td></tr>'

    + '<tr><td class = "ForkBlock"><div class = "CreateBlock"><button class = "AddBlock" id ="Fork_' + (OldindexButton) +
    '" onclick="getid(this)"><b>T</b></button></div>'

    + '<div class = "CreateFork"><button class = "AddFork" id ="Fork_' + (OldindexButton) +
    '" onclick="getid(this)"><b>F</b></button></div>'

    + '<div class = "CreateBridge"><button class = "AddBridge" id ="Fork_' + (OldindexButton) +
    '" onclick="getid(this)"><b>B</b></button></div></td></tr>'

    + '<tr class = "ForkBlock" style="border-top: solid;"><td class = "ForkBlock" id = "Out_Fork_' + (OldindexButton) + '">  </td></tr>'

    + '</table>'
    + '</div>';

    ForkNew.innerHTML = NewForkStruct;

    if (OldCashindexButton == 'BtnForkStart' || OldCashindexButton == 'BtnStart'){

        output = document.querySelector('.BlockOut');
        output.after(ForkNew);

    } else if (OldCashindexButton == 'BtnForkEnd') {

        output = document.querySelector('.EndScriptBlock');
        output.before(ForkNew);

    } else if (OldCashindexButton.indexOf('Fork_') > -1) {

        OldCashindexButton = 'Out_' + OldCashindexButton;
        output = document.getElementById(OldCashindexButton);
        output.after(ForkNew);

    } else if (OldCashindexButton.indexOf('Block_') > -1) {

        OldCashindexButton = 'Out_' + OldCashindexButton;
        output = document.getElementById(OldCashindexButton);
        output.after(ForkNew);

    } else if (OldCashindexButton.indexOf('Del_Fork') > -1) {

        output = document.getElementById(OldCashindexButton);
        output.after(ForkNew);

    } else if (OldCashindexButton.indexOf('Bridge') > -1) {
        
        output = document.getElementById(OldCashindexButton);
        output.after(ForkNew);

    }

    index++;
    indexButton++;
    buttonInit();

}

function CreateBridge2(NAME,Oldindex,OldCashindexButton,OldindexButton) {

    let BridgeNew = document.createElement('div');
    BridgeNew.setAttribute("id", index);
    

    var NewBridgeStruct = '<div class = "MainForForks" id = "Bridge_' + (Oldindex) + 
    '"><div style="margin-bottom: -30px; margin-top: -30px; font-size:68px; color: brown;">&#11015;</div><br>'
    +'<table class = "BridgeBlockTable"><tr><td><input type="checkbox" name="" class = "Check_Block" id="Check_Text_' + (Oldindex) + '"></td>' 
    + '<td colspan="2"><button style="float: right;" class = "Remove_Block_button" id="Remove_Block_Text_' + (Oldindex) + '" onclick="getid(this)"><div class="RemTxtBur">╳</div></button>' 
    + 'id: ' + (OldindexButton) + '<button class = "Parametrs_Text_button" id="Parametrs_Text_' + (Oldindex) + '" onclick="getid(this)"><div class="RemTxtBur">☰</div></button></td></tr>'

    +'<tr><td colspan="3"><input readonly id = "BlockNameOut_' + (Oldindex) + '" type="text" value="' + NAME
    + '"></td></tr> <tr><td colspan="3">МОСТ</td></tr></table></div>';

    BridgeNew.innerHTML = NewBridgeStruct;

    if (OldCashindexButton == 'BtnBridgeEnd') {

        output = document.querySelector('.EndScriptBlock');
        output.before(BridgeNew);

    } if (OldCashindexButton.indexOf('Fork_') > -1) {
        
        OldCashindexButton = 'Out_' + OldCashindexButton;
        output = document.getElementById(OldCashindexButton);
        output.after(BridgeNew);

    } else if (OldCashindexButton.indexOf('Block_') > -1) {

        OldCashindexButton = 'Out_' + OldCashindexButton;
        output = document.getElementById(OldCashindexButton);
        output.after(BridgeNew);
    
    } else if (OldCashindexButton.indexOf('Del_Fork') > -1) {

        output = document.getElementById(OldCashindexButton);
        output.after(BridgeNew);

    } else if (OldCashindexButton.indexOf('Bridge') > -1) {

        output = document.getElementById(OldCashindexButton);
        output.after(BridgeNew);

    }

    index++;
    indexButton++;
    buttonInit();

}

buttonInit();