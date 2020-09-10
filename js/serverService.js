async function getOnlyPawns(fen){
    var fenWithoutPawns = null
    var url = 'http://localhost:9001/board/onlypawns';

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
      serverReady();
    });

    return fenWithoutPawns;
}

async function deleteLine(fen, move){

  var url = 'http://localhost:9001/board/delete';
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
    serverReady();
  });
}

async function getAnalysis(previousFen, move, fen){
  var analysis = null
  var url = 'http://localhost:9001/board/analysis';
  var parameters= {};
  parameters.previousFen = previousFen;
  parameters.move = move;
  parameters.fen = fen;
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
    serverReady();
  });

  return analysis;
}

async function updateDepth(fen, depth){

  var url = 'http://localhost:9001/board/update';
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
  .catch((error) => {
    console.error('Error:', error);
    serverReady();
  });
}

async function importPgn(openingDepth, analysisDepth){

  var url = 'http://localhost:9001/board/import';
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
    serverReady();
  });
}

async function setPositionComment(fen, comment){
  var url = 'http://localhost:9001/board/comment';
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
    serverReady();
  });
}

async function stopTask(){
  
  var url = 'http://localhost:9001/board/stop';
  await fetch(url)
  .then(response => {if(response.status == 200){alert('Task stopped!')}})
  .catch((error) => {
    setConnected(false);
  });
}

async function testLink(){
  
  var url = 'http://localhost:9001/board';
  await fetch(url)
  .then(response => {if(response.status == 200){setConnected(true);}})
  .catch((error) => {
    setConnected(false);
  });
}