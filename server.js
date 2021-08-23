const express = require('express');
const app = express();
const http = require('http');
// const timesyncServer = require('timesync/server');
const server = http.createServer(app);
const io = require('socket.io')(server, {allowEIO3: true});


app.use(express.static(__dirname + '/client'));
// app.use('/timesync', timesyncServer.requestHandler);

const playerArray = [];
const gameSettings = {};
const playerInputs = [];
const initialState = {'ms': {'re': false, 'nc': false, 'pq': 1, 'gd': 25, 'fl': false}, 'mm': {'a': 'Sneezing_Cactus', 'n': 'testmapforclone', 'dbv': 2, 'dbid': 308360, 'authid': -1, 'date': '', 'rxid': 0, 'rxn': '', 'rxa': '', 'rxdb': 1, 'cr': ['Sneezing_Cactus'], 'pub': false, 'mo': ''}, 'shk': {'x': 0, 'y': 0}, 'discs': [{'x': 11.666666666666666, 'y': 4.166666666666667, 'xv': 0, 'yv': 0, 'a': 0, 'av': 0, 'a1a': 1000, 'team': 1, 'ni': false, 'sx': 11.666666666666666, 'sy': 4.166666666666667, 'sxv': 0, 'syv': 0, 'ds': 0, 'da': 270, 'lhid': -1, 'lht': 0}], 'capZones': [], 'seed': 87, 'ftu': 7, 'rc': 0, 'rl': 53, 'sts': null, 'physics': {'shapes': [{'type': 'bx', 'w': 38.333333333333336, 'h': 0.4166666666666667, 'c': [0, 0], 'a': 0.7853981633974483, 'sk': false}, {'type': 'bx', 'w': 12.5, 'h': 0.4166666666666667, 'c': [19.75, 13.5], 'a': 0, 'sk': false}, {'type': 'bx', 'w': 33.333333333333336, 'h': 0.4166666666666667, 'c': [26, -3.1666666666666665], 'a': -1.5707963267948966, 'sk': false}, {'type': 'bx', 'w': 6.25, 'h': 0.4166666666666667, 'c': [-2.5833333333333335, 0], 'a': 0, 'sk': false}], 'fixtures': [{'sh': 0, 'n': 'Unnamed Shape', 'fr': null, 'fp': null, 're': null, 'de': null, 'f': 5209260, 'd': false, 'np': false, 'ng': false}, {'sh': 1, 'n': 'Unnamed Shape', 'fr': null, 'fp': null, 're': null, 'de': null, 'f': 5209260, 'd': false, 'np': false, 'ng': false}, {'sh': 2, 'n': 'Unnamed Shape', 'fr': null, 'fp': null, 're': null, 'de': null, 'f': 5209260, 'd': false, 'np': false, 'ng': false}, {'sh': 3, 'n': 'Unnamed Shape', 'fr': null, 'fp': null, 're': null, 'de': null, 'f': 5209260, 'd': false, 'np': false, 'ng': false}], 'bodies': [{'type': 's', 'p': [21.083333333333332, 24], 'a': 0, 'av': 0, 'lv': [0, 0], 'ld': 0, 'ad': 0, 'fr': false, 'bu': false, 'fx': [0, 1, 2], 'fric': 0.5, 'fricp': false, 'de': 0.3, 're': -1000, 'f_c': 1, 'f_p': true, 'f_1': true, 'f_2': true, 'f_3': true, 'f_4': true, 'cf': {'x': 0, 'y': 0, 'w': true, 'ct': 0}}, {'type': 'k', 'p': [14.833333333333334, 8.333333333333334], 'a': 0, 'av': -0.5, 'lv': [0, 0], 'ld': 0, 'ad': 0, 'fr': false, 'bu': false, 'fx': [3], 'fric': 0.5, 'fricp': false, 'de': 0.3, 're': -1000, 'f_c': 1, 'f_p': true, 'f_1': true, 'f_2': true, 'f_3': true, 'f_4': true, 'cf': {'x': 0, 'y': 0, 'w': true, 'ct': 0}}], 'joints': [], 'bro': [1, 0], 'ppm': 12}, 'scores': [0], 'lscr': -1, 'fte': -1, 'discDeaths': [], 'players': [{'id': 0, 'team': 1}], 'projectiles': []};
let currentFrame = 0;

const initialTimeStamp = Date.now();

io.on('connect', (socket) => {
  const id = playerArray.length;
  playerArray[id] = {name: 'Sneezing_Cactus'};
  initialState.discs[id] = {'x': 11.666666666666666, 'y': 4.166666666666667, 'xv': 0, 'yv': 0, 'a': 0, 'av': 0, 'a1a': 1000, 'team': 1, 'ni': false, 'sx': 11.666666666666666, 'sy': 4.166666666666667, 'sxv': 0, 'syv': 0, 'ds': 0, 'da': 270, 'lhid': -1, 'lht': 0};
  // console.log('player id ' + id + ' connected');

  socket.on('timesync', function(data) {
    // console.log('message', data);
    socket.emit('timesync', {
      id: data && 'id' in data ? data.id : null,
      result: Date.now(),
    });
  });

  socket.on('checkConnect', () => {
    socket.emit('connectSuccess');
  });

  socket.on('getInitialData', (s, t) => {
    currentFrame = Math.floor((Date.now() - initialTimeStamp) / (1000 / 30));
    socket.emit('initialData', initialTimeStamp, Date.now(), {
      id: id,
      players: playerArray,
      gameSettings: gameSettings,
      playerInputs: playerInputs,
      initialState: initialState,
      currentFrame: currentFrame,
    });
  });

  socket.on('input', (key, pressed, frame) => {
    socket.broadcast.emit('input', id, key, pressed, frame);
    if (playerInputs[frame]) {
      playerInputs[frame].push([id, key, pressed]);
    } else {
      playerInputs[frame] = [[id, key, pressed]];
    }
  });

  socket.on('disconnect', function() {
    // console.log('player id ' + id + ' disconnected');
    playerArray[id] = undefined;
    initialState.discs[id] = undefined;
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});
