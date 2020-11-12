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
var $actionButtons = $('#actionbuttons')
var $settingImg = $('#settingImg')
var $rightFooter = $('#rightfooter')
var $analysisCb = $('#analysisCheckbox')
var $influenceCb = $('#influenceCheckbox')
var $pgn = $('#pgnLabel')
var $importForm = $('#importForm')

var actionsShown = false;
var settingsShown = false;
var importShown = false;

function setPgnLabel(label){
    $pgn.html(label)
}

function displayComment(comment){
    $comment.val(comment)
}

async function toggleCommentBackground(typing){
    if(typing){
        $comment.css("background-color", "lightyellow")
    }else{
        $comment.css("background-color", "green")
        await sleep(250)
        $comment.css("background-color", "#ddd")
    }
}

function toggleOnlyPawnsBtn(onlyPawns){
    if(onlyPawns){
        $onlyPawnsBtn.html('Pawn Structure')
    }else{
        $onlyPawnsBtn.html('Show all pieces')
    }
}

function showSettings(){
    if(!settingsShown){
        hideForms()
        $pgn.hide()
        document.getElementById('defaultDepth').value = properties.defaultAnalysisDepth
        $settingForm.show()
        settingsShown = true;
    }else{
        var depth = document.getElementById('defaultDepth').value
        var regex = new RegExp("^[0-9]+$");
    
        if(regex.test(depth)){
            properties.defaultAnalysisDepth = depth
        }
    
        $settingForm.hide()
        $pgn.show()
        settingsShown = false;
    }
}

function showActions(){
    if(!actionsShown){
        hideForms()
        $pgn.hide()
        $actionButtons.show()
        actionsShown = true;
    }else{
        $pgn.show()
        $actionButtons.hide()
        actionsShown = false;
    }
}

function showImport(){
    if(!importShown){
        hideForms()
        $pgn.hide()
        $importForm.show()
        importShown = true;
        console.log('show import')
    }else{
        var importParameters = {}
        importParameters.openingDepth = document.getElementById('openingDepth').value
        importParameters.depth = document.getElementById('importDepth').value
        $pgn.show()
        $importForm.hide()
        importShown = false;
        launchImport(importParameters)
    }
}

function hideForms(){
    $settingForm.hide()
    settingsShown = false
    $actionButtons.hide()
    actionsShown = false
    $importForm.hide()
    importShown = false
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
    drawEvaluationBar(0, boardFlipped, 0)
}

function setEval(bestmove, evaluation, depth, turn, boardFlipped){

    if(!(bestmove&&depth)){
        bestmove = '-';
    }
    var evaluationLabel, numericalEvaluation
    if((''+evaluation).includes('#')){
        if(evaluation == '-#0'){
            evaluationLabel = '#'
        }else{
            evaluationLabel = evaluation
        }
        numericalEvaluation = 400
        if((''+evaluation).includes('-')){
            numericalEvaluation = numericalEvaluation * (-1)
        }
        if(turn == 'b'){
            numericalEvaluation = numericalEvaluation * (-1)
        }
    }else{
        if(evaluation == '-'){
            evaluationLabel = evaluation
            numericalEvaluation = 0
        }else{
            evaluationLabel = evaluation/100
            numericalEvaluation = evaluation
        }
    }

    $evaluation.html('<div class="bestmove"><b>' + bestmove + '</b></div><div class="eval"><b>' + evaluationLabel + '</b></div><div class="depth">('+ depth + ')</div>');

    if(numericalEvaluation > 400){numericalEvaluation = 400}
    if(numericalEvaluation < -400){numericalEvaluation = -400}
    drawEvaluationBar(numericalEvaluation, boardFlipped, depth)
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
