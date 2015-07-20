
'use strict';

import _ from 'lodash';
import p5 from 'p5';
import Particle from './Particle';

/**
* A Gravitational Particle System
*/
export default class ParticleSystem {

  /**
  * constructor
  */
  constructor(config) {
    let defaults = {
      gravitationalConstant: 5 * Math.pow(10,4),
      maxAccel: 1,
      maxVelocity: 100,
      particles: [],
      frictionFactor: 1,
      edgeBounceFactor: 1,
      sketch: null,
      isPaused: false,
      edgeBounceMode: false,
      edgeWrapMode: false,
      ellipseMode: 'RADIUS',
    };

    config = _.assign({}, defaults, config);

    if (! config.sketch) {
      throw new Error(`Particle System has no p5 sketch set.`);
    }

    Object.keys(config).forEach((key) => {
      this[key] = config[key];
    });

  }

  /**
  * removes all particles within the system
  */
  removeAll() {
    this.particles = [];
  }

  add(config) {
    let defaults = {
      position: new p5.Vector(0,0),
      velocity: new p5.Vector(0,0),
      acceleration: new p5.Vector(0,0),
      maxAccel: this.maxAccel,
      maxVelocity: this.maxVelocity,
      sketch: this.sketch,
      edgeBounceMode: this.edgeBounceMode,
      edgeWrapMode: this.edgeWrapMode,
      frictionFactor: this.frictionFactor,
      edgeBounceFactor: this.edgeBounceFactor,
    };

    config = _.assign({}, defaults, config);

    // create a new particle and add it to
    // our particles list
    let p = new Particle(config);
    this.particles.push(p);

    return p;
  }

  _applyForcesTo(particleFeelingForce) {

    // reset acceleration due to gravitation force to 0
    particleFeelingForce.acceleration.set(0,0);

    _.forEach(this.particles, (p) => {

      // don't apply force from self to self
      if (p === particleFeelingForce) {
        return;
      }

      // get distance between particleFeelingForce and p
      let distSq = particleFeelingForce.getDistSqTo(p);

      // direction of accel vector
      // normalized (unit length is 1)
      let rVector = particleFeelingForce.getVectorTo(p).normalize();

      // accel due to gravity (magnitude)
      let gAccel = this.gravitationalConstant/distSq * p.getMass();

      // limit it
      // if (gAccel > this.maxAccel || -gAccel > this.maxAccel) {
      //   gAccel = Math.sign(gAccel) * this.maxAccel;
      // }

      // multiply our rVector by acceleration due to gravity, to create the gravitational acceleration
      // vector
      let gVector = rVector.mult(gAccel).limit(this.maxAccel);

      // add this new acceleration
      particleFeelingForce.acceleration.add(gVector);
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this;
  }

  setGravity(g) {
    this.gravitationalConstant = g;
    return this;
  }

  update() {

    // update acceleration
    // we do this separately from updating position
    // since particle positions affect acceleration
    // (with the inverse sq of distance)
    _.forEach(this.particles, (p) => {
      this._applyForcesTo(p);
    });

    return this;
  }

  // TODO: combine update and render so that there's only
  // one loop. Probably better for performance, but
  // is there a tradeoff? Keeping separate for now.
  render() {
    let s = this.sketch;

    s.push();
    s.ellipseMode(s[this.ellipseMode]);
    s.colorMode(s.HSB);

    _.forEach(this.particles, (p) => {
      if (!this.isPaused) {
        p.update();
      }
      p.render();
    });

    s.pop();
  }

}