class BonkLocalInputs {
  constructor() {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.action1 = false;
    this.action2 = false;
    this.inputConfig = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      KeyX: 'action1',
      KeyZ: 'action2',
    };
    const obj = this;
    this.keyChangeEventListeners = [];
    window.addEventListener('keyup', function(e) {
      obj.keyUp(e.code);
    });
    window.addEventListener('keydown', function(e) {
      obj.keyDown(e.code);
    });
  }
  onKeyChange(callback) {
    this.keyChangeEventListeners.push(callback);
  }
  handleKeyChange(key, pressed) {
    for (let i = 0; i != this.keyChangeEventListeners.length; i++) {
      this.keyChangeEventListeners[i](key, pressed);
    }
  }
  keyUp(code) {
    if (this.inputConfig[code] && this[this.inputConfig[code]] != false) {
      this[this.inputConfig[code]] = false;
      this.handleKeyChange(this.inputConfig[code], false);
    }
  }
  keyDown(code) {
    if (this.inputConfig[code] && this[this.inputConfig[code]] != true) {
      this[this.inputConfig[code]] = true;
      this.handleKeyChange(this.inputConfig[code], true);
    }
  }
}
