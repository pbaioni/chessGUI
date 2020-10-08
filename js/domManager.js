//DOM objects
var $evaluation = $('#evaluation')
var $bestmove = $('bestmove')
var $serverStatus = $('#serverStatus')
var $comment = $('textarea#comment')
var $onlyPawnsBtn = $('#onlyPawnsBtn')
var $updateBtn = $('#updateBtn')
var $importBtn = $('#importBtn')
var $commentBtn = $('#commentBtn')
var $settingForm = $('#settingForm')
var $settingImg = $('#settingImg')
var $analysisCb = $('#analysisCheckbox')
var $influenceCb = $('#influenceCheckbox')
var $pgn = $('#pgnLabel')

function setPgnLabel(label){
    $pgn.html(label)
}

function displayComment(comment){
    $comment.val(comment)
}

function toggleOnlyPawnsBtn(onlyPawns){
    if(onlyPawns){
        $onlyPawnsBtn.html('Pawn Structure')
    }else{
        $onlyPawnsBtn.html('Show all pieces')
    }
}

async function toggleCommentButton(){
    $commentBtn.css("background-color", 'green');
    $commentBtn.html('Comment saved');
    await sleep(1000)
    $commentBtn.css("background-color", '#2ba6cb');
    $commentBtn.html('Save Comment');
}

function showSettings(){
    $settingImg.hide()
    $settingForm.show()
}

function saveSettings(){
    var depth = document.getElementById('defaultDepth').value
    if(depth){
        setCookie("depth", depth, 7)
    }

    var port = document.getElementById('serverPort').value
    if(port){
        setCookie("port=", port, 7)
    }

    console.log(depth, port)

    $settingForm.hide()
    $settingImg.show()

}

function toggleUpdateButton(inUse){
    if(inUse){
        $updateBtn.attr('disabled', false)
        $updateBtn.css("background-color", 'orange')
        $updateBtn.html('Stop Update')
    }else{
        $updateBtn.css("background-color", '#2ba6cb')
        $updateBtn.html('Update Line Depth')
    }
}

function toggleImportButton(inUse){
    if(inUse){
        $importBtn.attr('disabled', false)
        $importBtn.css("background-color", 'orange')
        $importBtn.html('Stop Import')
    }else{
        $importBtn.css("background-color", '#2ba6cb')
        $importBtn.html('Import Games')
    }
}

function checkAnalysis(value){
    $analysisCb.prop("checked", value);
}

function checkInfluence(value){
    $influenceCb.prop("checked", value);
}

function disableAnalysisButtons(){

    $updateBtn.attr('disabled', true)
    $updateBtn.css("background-color", 'grey')
    $importBtn.attr('disabled', true)
    $importBtn.css("background-color", 'grey')
    $analysisCb.attr('disabled', true)
    $influenceCb.attr('disabled', true)
}

function enableAnalysisButtons(){

    $updateBtn.attr('disabled', false)
    $updateBtn.css("background-color", '#2ba6cb')
    $importBtn.attr('disabled', false)
    $importBtn.css("background-color", '#2ba6cb')
    $analysisCb.attr('disabled', false)
    $influenceCb.attr('disabled', false)
    setAnalysisEnabled($('#analysisCheckbox').is(":checked"));
}

function clearEval(boardFlipped){
    $evaluation.html('<div class="bestmove"><b>-</b></div><div class="eval"><b>-</b></div><div class="depth">(-)</div>');
    drawEvaluationBar(0, boardFlipped)
}

function setEval(bestmove, evaluation, depth, boardFlipped){

    if(!(bestmove&&depth)){
        bestmove = '-';
    }
    $evaluation.html('<div class="bestmove"><b>' + bestmove + '</b></div><div class="eval"><b>' + evaluation/100 + '</b></div><div class="depth">('+ depth + ')</div>');

    if(evaluation > 500){evaluation = 500;};
    if(evaluation < -500){evaluation = -500;};
    drawEvaluationBar(evaluation, boardFlipped)
}

  function serverReady(){
    setServerStatus('green', 'Server<br>Ready')
  }
  
  function serverDisconnected(){
    setServerStatus('red', 'Server<br>Disconnected')
  }

  function serverWaiting(){
    setServerStatus('orange', 'Waiting for<br>Analysis');
  }

  function serverUpdating(){
    setServerStatus('orange', 'Updating<br>Line');
  }

  function serverImporting(){
    setServerStatus('orange', 'Importing<br>Games');
  }

 async function serverError(){
    setServerStatus('red', 'Server<br>Error');
    await sleep(2000)
  }

  function setServerStatus(colour, text){
    $serverStatus.css("background-color", colour)
    $serverStatus.html(text)
  }

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}