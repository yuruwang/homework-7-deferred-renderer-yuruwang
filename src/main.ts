import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Texture from './rendering/gl/Texture';

// Define an object with application parameters and button callbacks
const controls = {
  focusLength:"0.8",
  DOFSwitch: false,
  bloomSwitch: true,
  toneMapSwitch: true,
};

let square: Square;
export let canvas = <HTMLCanvasElement> document.getElementById('canvas');

// TODO: replace with your scene's stuff

let obj0: string;
let mesh0: Mesh;
let mesh1: Mesh;
let mesh2: Mesh;

let tex0: Texture;

let focus = 0.8;
let useDOF = false
let useBloom = true;
let useToneMap = true;


var timer = {
  deltaTime: 0.0,
  startTime: 0.0,
  currentTime: 0.0,
  updateTime: function() {
    var t = Date.now();
    t = (t - timer.startTime) * 0.001;
    timer.deltaTime = t - timer.currentTime;
    timer.currentTime = t;
  },
}


function loadOBJText() {
  obj0 = readTextFile('../resources/obj/wahoo.obj')
}


function loadScene() {
  square && square.destroy();
  mesh0 && mesh0.destroy();

  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();

  mesh0 = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  mesh0.create();

  mesh1 = new Mesh(obj0, vec3.fromValues(0, 0, 10));
  mesh1.create();

  mesh2 = new Mesh(obj0, vec3.fromValues(0, 0, -10));
  mesh2.create();

  tex0 = new Texture('../resources/textures/wahoo.bmp')
}


function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  var bloomSwitch = gui.add(controls, 'bloomSwitch');
  var DOFSwitch = gui.add(controls, 'DOFSwitch');
  var toneMapSwitch = gui.add(controls, 'toneMapSwitch');
  var focusLength = gui.add(controls, 'focusLength');


  bloomSwitch.onChange(function(value : boolean){
    if (value === true) {
      useBloom = true;
    } else {
      useBloom = false;
    }
  });

  toneMapSwitch.onChange(function(value : boolean){
    if (value === true) {
      useToneMap = true;
    } else {
      useToneMap = false;
    }
  });

  DOFSwitch.onChange(function(value : boolean){
    if (value === true) {
      useDOF = true;
    } else {
      useDOF = false;
    }
  });
  focusLength.onChange(function(value : number){
    focus = value;
  });

  // get canvas and webgl context
  
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 9, 25), vec3.fromValues(0, 9, 0));

  const renderer = new OpenGLRenderer(canvas, canvas.width, canvas.height);
    
  renderer.setClearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  const standardDeferred = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/standard-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/standard-frag.glsl')),
    ]);

  standardDeferred.setupTexUnits(["tex_Color"]);

  function tick() {
    // console.log("dimension in main= " + canvas.width + "," + canvas.height);
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    timer.updateTime();
    renderer.updateTime(timer.deltaTime, timer.currentTime);

    standardDeferred.bindTexToUnit("tex_Color", tex0, 0);

    renderer.clear();
    renderer.clearGB();

    // TODO: pass any arguments you may need for shader passes
    // forward render mesh info into gbuffers
    renderer.renderToGBuffer(camera, standardDeferred, [mesh0, mesh1, mesh2]);
    // renderer.renderToGBuffer(camera, standardDeferred, [mesh0]);
    // render from gbuffers into 32-bit color buffer
    renderer.renderFromGBuffer(camera, useBloom);
    // apply 32-bit post and tonemap from 32-bit color to 8-bit color
    if (useBloom) {
      renderer.renderPostProcessHDR(useToneMap);
    }
    // apply 8-bit post and draw
    if (useDOF) {
      renderer.renderPostProcessLDR(camera, focus);
    }


    stats.end();
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}


function setup() {
  timer.startTime = Date.now();
  loadOBJText();
  main();
}

setup();
