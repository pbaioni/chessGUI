properties = {
  //the default depth for stockfish analysis
  defaultAnalysisDepth: 24,

  //the port number used to communicate with the server
  serverPort: 9099,

  //define interval (in milliseconds) for server connection checking
  testlinkPeriod: 3000,

  //centipawn absolute limit for shadowed move arrows. 
  //Above that there is only a static color (red for lost positions, cyan for won positions)
  arrowShadeLimit: 400,

  //number of shades for square influences
  contourShadeLimit: 3,

  //define the width of the move arrow graphic
  moveArrowWidth: 15,

  //define the width of the user annotation arrow
  userArrowWidth: 10,

  //define the width of the unanalized move arrow
  unanalizedArrowWidth: 6
}