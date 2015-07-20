/* jshint newcap: false */

'use strict';

import $ from 'jquery';
import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import ParticleSystem from './ParticleSystem';

const Vector = p5.Vector;

function sketch(s) {

  let config = { 
    parent: '.canvas-wrapper',
    particleSys: {
      sketch: s,
      isPaused: false,
      gravitationalConstant: 1,
      maxAccel: 1,
      maxVelocity: 10,
      edgeWrapMode: true,
      frictionFactor: 0.98,
    },
    mouseParticle: {
        position: new Vector(s.width/2, s.height/2),
        mass: 0,
        isPinned: true,
    },
    sliders: [
      'gravity',
      'mouseMass'
    ]
  };

  let $canvasWrapper = $(config.parent);
  let particleSys;
  let mouseParticle;
  let gravityEl = document.getElementById('gravity');

  function _updateGravity() {
    // gravity update
    particleSys.setGravity(gravityEl.value);
    document.getElementById('gravity-value').innerHTML = gravityEl.value;
  }

  function _setup() {
    particleSys = new ParticleSystem(config.particleSys);
    _updateGravity();

    // mouse Particle
    mouseParticle = particleSys.add(config.mouseParticle);

    for (let i = 0; i < s.width; i += 80) {
      for (let j = 0; j < s.height; j += 80) {
        particleSys.add( {
          position: new Vector(i, j),
          mass: 0,
        });
      }
    }
  }

  s.setup = function() {

    s.createCanvas(
      $canvasWrapper.innerWidth(),
      $canvasWrapper.innerHeight()
    ).parent($canvasWrapper[0]);

    s.background(0);
    s.noStroke();

    _setup();

    // setup click handlers
    $('.js-pause').on('click', function() {
      particleSys.togglePause();
      $(this).toggleClass('is-active');
    });
    $('.js-reset').on('click', _setup);
    $('#gravity').on('input', _updateGravity);
    $('canvas').on('mousedown', function() {
      mouseParticle.setMass(10000);
    });
    $('canvas').on('mouseup', function() {
      mouseParticle.setMass(0);
    });
  };

  s.draw = function() {
    s.background(0);

    // update mouse particle position
    particleSys.particles[0].position.set(s.mouseX, s.mouseY);
    particleSys.update().render();

  };

  s.keyPressed = function() {
    if (s.key === ' ') {
      particleSys.togglePause();
      $('.js-pause').toggleClass('is-active');
    }
  };

  s.windowResized = function() {
    s.resizeCanvas( $canvasWrapper.innerWidth(), $canvasWrapper.innerHeight() );
    s.setup();
  };

}

function init() {
  return new p5(sketch);
}

export default { init };