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
    });

    return fenWithoutPawns;
}

async function getAnalysis(previousFen, move, fen){
  var analysis = null
  var url = 'http://localhost:9001/board/analysis';
  var parameters= {};
  parameters.previousFen = previousFen;
  parameters.move = move;
  parameters.fen = fen;
  //console.log(parameters);
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