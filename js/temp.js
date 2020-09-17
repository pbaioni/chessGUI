
function setPgnLabel(label){
    $pgn.html(label)
}

function setComment(comment){
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
    $('#commentBtn').css("background-color", 'green');
    $('#commentBtn').html('Comment saved');
    await sleep(1000)
    $('#commentBtn').css("background-color", '#2ba6cb');
    $('#commentBtn').html('Save Comment');
}

function toggleUpdateButton(){

}

function toggleImportButton(){

}

function disableAnalysisButtons(){

}

function enableAnalysisButtons(){
    
}

function clearEval(){
    $evaluationBar.value = "500";
    $evaluation.html('<h1>-</h1>');
}

function setEval(evaluation, depth){
    if(evaluation > 500){evaluation = 500;};
    if(evaluation < -500){evaluation = -500;};

    $evaluationBar.value = 500 - evaluation;
    $evaluation.html('<div class="eval"><b>' + evaluation/100 + '</b></div><div class="depth">('+ depth + ')</div>');
}