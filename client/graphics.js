class BonkGraphics {
  constructor(app) {
    this.app = app;
    this.mapGraphics = new PIXI.Graphics();
    this.discGraphics = [];
    this.scaleRatio = 1;
    this.app.stage.addChild(this.mapGraphics);
  }
  render(gst) {
    this.scaleRatio = (this.app.view.clientWidth / this.app.renderer.resolution) / 730;
    this.renderMap(gst);
    this.renderDiscs(gst);
  }
  renderDiscs(gst) {
    for (let i = 0; i != gst.discs.length; i++) {
      if (!gst.discs[i]) continue;
      if (!this.discGraphics[i]) {
        this.discGraphics[i] = new discGraphic(i, this.scaleRatio);
        this.app.stage.addChild(this.discGraphics[i].container);
      }
      this.discGraphics[i].render(gst);
    }
  }
  renderMap(gst) {
    this.mapGraphics.clear();
    for (let i = 0; i != gst.physics.bodies.length; i++) {
      const body = gst.physics.bodies[i];
      for (let i = 0; i != body.fx.length; i += 0.5) {
        const fixture = gst.physics.fixtures[body.fx[Math.floor(i)]];
        const shape = gst.physics.shapes[fixture.sh];
        const ppm = gst.physics.ppm;
        let pointArray = [];
        const isShadow = Math.floor(i) == i;
        const shadowDist = 2;

        if (!shape) continue;
        if (fixture.np && isShadow) continue;

        if (isShadow) {
          this.mapGraphics.beginFill(0x000000, 0.2);
        } else {
          this.mapGraphics.beginFill(fixture.f);
        }

        switch (shape.type) {
          case 'bx':
            const width = shape.w / 2 * ppm * this.scaleRatio;
            const height = shape.h / 2 * ppm * this.scaleRatio;
            pointArray = [];
            pointArray.push(new PIXI.Point(width, -height));
            pointArray.push(new PIXI.Point(width, height));
            pointArray.push(new PIXI.Point(-width, height));
            pointArray.push(new PIXI.Point(-width, -height));
            for (let i = 0; i != pointArray.length; i++) {
              pointArray[i] = bonkMath.rotateVec2(pointArray[i], shape.a);
              pointArray[i].x += shape.c[0] * ppm * this.scaleRatio;
              pointArray[i].y += shape.c[1] * ppm * this.scaleRatio;
              pointArray[i] = bonkMath.rotateVec2(pointArray[i], body.a);
              pointArray[i].x += body.p[0] * ppm * this.scaleRatio;
              pointArray[i].y += body.p[1] * ppm * this.scaleRatio;
              if (isShadow) {
                pointArray[i].x += shadowDist; pointArray[i].y += shadowDist;
              }
            }
            this.mapGraphics.drawPolygon(pointArray);
            break;
          case 'ci':
            let pos = new PIXI.Point(shape.c[0] * ppm * this.scaleRatio, shape.c[1] * ppm * this.scaleRatio);
            pos = bonkMath.rotateVec2(pos, body.a);
            pos.x += body.p[0] * ppm * this.scaleRatio;
            pos.y += body.p[1] * ppm * this.scaleRatio;
            if (isShadow) {
              pos.x += 2; pos.y += shadowDist;
            }
            this.mapGraphics.drawCircle(pos.x, pos.y, shape.r * ppm * this.scaleRatio);
            break;
          case 'po':
            pointArray = [];
            for (let i = 0; i != shape.v.length; i++) {
              pointArray.push(new PIXI.Point(0, 0));
              pointArray[i].x += shape.v[i][0] * shape.s * ppm * this.scaleRatio;
              pointArray[i].y += shape.v[i][1] * shape.s * ppm * this.scaleRatio;
              pointArray[i] = bonkMath.rotateVec2(pointArray[i], body.a);
              pointArray[i].x += body.p[0] * ppm * this.scaleRatio;
              pointArray[i].y += body.p[1] * ppm * this.scaleRatio;
              window.fuck = pointArray[0].x;
              if (isShadow) {
                pointArray[i].x += shadowDist; pointArray[i].y += shadowDist;
              }
            }
            this.mapGraphics.drawPolygon(pointArray);
            break;
        }

        this.mapGraphics.endFill();
      }
    }
  }
}
class discGraphic {
  constructor(discID, scaleRatio) {
    this.discID = discID;
    this.scaleRatio = scaleRatio;
    this.container = new PIXI.Container();
    this.discCircle = new PIXI.Graphics();
    console.log(this.scaleRatio);
    this.discText = new PIXI.Text('Sneezing_Cactus', {
      fontFamily: 'Titillium Web',
      fontSize: 11 * this.scaleRatio,
      fill: 0xffffff,
      align: 'center',
      dropShadow: true,
      dropShadowDistance: 3,
      dropShadowAlpha: 0.30,
    });
    this.discText.x = -this.discText.width / 2 + 1;
    this.discText.resolution = 2;
    this.container.addChild(this.discCircle);
    this.container.addChild(this.discText);
  }
  render(gst) {
    const disc = gst.discs[this.discID];
    const ppm = gst.physics.ppm;

    this.container.position.x = disc.x * ppm * this.scaleRatio;
    this.container.position.y = disc.y * ppm * this.scaleRatio;

    this.discCircle.clear();
    this.discCircle.beginFill(0x000000, 0.2);
    this.discCircle.drawCircle(2, 2, ppm * this.scaleRatio);
    this.discCircle.endFill();

    this.discCircle.beginFill(0x5555FF);
    this.discCircle.drawCircle(0, 0, ppm * this.scaleRatio);
    this.discCircle.endFill();

    this.discText.position.y = 1 * ppm;
  }
}
