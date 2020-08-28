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