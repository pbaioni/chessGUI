var urlBase = 'http://localhost:' + properties.serverPort + '/board/'


async function getOnlyPawns(fen){
    var fenWithoutPawns = null
    var url = urlBase + 'onlypawns';

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fen),
    })
    .then(response => response.json())
    .then(data => {
      fenWithoutPawns = data.content;
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    return fenWithoutPawns;
}

async function deleteLine(fen, move){

  var url = urlBase + 'delete';
  var parameters= {};
  parameters.fen = fen;
  parameters.move = move;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  })
  .then(response => response.json())
  .then(data => {
    alert(data.content);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

async function getAnalysis(previousFen, move, fen, useEngine){
  var analysis = null
  var url = urlBase + 'analysis';
  var parameters= {};
  parameters.previousFen = previousFen;
  parameters.move = move;
  parameters.fen = fen;
  parameters.depth = properties.defaultAnalysisDepth;
  parameters.useEngine = useEngine;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  })
  .then(response => response.json())
  .then(data => {
    analysis = data;
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  return analysis;
}

async function updateDepth(fen, depth){

  var url = urlBase + 'update';
  var parameters= {};
  parameters.fen = fen;
  parameters.depth = depth;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  })
  .then(response => response.json())
  .then(data => {
    alert(data.content);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

async function importPgn(openingDepth, analysisDepth){

  var url = urlBase + 'import';
  var parameters= {};
  parameters.openingDepth = openingDepth;
  parameters.analysisDepth = analysisDepth;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  })
  .then(response => response.json())
  .then(data => {
    alert(data.content);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

async function setPositionComment(fen, comment){
  var url = urlBase + 'comment';
  var parameters= {};
  parameters.fen = fen;
  parameters.comment = comment;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

async function stopTask(){
  
  var url = urlBase + 'stop';
  await fetch(url)
  .catch((error) => {
    setConnected(false);
  });
}

async function storeDrawing(fen, type, path, color){

  var url = urlBase + 'drawing';
  var parameters= {};
  parameters.fen = fen;
  parameters.type = type;
  parameters.path = path;
  parameters.color = color;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

async function testLink(){
  
  var url = urlBase;
  await fetch(url)
  .then(response => {if(response.status == 200){setConnected(true);}})
  .catch((error) => {
    setConnected(false);
  });
}