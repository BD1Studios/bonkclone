class bonkNetworking {
    constructor (sockUrl) {
        this.socket = io(sockUrl);
        this.tsync = timesync.create({
            server: this.socket,
            interval: 10000,
            delay: 250
        });
        this.oldTimeOffset = null;
        this.id = null;
        this.init();
    }
    init(){
        this.initSocket();
        this.initTimeSync();
    }
    initSocket(){
        let checkInterval = setInterval(() => this.socket.emit("checkConnect"), 500)
        this.socket.on("connectSuccess", () => {
            clearInterval(checkInterval);
            currentFrame = 0;
            window.initialTimeStamp = Date.now();
            this.requestInitialData();
        })
    }
    initTimeSync(){
        let thisObj = this;

        this.tsync.on('sync', function (state) {
            //console.log('sync ' + state + '');
        });

        this.tsync.on('change', function (offset) {
            if(thisObj.oldTimeOffset == null){
                thisObj.oldTimeOffset = offset;
            }else{
                msPassed += offset - thisObj.oldTimeOffset;
                thisObj.oldTimeOffset = offset;
            }
            //console.log('changed offset: ' + offset + ' ms');
        });

        this.tsync.send = function (socket, data, timeout) {
            return new Promise(function (resolve, reject) {
                var timeoutFn = setTimeout(reject, timeout);

                socket.emit('timesync', data, function () {
                    clearTimeout(timeoutFn);
                    resolve();
                });
            });
        };
        
        this.socket.on('timesync', function (data) {
            thisObj.tsync.receive(null, data);
        });
    }
    on(message, callback){
        this.socket.on(message, callback);
    }
    requestInitialData(){
        this.socket.emit("getInitialData", currentFrame, Date.now());
    }
    sendInputChange(key, pressed, frame){
        console.log("sent input at frame", frame, "with gst", gameState);
        this.socket.emit("input", key, pressed, frame);
    }
}