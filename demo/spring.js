/* 
Notes on springs:

* It takes fewer steps to animate fast springs than slow springs. In other words,
  steps-per-ms is constant. What changes is how drastically the states
  change at each step.

*/
var reduce = Array.prototype.reduce;

function roundTo(number, decimals) {
  // Round a number to a given number of decimal places.
  var d = Math.pow(10, decimals);
  return Math.round(number * d) / d;
}

function id() {
  return Math.random().toString(16).substring(2, 10);
}

function dampenedHookeForce(displacement, velocity, stiffness, damping) {
  //
  // @TODO look at proper Verlet integration.
  //
  // Hooke's Law -- the basic spring force.
  // <http://en.wikipedia.org/wiki/Hooke%27s_law>
  //
  //     F = -kx
  //
  // Where:
  // x is the vector displacement of the end of the spring from its equilibrium,
  // k is a constant describing the tightness of the spring.
  var hookeForce = -1 * (stiffness * displacement);

  // Applying friction to Hooke's Law for realistic physics
  // <http://gafferongames.com/game-physics/spring-physics/>
  //
  //     F = -kx - bv
  //
  // Where:
  // b is damping (friction),
  // v is the relative velocity between the 2 points.
  return hookeForce - (damping * velocity);
}

function particle(x, velocity, mass) {
  return {
    x: x || 0,
    velocity: velocity || 0,
    mass: mass || 1
  };
}

function tick(particle, stiffness, damping) {
  // "Tick" a particle given a spring force.
  // Mutates the particle object!
  var force = dampenedHookeForce(
    particle.x,
    particle.velocity,
    stiffness,
    damping
  );

  // Acceleration = force / mass.
  var acceleration = force / particle.mass;

  // Increase velocity by acceleration.
  particle.velocity += acceleration;
  // Update distance from resting.
  particle.x += particle.velocity / 100;

  return particle;
}

function isParticleResting(particle) {
  // Find out if a particle is at rest.
  // Returns a boolean.
  return Math.round(particle.x) === 0 && Math.abs(particle.velocity) < 0.2;
}

function accumulateCurvePoints(x, velocity, mass, stiffness, damping) {
  // Accumulate all states of a spring as an array of points.
  // Returns an array representing x values over time..

  // Create a temporary particle object.
  var p = particle(x, velocity, mass);

  // Create a points array to accumulate into.
  var points = [];

  while(!isParticleResting(p)) {
    points.push(tick(p, stiffness, damping).x);
  }

  return points;
}

var noPrefix = [''];

// List in order of cascade.
var stdPrefixes = [
  '-moz-',
  ''
];

function asCssRule(key, value, prefixes) {
  prefixes = prefixes || noPrefix;
  return reduce.call(prefixes, function reduceRule(string, prefix) {
    return string + prefix + key + ':' + value + ';';
  }, '');
}

function asCssStatement(identifier, cssString, prefixes) {
  prefixes = prefixes || noPrefix;
  return reduce.call(prefixes, function (string, prefix) {
    return string + prefix + identifier +  '{' + cssString + '}';
  }, '');
}

function prependAtSymbol(string) {
  return '@' + string;
}

function generateAnimationCss(points, name, duration, mapper, prefixes) {
  // Create a hardware-accelarated CSS Keyframe animation from a series of points,
  // an animation name and a mapper function that returns a CSS string for
  // a given point distance.

  // Convert to range from 0 - 100 (for 0% - 100% keyframes).
  var frameSize = 100 / (points.length - 1);

  // Build keyframe string
  var keyframes = reduce.call(points, function(frames, point, i) {
    // Create the percentage key for the frame. Round to nearest 5 decimals.
    var percent = roundTo(frameSize * i, 5);
    // Wrap the mapped point value in a keyframe. Mapper is expected to return
    // a valid set of CSS properties as a string.
    return frames + asCssStatement(percent + '%', mapper(point));
  }, '');

  // Prepend the @ to our prefixes (keyframes -> @-moz-keyframes, @keyframes)
  var atPrefixes = prefixes.map(prependAtSymbol);

  // Wrap keyframe string into @keyframes statement. Give animation a name
  // so we can reference it.
  var keyframeStatement = asCssStatement('keyframes ' + name + ' ', keyframes, atPrefixes);

  // Build properties string for our animation classname.
  var properties = 
    asCssRule('animation-duration', duration, prefixes) +
    asCssRule('animation-name', name, prefixes) +
    asCssRule('animation-timing-function', 'linear', prefixes) +
    asCssRule('animation-fill-mode', 'both', prefixes);

  // Wrap properties string as a CSS class statement. Give class same name
  // as animation.
  var animationStatement = asCssStatement('.' + name, properties);

  // Return our combined animation rule set string.
  return keyframeStatement + animationStatement;
}

function appendStyle(headEl, css) {
  // Create a new style element.
  var styleEl = document.createElement('style');
  // Assign the text content.
  styleEl.textContent = css;
  // Append style to head.
  headEl.appendChild(styleEl);
  return styleEl;
}

function animateSpringViaCss(el, x, velocity, mass, stiffness, damping, mapper, prefixes, fps) {
  fps = fps || 60;
  prefixes = prefixes || noPrefix;

  // Accumulate the points of the spring curve
  var points = accumulateCurvePoints(x, velocity, mass, stiffness, damping);

  // Compute the timespan of the animation based on the number of frames we
  // have and the fps we desire.
  var duration = (points.length / fps) * 1000;

  // Generate a unique name for this animation.
  var name = 'spring-' + id();

  // Create CSS animation classname.
  var css = generateAnimationCss(points, name, duration + 'ms', mapper, prefixes);

  // Create style element and append it to head element.
  var styleEl = appendStyle(document.head, css);

  // Add animation classname to element.
  el.classList.add(name);

  setTimeout(function cleanupAnimation() {
    // Append final style to element.
    el.style.cssText += mapper(0);
    // Remove animation classname and styles. We're done with it.
    document.head.removeChild(styleEl);
    // Remove classname appended to element.
    el.classList.remove(name);
  }, duration + 1);
}

function animateSpring(x, velocity, mass, stiffness, damping, callback) {
  /* Animate a spring force from its current state to resting state.
  Takes a callback which will be called with the x position over and over
  and over until the spring is at rest. */

  // Create a temporary particle object.
  var p = particle(x, velocity, mass);

  var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

  function looper() {
    tick(p, stiffness, damping);
    if(isParticleResting(p)) return;
    callback(p.x);
    requestAnimationFrame(looper);
  }

  looper();
}

