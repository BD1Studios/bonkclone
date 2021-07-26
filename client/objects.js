function player(x, y)
{
    this.definition = new b2BodyDef();
    this.definition.type = b2Body.b2_dynamicBody;
    this.definition.position.x = x;
    this.definition.position.y = y;
    this.definition.allowSleep = false;
    this.body = world.CreateBody(this.definition);
    this.fixtureDef = new b2FixtureDef; 
    this.fixtureDef.shape = new b2CircleShape(20);
    this.body.CreateFixture(this.fixtureDef);
    //this.body = Bodies.circle(x, y, 20, {friction: 0, restitution: 1});
    //this.body.label = "player";
    //World.add(world, this.body);
    this.x = x;
    this.y = y;

    let shape = new PIXI.Graphics();
    //shape.lineStyle(4, 0xFF3300, 1);
    shape.beginFill(0xf44336);
    shape.drawCircle(0, 0, 70 / ppm);
    shape.endFill();
    shape.x = x / ppm;
    shape.y = y / ppm;
    shape.pivot.x = 0;
    shape.pivot.y = 0;
    render.stage.addChild(shape);

    let debugText = new PIXI.Text('text', { font: '10px Arial', fill: '#ffffff', align: 'left', stroke: '#FFFFFF', strokeThickness: 0 });
    render.stage.addChild(debugText);

    let moveVec = { x: 0, y: 0 }
    this.moveLeft  = function(){moveVec.x = -0.1;}
    this.moveRight = function(){moveVec.x = 0.1;}
    this.moveUp  = function(){
        /*if(this.isGrounded() && Math.abs(this.body.velocity.y) < 2)
        {
            Body.setVelocity(this.body, { x: this.body.velocity.x, y: this.body.velocity.y - 5 });
        }*/
        moveVec.y = -0.2;
    }
    this.moveDown = function(){moveVec.y = 0.1;}
    this.checkKeys = function(){
        if(getKey("ArrowLeft")) this.moveLeft();
        if(getKey("ArrowRight")) this.moveRight();
        if(getKey("ArrowUp")) this.moveUp();
        if(getKey("ArrowDown")) this.moveDown();
    }
    this.isGrounded = false;//function(){return Matter.Query.ray(engine.world.bodies.filter(x => x.label !== "player"), this.body.position, {x: this.body.position.x, y: this.body.position.y + 20}, 0.1).length != 0;}

    render.ticker.add(() => {
        this.checkKeys();
        this.x = this.body.GetPosition().x;
        this.y = this.body.GetPosition().y;
        debugText.text = `${Math.round(this.x)}, ${Math.round(this.y)}`;
        debugText.x = this.x / ppm;
        debugText.y = this.y / ppm;
        shape.x = this.x / ppm;
        shape.y = this.y / ppm;
        //shape.rotation = this.body.angle;
        //this.body.angularVelocity = 0;
        this.body.SetLinearVelocity(new b2Vec2(this.body.GetLinearVelocity().x + moveVec.x, this.body.GetLinearVelocity().y + moveVec.y));
        moveVec = { x: 0, y: 0 };
    });
}

function testRect(x, y, w, h)
{
    this.definition = new b2BodyDef();
    this.definition.type = b2Body.b2_staticBody;
    this.definition.position.x = x;
    this.definition.position.y = y;
    this.body = world.CreateBody(this.definition);
    this.fixtureDef = new b2FixtureDef; 
    this.fixtureDef.shape = new b2PolygonShape;
    this.fixtureDef.shape.SetAsBox(w / 2, h);
    this.body.CreateFixture(this.fixtureDef);
    this.x = x;
    this.y = y;

    let shape = new PIXI.Graphics();
    //shape.lineStyle(4, 0xFF3300, 1);
    shape.beginFill(0xffd54f);
    shape.drawRect(0, 0, w / ppm, h / ppm);
    shape.endFill();
    shape.x = x / ppm;
    shape.y = y / ppm;
    shape.pivot.x = (w / ppm) / 2;
    shape.pivot.y = (h / ppm) / 2;
    render.stage.addChild(shape);
}