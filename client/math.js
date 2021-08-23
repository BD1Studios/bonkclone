window.bonkMath = {
  fixedTrig: {
    sin: (n) => {
      n = Math.sin(n);
      n *= 10000000;
      n = Math.round(n);
      n /= 10000000;
      return n;
    },
    cos: (n) => {
      n = Math.cos(n);
      n *= 10000000;
      n = Math.round(n);
      n /= 10000000;
      return n;
    },
    tan: (n) => {
      n = Math.tan(n);
      n *= 10000000;
      n = Math.round(n);
      n /= 10000000;
      return n;
    },
    asin: (n) => {
      n = Math.asin(n);
      n *= 10000000;
      n = Math.round(n);
      n /= 10000000;
      return n;
    },
    acos: (n) => {
      n = Math.acos(n);
      n *= 10000000;
      n = Math.round(n);
      n /= 10000000;
      return n;
    },
    atan: (n) => {
      n = Math.atan(n);
      n *= 10000000;
      n = Math.round(n);
      n /= 10000000;
      return n;
    },
    atan2: function(x, y) {
      let n = Math.atan2(x, y);
      n *= 10000000;
      n = Math.round(n);
      n /= 10000000;
      return n;
    },
  },
  rotateVec2: (vec, ang) => {
    const radAng = ang;// bonkMath.deg2rad(ang);
    if (typeof vec.x == 'number') {
      const oldVec = [vec.x, vec.y];
      vec.x = oldVec[0] * bonkMath.fixedTrig.cos(radAng) - oldVec[1] * bonkMath.fixedTrig.sin(radAng);
      vec.y = oldVec[0] * bonkMath.fixedTrig.sin(radAng) + oldVec[1] * bonkMath.fixedTrig.cos(radAng);
      return vec;
    } else {
      const oldVec = [vec[0], vec[1]];
      vec[0] = oldVec[0] * bonkMath.fixedTrig.cos(radAng) - oldVec[1] * bonkMath.fixedTrig.sin(radAng);
      vec[1] = oldVec[0] * bonkMath.fixedTrig.sin(radAng) + oldVec[1] * bonkMath.fixedTrig.cos(radAng);
      return vec;
    }
  },
  deg2rad: (ang) => {
    return ang * (Math.PI / 180);
  },
  rad2deg: (ang) => {
    return ang / (Math.PI / 180);
  },
};
