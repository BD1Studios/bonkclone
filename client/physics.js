const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2World = Box2D.Dynamics.b2World;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

class BonkPhysics {
  constructor() {
    this.world = new b2World(new b2Vec2(0, 20));
    this.world.SetWarmStarting(false);
  }
  step(seconds, gst, inputs) {
    // reset world
    this.world.novakReset();

    const shapes = [];
    const bodies = [];
    const joints = [];
    const discs = [];

    // create shapes
    for (let i = 0; i != gst.physics.shapes.length; i++) {
      let shapeObj;
      let pointArray;
      const shape = gst.physics.shapes[i];
      switch (shape.type) {
        case 'bx':
          shapeObj = new b2PolygonShape;
          const width = shape.w / 2;
          const height = shape.h / 2;
          pointArray = [];
          pointArray.push(new b2Vec2(width, -height));
          pointArray.push(new b2Vec2(width, height));
          pointArray.push(new b2Vec2(-width, height));
          pointArray.push(new b2Vec2(-width, -height));
          for (let i = 0; i != pointArray.length; i++) {
            pointArray[i] = bonkMath.rotateVec2(pointArray[i], shape.a);
            pointArray[i].x += shape.c[0];
            pointArray[i].y += shape.c[1];
          }
          shapeObj.SetAsArray(pointArray);
          shapes.push(shapeObj);
          break;
        case 'ci':
          shapeObj = new b2CircleShape;
          shapeObj.SetRadius(shape.r);
          shapeObj.SetLocalPosition(new b2Vec2(shape.c[0], shape.c[1]));
          shapes.push(shapeObj);
          break;
        case 'po':
          shapeObj = new b2PolygonShape;
          pointArray = [];
          for (let i2 = 0; i2 != shape.v.length; i2++) {
            shape.v[i2][0] *= shape.s;
            shape.v[i2][1] *= shape.s;
            pointArray.push(new b2Vec2(shape.v[i2][0], shape.v[i2][1]));
          }
          shapeObj.SetAsArray(pointArray);
          shapes.push(shapeObj);
          break;
      }
    }

    // create bodies and fixtures
    for (let i = 0; i != gst.physics.bodies.length; i++) {
      const body = gst.physics.bodies[i];
      const bodyDef = new b2BodyDef();
      switch (body.type) {
        case 'd':
          bodyDef.type = b2Body.b2_dynamicBody;
          break;
        case 's':
          bodyDef.type = b2Body.b2_staticBody;
          break;
        case 'k':
          bodyDef.type = b2Body.b2_kinematicBody;
          break;
      }

      bodyDef.position.x = body.p[0];
      bodyDef.position.y = body.p[1];
      bodyDef.angle = body.a;
      bodyDef.linearVelocity.x = body.lv[0];
      bodyDef.linearVelocity.y = body.lv[1];
      bodyDef.angularVelocity = body.av;
      bodyDef.angularDamping = body.ad;
      bodyDef.linearDamping = body.ld;
      bodyDef.fixedRotation = body.fr;
      bodyDef.allowSleep = false;
      const bodyObj = this.world.CreateBody(bodyDef);
      for (let i2 = 0; i2 != body.fx.length; i2++) {
        const fixture = gst.physics.fixtures[body.fx[i2]];
        if (fixture.np) continue;
        const fixtureDef = new b2FixtureDef;
        fixtureDef.shape = shapes[fixture.sh];
        fixtureDef.density = fixture.de || body.de;
        fixtureDef.restitution = fixture.re || body.re;
        fixtureDef.friction = fixture.fr || body.fric;
        fixtureDef.isSensor = false;
        if (fixtureDef.density <= 0) fixtureDef.density = 0.0001;
        bodyObj.CreateFixture(fixtureDef);
      }
      bodyObj.SetLinearVelocity(new b2Vec2(body.lv[0], body.lv[1]));
      bodies[i] = bodyObj;
    }

    // create joints
    for (let i = 0; i != gst.physics.joints.length; i++) {
      const joint = gst.physics.joints[i];
      const bodyA = joint.ba == -1 ? this.world.GetGroundBody() : bodies[joint.ba];
      const bodyB = joint.bb == -1 ? this.world.GetGroundBody() : bodies[joint.bb];
      let jointObj;
      switch (joint.type) {
        case 'lpj':
          const ang = joint.pa - bodyA.GetAngle();
          const cosAng = bonkMath.fixedTrig.cos(ang);
          const sinAng = bonkMath.fixedTrig.sin(ang);
          jointObj = new b2PrismaticJointDef();
          jointObj.bodyA = bodyA;
          jointObj.localAnchorA = new b2Vec2();
          jointObj.bodyB = bodyB;
          jointObj.localAnchorB = new b2Vec2(joint.pax, joint.pay);
          jointObj.referenceAngle = -bodyA.GetAngle();
          jointObj.upperTranslation = joint.plen;
          jointObj.lowerTranslation = -joint.plen;
          jointObj.enableLimit = true;
          jointObj.localAxisA = new b2Vec2(cosAng, sinAng);
          jointObj.enableMotor = true;
          jointObj.maxMotorForce = joint.pf;
          jointObj.motorSpeed = joint.pms;
          const A7S = [];
          A7S[72] = joint.pax + bonkMath.fixedTrig.cos(joint.pa) * -joint.plen;
          A7S[22] = joint.pay + bonkMath.fixedTrig.sin(joint.pa) * -joint.plen;
          A7S[85] = bodyA.GetPosition().Copy();
          A7S[85].Subtract(new b2Vec2(A7S[72], A7S[22]));
          A7S[91] = A7S[85].Length();
          A7S[82] = A7S[91] / (joint.plen * 2);
          A7S[82] -= 0.5;
          A7S[82] *= 2;
          if (joint.pms < 0 && A7S[82] > 0.99 || joint.pms > 0 && A7S[82] < -0.99) {
            jointObj.motorSpeed = -jointObj.motorSpeed;
            bodyA.SetLinearVelocity(new b2Vec2(0, 0));
          }
          joints.push(this.world.CreateJoint(jointObj));
          break;
        case 'lsj':
          jointObj = new j7S[23]();
          jointObj.bodyA = bodyA;
          jointObj.localAnchorA = new b2Vec2();
          jointObj.bodyB = bodyB;
          jointObj.localAnchorB = new b2Vec2(joint.sax, joint.say);
          jointObj.referenceAngle = -bodyA.GetAngle();
          jointObj.upperTranslation = joint.slen;
          jointObj.lowerTranslation = -joint.slen;
          jointObj.enableLimit = false;
          jointObj.localAxisA = new b2Vec2(0, 1);
          jointObj.enableMotor = true;
          jointObj.maxMotorForce = joint.sf;
          jointObj.motorSpeed = 300;
          A7S[90] = bodyA.GetAngle() - Math.PI / 2;
          A7S[69] = joint.sax + bonkMath.fixedTrig.cos(A7S[90]) * -joint.slen;
          A7S[30] = joint.say + bonkMath.fixedTrig.cin(A7S[90]) * -joint.slen;
          A7S[19] = bodyA.GetPosition().Copy();
          A7S[19].Subtract(new b2Vec2(A7S[69], A7S[30]));
          A7S[87] = A7S[19].Length();
          A7S[98] = bonkMath.fixedTrig.atan2(A7S[19].y, A7S[19].x) - bodyA.GetAngle();
          A7S[98] = A7S[98] % (2 * Math.PI);
          if (A7S[98] < 0 && A7S[98] >= -Math.PI || A7S[98] > Math.PI) {
            A7S[87] = A7S[87];
          } else {
            A7S[87] = -A7S[87];
          }
          A7S[56] = A7S[87] / (joint.slen * 2);
          A7S[56] -= 0.5;
          A7S[56] *= 2;
          jointObj.maxMotorForce = joint.sf * Math.abs(A7S[56]);
          if (A7S[56] > 0) {
            jointObj.motorSpeed = -300;
          }
          joints.push(this.world.CreateJoint(jointObj));
          break;
        case 'rv':
          jointObj = new b2RevoluteJointDef();
          jointObj.bodyA = bodyA;
          jointObj.bodyB = bodyB;
          jointObj.localAnchorA.Set(joint.aa[0], joint.aa[1]);
          jointObj.localAnchorB.Set(joint.ab[0], joint.ab[1]);
          jointObj.enableLimit = joint.d.el;
          jointObj.lowerAngle = joint.d.la;
          jointObj.upperAngle = joint.d.ua;
          jointObj.enableMotor = joint.d.em;
          jointObj.motorSpeed = joint.d.ms;
          jointObj.maxMotorTorque = joint.d.mmt;
          jointObj.collideConnected = joint.d.cc === true;
          joints.push(this.world.CreateJoint(jointObj));
          break;
        case 'p':
          jointObj = new b2PrismaticJointDef();
          jointObj.bodyA = bodyA;
          jointObj.bodyB = bodyB;
          jointObj.localAnchorA.Set(joint.aa[0], joint.aa[1]);
          jointObj.localAnchorB.Set(joint.ab[0], joint.ab[1]);
          jointObj.localAxisA.Set(joint.axa[0], joint.axa[1]);
          jointObj.enableLimit = joint.d.el;
          jointObj.lowerTranslation = joint.d.lt;
          jointObj.upperTranslation = joint.d.ut;
          jointObj.enableMotor = joint.d.em;
          jointObj.motorSpeed = joint.d.ms;
          jointObj.maxMotorForce = joint.d.mmf;
          jointObj.collideConnected = joint.d.cc === true;
          joints.push(this.world.CreateJoint(jointObj));
          jointTranslation = joints[i].GetJointTranslation();
          const userData = {
            changeSide: joint.cs,
          };
          if (joint.d.cd && joint.d.el) {
            if ((joint.cs == 0 || joint.cs == 1) && jointTranslation > 0 && jointTranslation / joint.d.ut > 0.99) {
              joints[i].SetMotorSpeed(-joints[i].GetMotorSpeed());
              userData.changeSide = 2;
            } else if ((joint.cs == 0 || joint.cs == 2) && jointTranslation < 0 && jointTranslation / joint.d.lt > 0.99) {
              joints[i].SetMotorSpeed(-joints[i].GetMotorSpeed());
              userData.changeSide = 1;
            }
          }
          joints[i].SetUserData(userData);
          break;
        case 'd':
          jointObj = new b2DistanceJointDef();
          jointObj.bodyA = bodyA;
          jointObj.bodyB = bodyB;
          jointObj.localAnchorA.Set(joint.aa[0], joint.aa[1]);
          jointObj.localAnchorB.Set(joint.ab[0], joint.ab[1]);
          jointObj.length = joint.len;
          jointObj.frequencyHz = joint.d.fh;
          jointObj.dampingRatio = joint.d.dr;
          jointObj.collideConnected = joint.d.cc === true;
          joints.push(this.world.CreateJoint(jointObj));
          break;
      }
    }

    for (let i = 0; i != gst.discs.length; i++) {
      if (!gst.discs[i]) continue;
      const disc = gst.discs[i];

      const discShapeDef = new b2CircleShape(1);
      const discFixtureDef = new b2FixtureDef();
      const discBodyDef = new b2BodyDef();

      discFixtureDef.shape = discShapeDef;
      discFixtureDef.density = 1 / Math.PI;
      discFixtureDef.friction = 0.001337;
      discFixtureDef.restitution = 0.95;

      discBodyDef.type = b2Body.b2_dynamicBody;
      discBodyDef.position.x = disc.x;
      discBodyDef.position.y = disc.y;
      discBodyDef.angle = disc.a;
      discBodyDef.linearVelocity.x = disc.xv;
      discBodyDef.linearVelocity.y = disc.yv;
      discBodyDef.angularVelocity = disc.av;
      discBodyDef.angularDamping = 3.4;
      discBodyDef.linearDamping = 0.01;
      discBodyDef.fixedRotation = true;

      const discBody = this.world.CreateBody(discBodyDef);
      discBody.CreateFixture(discFixtureDef);

      const moveVector = new b2Vec2(0, 0);
      const moveAcc = 12;

      if (inputs[i].up) {
        moveVector.y = -moveAcc;
      } else if (inputs[i].down) {
        moveVector.y = moveAcc;
      }
      if (inputs[i].left) {
        moveVector.x = -moveAcc;
      } else if (inputs[i].right) {
        moveVector.x = moveAcc;
      }
      if (inputs[i].action1) {
        moveVector.Multiply(0.7);
      }
      discBody.ApplyForce(moveVector, discBody.GetWorldCenter());

      if (inputs[i].up && Math.abs(disc.yv) < 4) {
        const rayPointA = new b2Vec2(disc.x, disc.y);
        const rayPointB = new b2Vec2(disc.x, disc.y + 1.15);
        this.world.RayCast(() => {
          discBody.GetLinearVelocity().y -= 10;
        }, rayPointA, rayPointB);
      }

      discs[i] = discBody;
    }

    // after everything is set up, step
    this.world.Step(seconds, 2, 6);
    this.world.ClearForces();

    // save everything back into the gst
    for (let i = 0; i != gst.physics.bodies.length; i++) {
      gst.physics.bodies[i].p = [bodies[i].GetPosition().x, bodies[i].GetPosition().y];
      gst.physics.bodies[i].a = bodies[i].GetAngle();
      gst.physics.bodies[i].av = bodies[i].GetAngularVelocity();
      gst.physics.bodies[i].lv = [bodies[i].GetLinearVelocity().x, bodies[i].GetLinearVelocity().y];
      gst.physics.bodies[i].ld = bodies[i].GetLinearDamping();
      gst.physics.bodies[i].ad = bodies[i].GetAngularDamping();
      gst.physics.bodies[i].fr = bodies[i].IsFixedRotation();
      gst.physics.bodies[i].bu = bodies[i].IsBullet();
    }
    for (let i = 0; i != gst.discs.length; i++) {
      if (!gst.discs[i]) continue;
      const disc = gst.discs[i];
      disc.x = discs[i].GetPosition().x;
      disc.y = discs[i].GetPosition().y;
      disc.xv = discs[i].GetLinearVelocity().x;
      disc.yv = discs[i].GetLinearVelocity().y;
      gst.discs[i] = disc;
    }
    for (let i = 0; i != gst.physics.joints.length; i++) {
      const joint = gst.physics.joints[i];
      switch (joint.type) {
        case 'p':
          if (joints[i].GetUserData()) {
            joint.cs = joints[i].GetUserData().changeSide;
            joint.d.ms = joints[i].GetMotorSpeed();
          }
          break;
        case 'lpj':
          joint.pms = joints[i].GetMotorSpeed();
          break;
      }
    }

    // return the gst
    return gst;
  }
}

