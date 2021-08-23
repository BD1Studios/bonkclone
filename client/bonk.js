const render = new PIXI.Application({width: 730, height: 500, antialias: true, autoDensity: false, resolution: window.devicePixelRatio, powerPreference: 'high-performance', backgroundColor: 0x2C3E50});

const physics = new BonkPhysics();
const localInputs = new BonkLocalInputs();
const networking = new BonkNetworking('');
const graphics = new BonkGraphics(render);
document.body.appendChild(render.view);

const gameStateList = [];
let inputList = [];
const currentInputs = [];
let currentFrame = 0;
let timeStampOLD = Date.now();
let msPassed = 0;
let recalculationFrame = Infinity;

window.initialTimeStamp = Date.now();

networking.on('initialData', (initialTimeStamp, timeStamp, data) => {
  requestAnimationFrame(stepFunc);
  networking.id = data.id;
  console.log('id', networking.id);
  initInputs(data.initialState.discs.length);
  gameStateList[0] = data.initialState;
  inputList = data.playerInputs;
  currentFrame = 0;
  msPassed = (networking.tsync.now() - timeStamp);
  msPassed += (timeStamp - initialTimeStamp);
});

networking.on('input', (id, key, pressed, frame) => {
  if (inputList[frame]) {
    inputList[frame].push([id, key, pressed]);
  } else {
    inputList[frame] = [[id, key, pressed]];
  }
  if (frame < recalculationFrame) {
    recalculationFrame = frame;
  }
  console.log('received input at frame', currentFrame, 'with frame', frame);
});

localInputs.onKeyChange((key, pressed) => {
  networking.sendInputChange(key, pressed, currentFrame);
  if (inputList[currentFrame]) {
    inputList[currentFrame].push([networking.id, key, pressed]);
  } else {
    inputList[currentFrame] = [[networking.id, key, pressed]];
  }
});

function initInputs(discAmount) {
  for (let i = 0; i != discAmount; i++) {
    currentInputs.push([{up: false, down: false, left: false, right: false, action1: false, action2: false}]);
  }
}

function stepFunc() {
  if (recalculationFrame != Infinity) {
    for (let i = recalculationFrame; i < currentFrame; i++) {
      if (inputList[i]) {
        for (let i2 = 0; i2 != inputList[i].length; i2++) {
          const inputChange = inputList[i][i2];
          currentInputs[inputChange[0]][inputChange[1]] = inputChange[2];
        }
      }
      if (!gameStateList[i + 1]) {
        gameStateList[i + 1] = physics.step(1 / 30, gameStateList[i], currentInputs);
      }
    }

    recalculationFrame = Infinity;
  }

  const currentTS = Date.now();
  const deltaTime = currentTS - timeStampOLD;
  msPassed += deltaTime;
  timeStampOLD = currentTS;
  while (msPassed > 1000 / 30) {
    msPassed -= 1000 / 30;
    if (inputList[currentFrame]) {
      for (let i = 0; i != inputList[currentFrame].length; i++) {
        const inputChange = inputList[currentFrame][i];
        currentInputs[inputChange[0]][inputChange[1]] = inputChange[2];
      }
    }

    if (!gameStateList[currentFrame + 1]) {
      gameStateList[currentFrame + 1] = physics.step(1 / 30, gameStateList[currentFrame], currentInputs);
    }

    currentFrame++;
  }
  graphics.render(gameStateList[currentFrame]);
  requestAnimationFrame(stepFunc);
}
window.addEventListener('keydown', function(e) {
  if (e.code == 'KeyR') networking.requestInitialData();
});
