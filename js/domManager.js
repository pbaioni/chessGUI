//DOM objects
//right nav
var $rightFooter = $('#rightfooter')

//comment
var $comment = $('textarea#comment')
var $commentBtn = $('#commentBtn')
var $pgn = $('#pgnLabel')

//analysis results
var $evaluation = $('#evaluation')
var $bestmove = $('bestmove')
var $serverStatus = $('#serverStatus')

//action buttons
var $onlyPawnsBtn = $('#onlyPawnsBtn')
var $updateBtn = $('#updateBtn')
var $importBtn = $('#importBtn')

//action images
var $actionImg = $('#actionImg')
var $settingImg = $('#settingImg')
var $helpImg = $('#helpImg')

//settings
var $settingImg = $('#settingImg')
var $defaultDepth = $('#defaultDepth')
var $analysisCb = $('#analysisCheckbox')
var $influenceCb = $('#influenceCheckbox')
var $settingBtn = $('#settingBtn')

//import
var $openingDepth = $('#openingDepth')
var $importDepth = $('#importDepth')

//delete
var $lineToDelete = $('#lineToDelete')

//update
var $updateDepth = $('#updateDepth')

//forms
var $settingForm = $('#settingForm')
var $actionForm = $('#actionForm')
var $helpForm = $('#helpForm')
var $importForm = $('#importForm')
var $deleteForm = $('#deleteForm')
var $updateForm = $('#updateForm')

var formShown = 'none';

//define input default values
$defaultDepth.val(properties.defaultAnalysisDepth)
$importDepth.val(properties.defaultAnalysisDepth)
$openingDepth.val(properties.defaultOpeningDepth)
$updateDepth.val(properties.defaultUpdateDepth)

//define clickable items behaviour
$defaultDepth.keydown(function(evt) {
  if(evt.key == 'Enter') {
    getSettings()
  }
});

$actionImg.on('click', function() {showForm('actionForm')})
$settingImg.on('click', function() {showForm('settingForm')})
$helpImg.on('click', function() {showForm('helpForm')})

$settingBtn.on('click', function() {getSettings()})


// ### manage comments and pgn ### 

function displayComment(comment) {
	$comment.val(comment)
}

async function toggleCommentBackground(typing) {
	if (typing) {
		$comment.css("background-color", "lightyellow")
	} else {
		$comment.css("background-color", "green")
		await sleep(250)
		$comment.css("background-color", "#ddd")
	}
}

function setPgnLabel(label) {
	$pgn.html(label)
}


// ### manage forms display ###

function showForm(formId) {

	if (formShown == formId) {
		hideForms()
	} else {
		hideForms()
		$pgn.hide()
		$('#' + formId).show()
		formShown = formId
	}
}

function hideForms() {

	if (formShown != 'none') {
		$('#' + formShown).hide()
		$pgn.show()
		formShown = 'none'
	}
}


// ### forms data ### 

function getLineToDelete() {
	var lineToDelete = document.getElementById('lineToDelete').value
	return lineToDelete
}

function setLineToDelete(lineToDelete) {
	$lineToDelete.val(lineToDelete)
}

function getUpdateDepth() {
	var updateDepth = document.getElementById('updateDepth').value
	return updateDepth
}

function getImportParameters() {
	var importParameters = {}
	importParameters.openingDepth = document.getElementById('openingDepth').value
	importParameters.depth = document.getElementById('importDepth').value
	return importParameters
}

function checkAnalysis(value) {
	$analysisCb.prop("checked", value);
}

function checkInfluence(value) {
	$influenceCb.prop("checked", value);
}

function getSettings() {

	var depth = document.getElementById('defaultDepth').value
	var regex = new RegExp("^[0-9]+$");

	if (regex.test(depth)) {
		properties.defaultAnalysisDepth = depth
	}

	hideForms()

}


// ### button toggle functions ### 

function toggleOnlyPawnsBtn(onlyPawns) {
	if (onlyPawns) {
		$onlyPawnsBtn.html('Pawn Structure')
	} else {
		$onlyPawnsBtn.html('Show all pieces')
	}
}

function toggleUpdateButton(inUse) {
	if (inUse) {
		$updateBtn.attr('disabled', false)
		$updateBtn.css("background-color", 'orange')
		$updateBtn.html('Stop Update')
	} else {
		$updateBtn.css("background-color", '#2ba6cb')
		$updateBtn.html('Update Line Depth')
	}
}

function toggleImportButton(inUse) {
	if (inUse) {
		$importBtn.attr('disabled', false)
		$importBtn.css("background-color", 'orange')
		$importBtn.html('Stop Import')
	} else {
		$importBtn.css("background-color", '#2ba6cb')
		$importBtn.html('Import Games')
	}
}

function disableAnalysisButtons() {

	$updateBtn.attr('disabled', true)
	$updateBtn.css("background-color", 'grey')
	$importBtn.attr('disabled', true)
	$importBtn.css("background-color", 'grey')
	$analysisCb.attr('disabled', true)
	$influenceCb.attr('disabled', true)
}

function enableAnalysisButtons() {

	$updateBtn.attr('disabled', false)
	$updateBtn.css("background-color", '#2ba6cb')
	$importBtn.attr('disabled', false)
	$importBtn.css("background-color", '#2ba6cb')
	$analysisCb.attr('disabled', false)
	$influenceCb.attr('disabled', false)
	setAnalysisEnabled($('#analysisCheckbox').is(":checked"));
}



// ### manage evaluation bar ### 

function clearEval(boardFlipped) {
	$evaluation.html('<div class="bestmove"><b>-</b></div><div class="eval"><b>-</b></div><div class="depth">(-)</div>');
	drawEvaluationBar(0, boardFlipped, 0)
}

function setEval(bestmove, evaluation, depth, turn, boardFlipped) {

	if (!(bestmove && depth)) {
		bestmove = '-';
	}
	var evaluationLabel, numericalEvaluation
	if (('' + evaluation).includes('#')) {
		if (evaluation == '-#0') {
			evaluationLabel = '#'
		} else {
			evaluationLabel = evaluation
		}
		numericalEvaluation = 400
		if (('' + evaluation).includes('-')) {
			numericalEvaluation = numericalEvaluation * (-1)
		}
		if (turn == 'b') {
			numericalEvaluation = numericalEvaluation * (-1)
		}
	} else {
		if (evaluation == '-') {
			evaluationLabel = evaluation
			numericalEvaluation = 0
		} else {
			evaluationLabel = evaluation / 100
			numericalEvaluation = evaluation
		}
	}

	$evaluation.html('<div class="bestmove"><b>' + bestmove + '</b></div><div class="eval"><b>' + evaluationLabel + '</b></div><div class="depth">(' + depth + ')</div>');

	if (numericalEvaluation > 400) { numericalEvaluation = 400 }
	if (numericalEvaluation < -400) { numericalEvaluation = -400 }
	drawEvaluationBar(numericalEvaluation, boardFlipped, depth)
}


// ### manage server status ###

function serverReady() {
	setServerStatus('green', 'Server<br>Ready')
}

function serverDisconnected() {
	setServerStatus('red', 'Server<br>Disconnected')
}

function serverWaiting() {
	setServerStatus('orange', 'Waiting for<br>Analysis');
}

function serverUpdating() {
	setServerStatus('orange', 'Updating<br>Line');
}

function serverImporting() {
	setServerStatus('orange', 'Importing<br>Games');
}

async function serverError() {
	setServerStatus('red', 'Server<br>Error');
	await sleep(2000)
}

function setServerStatus(colour, text) {
	$serverStatus.css("background-color", colour)
	$serverStatus.html(text)
}
