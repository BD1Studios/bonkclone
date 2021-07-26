
const render = new PIXI.Application({ width: 730, height: 500, antialias: true, autoDensity: false, resolution: window.devicePixelRatio, powerPreference: "high-performance", backgroundColor: 0x2C3E50 });

const physics = new bonkPhysics();
const localInputs = new bonkLocalInputs();
const networking = new bonkNetworking("");
const graphics = new BonkGraphics(render);
document.body.appendChild(render.view);

let gameStateList = [];
let inputList = [];
let currentInputs = [];
let currentFrame = 0;
let timeStamp_old = Date.now();
let msPassed = 0;
let recalculationFrame = Infinity;

window.initialTimeStamp = Date.now();

networking.on("initialData", (initialTimeStamp, timeStamp, data) => {
    requestAnimationFrame(stepFunc);
    networking.id = data.id;
    console.log('id', networking.id)
    initInputs(data.initialState.discs.length);
    gameState = data.initialState;
    inputList = data.playerInputs;
    currentFrame = 0;
    msPassed = (networking.tsync.now() - timeStamp);
    msPassed += (timeStamp - initialTimeStamp);
})

networking.on("input", (id, key, pressed, frame) => {
    if (inputList[frame]) {
        inputList[frame].push([id, key, pressed]);
    } else {
        inputList[frame] = [[id, key, pressed]];
    }
    if(frame < recalculationFrame){
        recalculationFrame = frame;
    }
    console.log("received input at frame", currentFrame, "with frame", frame);
})

localInputs.onKeyChange((key, pressed) => {
    networking.sendInputChange(key, pressed, currentFrame);
    if (inputList[currentFrame]) {
        inputList[currentFrame].push([networking.id, key, pressed]);
    } else {
        inputList[currentFrame] = [[networking.id, key, pressed]];
    }
})

function initInputs(discAmount) {
    for (let i = 0; i != discAmount; i++) {
        currentInputs.push({ up: false, down: false, left: false, right: false, action1: false, action2: false });
    }
}

function stepFunc() {
    

    if(recalculationFrame != Infinity){
        gameState = gameStateList[recalculationFrame];
        for(let i = recalculationFrame; i < currentFrame; i++){
            if (inputList[i])
                for (let i2 = 0; i2 != inputList[i].length; i2++) {
                    let inputChange = inputList[i][i2];
                    currentInputs[inputChange[0]][inputChange[1]] = inputChange[2];
                }
            gameStateList[i + 1] = physics.step(1 / 30, gameStateList[i], currentInputs);
            gameState = gameStateList[i + 1];
        }
        
        recalculationFrame = Infinity;
    }

    let deltaTime = Date.now() - timeStamp_old;
    msPassed += deltaTime;
    timeStamp_old = Date.now();
    while (msPassed > 1000 / 30) {
        if (inputList[currentFrame])
            for (let i = 0; i != inputList[currentFrame].length; i++) {
                let inputChange = inputList[currentFrame][i];
                currentInputs[inputChange[0]][inputChange[1]] = inputChange[2];
            }
        
        if(gameStateList[currentFrame + 1]){
            gameState = gameState[currentFrame + 1];
        }
        else{
            gameState = physics.step(1 / 30, gameState, currentInputs);
        }
        
        currentFrame++;
        gameStateList[currentFrame] = gameState;
        msPassed -= 1000 / 30;
    }
    graphics.render(gameState);
    requestAnimationFrame(stepFunc);
}
window.addEventListener("keydown", function (e) { if (e.code == "KeyR") networking.requestInitialData(); })