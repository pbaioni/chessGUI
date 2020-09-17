//DOM objects
var $evaluationBar = document.getElementById('evaluationBar')
var $evaluation = $('#evaluation')
var $serverStatus = $('#serverStatus')
var $comment = $('textarea#comment')
var $onlyPawnsBtn = $('#onlyPawnsBtn')
var $updateBtn = $('#updateBtn')
var $importBtn = $('#importBtn')
var $commentBtn = $('#commentBtn')
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

function clearEval(){
    $evaluationBar.value = "500";
    $evaluation.html('<h1>-</h1>');
}

function setEval(evaluation, depth){

    var barEvaluation;
    if(evaluation > 500){barEvaluation = 500;};
    if(evaluation < -500){barEvaluation = -500;};

    $evaluationBar.value = 500 - barEvaluation;
    $evaluation.html('<div class="eval"><b>' + evaluation/100 + '</b></div><div class="depth">('+ depth + ')</div>');
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

  function setServerStatus(colour, text){
    $serverStatus.css("background-color", colour)
    $serverStatus.html(text)
  }