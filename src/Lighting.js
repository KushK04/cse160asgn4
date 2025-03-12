// HelloPoint1.js
// Vertex shader program
var VSHADER_SOURCE =
  'precision mediump float;' + 
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_UV;\n' +
  'attribute vec3 a_Normal;\n' +
  'varying vec2 v_UV;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_VertPos;\n' +
  'uniform float u_Size;\n' + 
  'uniform mat4 u_ModelMatrix;' + 
  'uniform mat4 u_NormalMatrix;' + 
  'uniform mat4 u_GlobalRotateMatrix;' +
  'void main() {\n' +
  '  gl_Position =  u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '  v_UV = a_UV;\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix*vec4(a_Normal,1)));\n' +
  '  v_VertPos = u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_VertPos;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'uniform vec3 u_cameraPos;\n' +
  'uniform bool u_lightOn;\n' +
  'uniform bool u_colorOn;\n' + 
  'uniform vec3 u_lightPos;\n' +
  'uniform int u_whichTexture;\n' +
  'uniform vec3 u_diffuseColor;\n' +
  'void main() {\n' +
  ' if (u_whichTexture == -3){\n' +
  '   gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);\n' +
  ' } else if (u_whichTexture == -2) {\n' +
  '   gl_FragColor = u_FragColor;\n' +
  ' } else if (u_whichTexture == -1) {\n' +
  '   gl_FragColor = vec4(v_UV, 1.0, 1.0);\n' +
  ' } else if (u_whichTexture == 0) {\n' +
  '   gl_FragColor = texture2D(u_Sampler0, v_UV);\n' +
  ' } else if (u_whichTexture == 1) {\n' +
  '   gl_FragColor = texture2D(u_Sampler1, v_UV);\n' +
  ' } else {\n' +  
  '   gl_FragColor = vec4(1, .2, .2, 1);\n' +
  ' }' +
  ' vec3 lightVector = u_lightPos - vec3(v_VertPos);' +
  ' float r=length(lightVector);' +
  ' vec3 L = normalize(lightVector);' +
  ' vec3 N = normalize(v_Normal);' +
  ' float nDotL = max(dot(N,L), 0.0);' +
  ' vec3 R = reflect(-L, N);' +
  ' vec3 E = normalize(u_cameraPos - vec3(v_VertPos));' +
  ' float specular = pow(max(dot(E,R), 0.0), 50.0);' +
  ' vec3 diffuse = vec3(gl_FragColor) *  nDotL;' +
  ' if (u_colorOn){diffuse = u_diffuseColor *  nDotL;}' +
  ' vec3 ambient = vec3(gl_FragColor) * 0.3 ;' +
  ' if (u_colorOn){ambient = u_diffuseColor *  0.3;}' +
  ' if(u_lightOn && u_whichTexture == 0){' +
  '   gl_FragColor = vec4(specular+diffuse+ambient, 1.0);' +
  ' } else if (u_lightOn){' +
  '   gl_FragColor = vec4(diffuse+ambient, 1.0);' +
  ' }' +
  '}\n';

/*
  ' //if (r < 1.0){' +
  ' //  gl_FragColor =  vec4(1,0,0,1);' +
  ' //} else if (r < 2.0){' +
  ' //  gl_FragColor = vec4(0,1,0,1);' +
  ' //}' +
  gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);
*/

function tohtml(s, hid){
    var elm = document.getElementById(hid);
    if (!elm){
        console.log("Failed to get " + hid + " from HTML");
        return;
    }
    elm.innerHTML = s;
}

function tohtmlval(s, hid){
  var elm = document.getElementById(hid);
  if (!elm){
      console.log("Failed to get " + hid + " from HTML");
      return;
  }
  elm.value = s;
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const STARS = 3;

let canvas;
let gl;
let g_lightPos = [0,0,0];
let a_Position;
let u_diffuseColor;
let g_lightAnimation = false;
let u_cameraPos;
let u_lightOn = true;
let g_lightOn = true;
let u_colorOn = false;
let g_colorOn = false;
let g_normalOn = true;
let a_UV; 
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_lightPos;
let u_whichTexture;
let u_NormalMatrix;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segmentCount = 10;
let g_camAngle = 0;
let g_camAngle2 = -2;
let g_leftArmRotate = 0;
let g_rightArmRotate = 0;
let g_headRotate = 0;
let g_walkLeftTranslate = 0;
let g_walkRightTranslate = 0;
let g_waveLeftAnimation = false;
let g_waveRightAnimation = false;
let g_walkAnimation = false;
let g_wagAnimation = false;
let g_nodAnimation = false;
let g_shiftClick = false;
let g_mouseClick = false;
let g_tail1Rotate = 0;
let g_tail2Rotate = 0;
let g_tail3Rotate = 0;
let g_eyeTranslate = 0.01;
//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];
var g_shapesList = [];

let colors = {
  body: [229/255,136/255,58/255,255/255], 
  belly: [237/255,225/255,151/255,255/255],
  arm: [255/255,170/255,88/255,255/255],
  eye: [14/255,68/255,106/255,255/255],
  tongue: [219/255,130/255,157/255,255/255],
  tail: [198/255,88/255,12/255,255/255],
  lid: [249/255,136/255,58/255,255/255],
  nostril: [207/255,77/255,19/255,255/255],
}

function setupWebGL(){
    canvas = document.getElementById('webgl');
   //gl = getWebGLContext(canvas);
   gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }  

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }  

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }  

  u_diffuseColor = gl.getUniformLocation(gl.program, 'u_diffuseColor');
  if (!u_diffuseColor) {
    console.log('Failed to get the storage location of u_diffuseColor');
    return;
  }  

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }     

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (u_cameraPos < 0 ) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }     

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (u_lightOn < 0 ) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }   

  u_colorOn = gl.getUniformLocation(gl.program, 'u_colorOn');
  if (u_colorOn < 0 ) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }   

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }   

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }  

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }  

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }  
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    
    return ([x,y]);
}

function updateAnimationAngles(){
  if (g_waveLeftAnimation){
    g_leftArmRotate = (45 * Math.sin(g_seconds*2) - 45);
  }

  if (g_waveRightAnimation){
    g_rightArmRotate = (45 * Math.sin(g_seconds*2) - 45);
  }

  if (g_nodAnimation){
    g_headRotate = (12.5 * Math.sin(g_seconds*2) - 2.5);
  }

  if (g_walkAnimation){
    g_walkLeftTranslate = (0.2 * Math.sin(g_seconds*2) + 0.2);
    g_walkRightTranslate = (-0.2 * Math.sin(g_seconds*2) + 0.2);
  }

  if (g_wagAnimation){
    g_tail1Rotate = (15 * Math.sin(g_seconds*4));
  }

  if (g_shiftClick && g_mouseClick){
    g_eyeTranslate = (0.065 * Math.sin(g_seconds*2) - 0.055);  
  } else {
    g_eyeTranslate = 0.01
  }
  if (g_lightAnimation){
    g_lightPos[0] = Math.cos(g_seconds);
  }
}

function initTextures() {
  var img = new Image(); 
  if (!img) {
    console.log('Failed to create the img');
    return false;
  } 
  img.onload = function(){ 
    sendimgtotext(img); 
  };
  img.src = 'scale.png';
  return true;
}

function sendimgtotext(image) {
  var text = gl.createTexture();
  if (!text) {
    console.log('Failed to create the texture');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, text);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
}

function renderScene(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let ST = performance.now();

    //var len = g_points.length;
    //var len = g_shapesList.length;

    //for(var i = 0; i < len; i++) {
    //    g_shapesList[i].render();
    //}


    //changeColor([0.4,0.4,0.4]);
    //drawTriangle3D([-1.0, 0.0, 0.0, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0]);

    var globalRotMat = new Matrix4().rotate(g_camAngle, 0, 1, 0);
    globalRotMat.rotate(g_camAngle2, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
//
    //var body = new Cube();
    //body.color = [1.0, 0.0, 0.0, 1.0];
    //body.matrix.translate(0.4, -0.8, 0);
    //body.matrix.rotate(90, 0, 0, 1);
    //body.matrix.scale(0.4, 0.8, 0.5);
    //body.drawCube();
//
    //var leftArm = new Cube();
    //leftArm.color = [1.0, 1.0, 0.0, 1.0];
    //leftArm.matrix.translate(-0.15, -0.6, 0.05);
    //leftArm.matrix.rotate(-g_yellowRotate, 0, 0, 1);
//
    ////if (g_yellowAnimation){
    ////  leftArm.matrix.rotate(45 * Math.sin(g_seconds), 0, 0, 1);
    ////} else {
    ////  leftArm.matrix.rotate(-g_yellowRotate, 0, 0, 1);
    ////}
    //var yellCordMat = new Matrix4(leftArm.matrix);
    //leftArm.matrix.scale(0.25, 0.7, 0.35);
    //leftArm.drawCube();
//
    //var box = new Cube();
    //box.color = [1, 0, 1, 1];
    //box.matrix = yellCordMat;
    //box.matrix.translate(0, 0.7, 0, 1);
    //box.matrix.rotate(g_magentaRotate, 0, 0, 1);
    //box.matrix.scale(0.2, 0.2, 0.2  );
    //box.drawCube();

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, 0, 2, 1);
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform1i(u_colorOn, g_colorOn);

    var light = new Cube();
    light.color = [2,2,0,1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(.05,.05,.05);
    light.matrix.translate(-0.5,-0.5,-0.5);
    light.normalMatrix.setInverseOf(light.matrix).transpose();
    light.render();

    var ground = new Cube();
    ground.color = [0.7,0.7,0.7,1];
    if (g_normalOn) ground.textureNum = -3;
    ground.matrix.translate(0, -0.71, 0);
    ground.matrix.scale(5,0,5);
    ground.matrix.translate(-0.5, 0, -0.5);
    ground.normalMatrix.setInverseOf(ground.matrix).transpose();
    ground.render();

    var body = new Cube();
    body.color = colors.body;
    body.matrix.translate(-0.25, -0.6, -0.5);
    body.matrix.scale(0.5, 0.5, 0.5);
    body.matrix.rotate(0, 0, 0, 1);
    if (g_normalOn) body.textureNum=-3;
    var bodyToBelly = new Matrix4(body.matrix);
    var bodyToHead = new Matrix4(body.matrix);
    var bodytoLArm = new Matrix4(body.matrix);
    var bodytoRArm = new Matrix4(body.matrix);
    var bodytoLLeg = new Matrix4(body.matrix);
    var bodytoRLeg = new Matrix4(body.matrix);
    var bodyToTail1 = new Matrix4(body.matrix);
    body.matrix.scale(0.4, 0.7, 0.4);
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    body.render();

    var tail1 = new Cube();
    tail1.color = colors.arm;
    tail1.matrix = bodyToTail1;
    if (g_normalOn) tail1.textureNum=-3;
    tail1.matrix.translate(0.075, 0.08, 0.2);
    tail1.matrix.rotate(5, 1, 0, 0);
    tail1.matrix.rotate(g_tail1Rotate, 0, 1, 0);
    var tail1ToTail2 = new Matrix4(tail1.matrix);
    tail1.matrix.scale(0.25, 0.2 , 0.4);
    tail1.normalMatrix.setInverseOf(tail1.matrix).transpose();
    tail1.render();

    var tail2 = new Cube()
    tail2.color = colors.arm;
    tail2.matrix = tail1ToTail2;
    if (g_normalOn) tail2.textureNum=-3;
    tail2.matrix.translate(0.03,0.033, 0.3);
    tail2.matrix.rotate(g_tail2Rotate, 0, 1, 0);
    var tail2ToTail3 = new Matrix4(tail2.matrix);
    tail2.matrix.scale(0.20, 0.15 , 0.33);
    tail2.normalMatrix.setInverseOf(tail2.matrix).transpose();
    tail2.render();

    var tail3 = new Cube();
    tail3.color = colors.arm;
    tail3.matrix = tail2ToTail3;
    if (g_normalOn) tail3.textureNum=-3;
    tail3.matrix.translate(0.03,0.033, 0.2);
    tail3.matrix.rotate(g_tail3Rotate, 0, 1, 0);
    var tail3ToFire = new Matrix4(tail3.matrix);
    tail3.matrix.scale(0.15, 0.10 , 0.33);
    tail3.normalMatrix.setInverseOf(tail3.matrix).transpose();
    tail3.render();

    var fire = new Sphere();
    fire.matrix = tail3ToFire;
    if (g_normalOn) fire.textureNum=-3;
    fire.matrix.translate(0.06, 0.05, 0.38);
    fire.matrix.scale(0.2, 0.2, 0.2);
    fire.normalMatrix.setInverseOf(fire.matrix).transpose();
    fire.render();

    var belly = new Cube();
    belly.color = colors.belly;
    belly.matrix = bodyToBelly;
    if (g_normalOn) belly.textureNum=-3;
    belly.matrix.translate(0.06 , 0.1, -0.04);
    belly.matrix.scale(0.28, 0.5 , 0.2);
    belly.normalMatrix.setInverseOf(belly.matrix).transpose();
    belly.render();

    var head = new Cube();
    head.color = colors.body;
    head.matrix = bodyToHead;
    if (g_normalOn) head.textureNum=-3;
    head.matrix.translate(0.05, 0.6, 0.05);
    head.matrix.rotate(g_headRotate, 1, 0, 0);
    var headToLEye = new Matrix4(head.matrix);
    var headToREye = new Matrix4(head.matrix);
    var headToSnout = new Matrix4(head.matrix);
    var headToSnout2 = new Matrix4(head.matrix);
    var headToTongue = new Matrix4(head.matrix);
    head.matrix.scale(0.3, 0.4, 0.3);
    head.normalMatrix.setInverseOf(head.matrix).transpose();
    head.render();

    var lEye = new Cube();
    lEye.color = colors.eye;
    lEye.matrix = headToLEye;
    if (g_normalOn) lEye.textureNum=-3;
    lEye.matrix.translate(0.03, 0.25, -0.05);
    var lEyeToLid = new Matrix4(lEye.matrix);
    var lEyeToPupil = new Matrix4(lEye.matrix);
    lEye.matrix.scale(0.08, 0.1, 0.08);
    lEye.normalMatrix.setInverseOf(lEye.matrix).transpose();
    lEye.render();

    var lPupil = new Cube();
    lPupil.color = [1,1,1,1];
    lPupil.matrix = lEyeToPupil;
    if (g_normalOn) lPupil.textureNum=-3;
    lPupil.matrix.translate(0.04,0.06,-0.01);
    lPupil.matrix.scale(0.04, 0.04, 0.04);
    lPupil.normalMatrix.setInverseOf(lPupil.matrix).transpose();
    lPupil.render();

    var rEye = new Cube();
    rEye.color = colors.eye;
    rEye.matrix = headToREye;
    if (g_normalOn) rEye.textureNum=-3;
    rEye.matrix.translate(0.18, 0.25, -0.05);
    var rEyetoLid = new Matrix4(rEye.matrix);
    var rEyeToPupil = new Matrix4(rEye.matrix);
    rEye.matrix.scale(0.08, 0.1, 0.08);
    rEye.normalMatrix.setInverseOf(rEye.matrix).transpose();
    rEye.render();    

    var rPupil = new Cube();
    rPupil.color = [1,1,1,1];
    rPupil.matrix = rEyeToPupil;
    if (g_normalOn) rPupil.textureNum=-3;
    rPupil.matrix.translate(0,0.06,-0.01);
    rPupil.matrix.scale(0.04, 0.04, 0.04);
    rPupil.normalMatrix.setInverseOf(rPupil.matrix).transpose();
    rPupil.render();

    var rEyeLid = new Cube();
    rEyeLid.color = colors.lid;
    rEyeLid.matrix = rEyetoLid;
    if (g_normalOn) rEyeLid.textureNum=-3;
    rEyeLid.matrix.translate(-0.01, 0.11, -0.03);
    rEyeLid.matrix.scale(0.1, g_eyeTranslate, 0.14);
    rEyeLid.normalMatrix.setInverseOf(rEyeLid.matrix).transpose();
    rEyeLid.render();

    var lEyeLid = new Cube();
    lEyeLid.color = colors.lid;
    lEyeLid.matrix = lEyeToLid;
    if (g_normalOn) lEyeLid.textureNum=-3;
    lEyeLid.matrix.translate(0, 0.11, -0.03);
    lEyeLid.matrix.scale(0.08, 0.01, 0.1);
    lEyeLid.normalMatrix.setInverseOf(lEyeLid.matrix).transpose();
    lEyeLid.render();

    var snout = new Cube();
    snout.color = colors.arm;
    if (g_normalOn) snout.textureNum=-3;
    snout.matrix = headToSnout;
    snout.matrix.translate(0.02, 0.18, -0.04);
    var snouttoNostril1 = new Matrix4(snout.matrix);
    var snouttoNostril2 = new Matrix4(snout.matrix);
    snout.matrix.scale(0.25, 0.04, 0.1);
    snout.normalMatrix.setInverseOf(snout.matrix).transpose();
    snout.render();

    var nostril1 = new Cube();
    nostril1.color = colors.nostril;
    nostril1.matrix = snouttoNostril1;
    if (g_normalOn) nostril1.textureNum=-3;
    nostril1.matrix.translate(0.085,0.015,-0.01);
    nostril1.matrix.scale(0.025,0.025, 0.025);
    nostril1.normalMatrix.setInverseOf(nostril1.matrix).transpose();
    nostril1.render();

    var nostril2 = new Cube();
    nostril2.color = colors.nostril;
    nostril2.matrix = snouttoNostril2;
    if (g_normalOn) nostril2.textureNum=-3;
    nostril2.matrix.translate(0.14,0.015,-0.01);
    nostril2.matrix.scale(0.025,0.025, 0.025);
    nostril2.normalMatrix.setInverseOf(nostril2.matrix).transpose();
    nostril2.render();

    var snout2 = new Cube();
    snout2.color = colors.arm;
    snout2.matrix = headToSnout2;
    if (g_normalOn) snout2.textureNum=-3;
    snout2.matrix.translate(0.06, 0.13, -0.04);
    snout2.matrix.scale(0.18, 0.03, 0.1);
    snout2.normalMatrix.setInverseOf(snout2.matrix).transpose();
    snout2.render();

    var tongue = new Cube();
    tongue.color = colors.tongue;
    tongue.matrix = headToTongue;
    if (g_normalOn) tongue.textureNum=-3;
    tongue.matrix.translate(0.06, 0.16, -0.04);
    tongue.matrix.scale(0.18, 0.02, 0.1);
    tongue.normalMatrix.setInverseOf(tongue.matrix).transpose();
    tongue.render();    

    var arm = new Cube();
    arm.color = colors.arm;
    arm.matrix = bodytoLArm;
    if (g_normalOn) arm.textureNum=-3;
    arm.matrix.translate(0.1, 0.5, 0.1);
    arm.matrix.rotate(-45, 0, 0, 1);
    arm.matrix.rotate(g_leftArmRotate, 0, 0, 1);
    arm.matrix.scale(-0.1, -0.4, 0.1);
    arm.normalMatrix.setInverseOf(arm.matrix).transpose();
    arm.render();

    var arm2 = new Cube();
    arm2.color = colors.arm;
    arm2.matrix = bodytoRArm;
    if (g_normalOn) arm2.textureNum=-3;
    arm2.matrix.translate(0.33, 0.6, 0.1);
    arm2.matrix.rotate(45, 0, 0, 1);
    arm2.matrix.rotate(-g_rightArmRotate, 0, 0, 1);
    arm2.matrix.scale(-0.1, -0.45, 0.1);
    arm2.normalMatrix.setInverseOf(arm2.matrix).transpose();
    arm2.render();    

    var leg = new Cube();
    leg.color = colors.arm;
    leg.matrix = bodytoLLeg;
    if (g_normalOn) leg.textureNum=-3;
    leg.matrix.translate(0.035, -0.2, 0.12);
    leg.matrix.scale(0.12, 0.3, 0.15);
    leg.matrix.translate(0, g_walkLeftTranslate, 0);
    leg.normalMatrix.setInverseOf(leg.matrix).transpose();
    leg.render();

    var leg2 = new Cube();
    leg2.color = colors.arm;
    leg2.matrix = bodytoRLeg;
    if (g_normalOn) leg2.textureNum=-3;
    leg2.matrix.translate(0.235, -0.2, 0.12);
    leg2.matrix.scale(0.12, 0.3, 0.15);
    leg2.matrix.translate(0, g_walkRightTranslate, 0);
    leg2.normalMatrix.setInverseOf(leg2.matrix).transpose();
    leg2.render();

    //  drawBuffer();

    var dur = performance.now() - ST;
    tohtml("ms: " + Math.floor(dur) + " fps: " + Math.floor(10000/dur)/10, "perf");
}

function changeColor(color){
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], 1);
}

function drawShield(){
    g_shapesList=[]; 
    renderScene();
    changeColor([0.4,0.4,0.4]);
    drawTriangle([0,0.95,-0.8,0.7,0,0.7]);
    drawTriangle([0,0.95,0.8,0.7,0,0.7]);
    drawTriangle([-0.8,0.2,-0.8,0.7,0,0.7]);
    drawTriangle([-0.8,0.2,0,0.2,0,0.7]);
    drawTriangle([0.8,0.2,0.8,0.7,0,0.7]);
    drawTriangle([0.8,0.2,0,0.2,0,0.7]);
    drawTriangle([0.8,0.2,0,0.2,0,0.7]);
    drawTriangle([0,-0.9,0,0.2,-0.8,0.2]);
    drawTriangle([0,-0.9,0,0.2,0.8,0.2]);

    changeColor([0,0,0.8]);
    drawTriangle([0,0.85,-0.7,0.7,0,0.7]);
    drawTriangle([0,0.85,0.7,0.7,0,0.7]);
    drawTriangle([-0.7,0.2,-0.7,0.7,0,0.7]);
    drawTriangle([0.7,0.2,0.7,0.7,0,0.7]);
    drawTriangle([-0.7,0.2,0,0.7,0,0.2]);
    drawTriangle([0.7,0.2,0,0.7,0,0.2]);
    drawTriangle([-0.7,0.2,0,-0.8,0,0.2]);
    drawTriangle([0.7,0.2,0,-0.8,0,0.2]);

    changeColor([0.8,0.5,0.2]);
    drawTriangle([0,-0.6,-0.2,-0.3,0.2,-0.3]);

    changeColor([1,0,0]);
    drawTriangle([0,-0.15,-0.5,0.15,0.5,0.15]);
    drawTriangle([0,-0.15,-0.5,0.15,0.5,0.15]);
    drawTriangle([-0.3,-0.12,-0.35,0.15,0,0]);
    drawTriangle([0.3,-0.12,0.35,0.15,0,0]);

    changeColor([1,1,0]);
    drawTriangle([0,0.7, -0.3,0.3, 0.3, 0.3]);

    changeColor([0,0,1]);
    drawTriangle([0,0.3, -0.15,0.5, 0.15, 0.5]);   
    
    changeColor([0.4,0.4,0.4]);
    drawTriangle([-0.3,0.75, -0.3,0.55, -0.6, 0.35]);  
    drawTriangle([0.3,0.75, 0.3,0.55, 0.6, 0.35]);  
}

function hTR(h){
  return [parseInt(h.substr(1,2), 16)/255.0, parseInt(h.substr(3,2), 16)/255.0, parseInt(h.substr(5,2), 16)/255.0]
}

function addActionsForHTMLUI(){
    //Issue with green and blue, had to switch g_sel indices for them & change on mouseup to input
    document.getElementById("normalOn").onclick = function(){g_normalOn = true};
    document.getElementById("normalOff").onclick = function(){g_normalOn = false};
    document.getElementById("colorOn").onclick = function(){g_colorOn = true};
    document.getElementById("colorOff").onclick = function(){g_colorOn = false};
    document.getElementById("lightOn").onclick = function(){g_lightOn = true};
    document.getElementById("lightOff").onclick = function(){g_lightOn =  false};
    document.getElementById("animationLOn").onclick = function(){g_lightAnimation = true};
    document.getElementById("animationLOff").onclick = function(){g_lightAnimation = false};
    var color = document.getElementById("diffuseColor");
    color.addEventListener("input", function(){
      var r = hTR(color.value);
      gl.uniform3f(u_diffuseColor, r[0], r[1], r[2]);
    });
    document.getElementById("lightSliderX").addEventListener('input', function(){g_lightPos[0] = this.value/100; renderScene();});  
    document.getElementById("lightSliderY").addEventListener('input', function(){g_lightPos[1] = this.value/100; renderScene();});  
    document.getElementById("lightSliderZ").addEventListener('input', function(){g_lightPos[2] = this.value/100; renderScene();});    
    document.getElementById("angleSlider").addEventListener('input', function(){g_camAngle = this.value; renderScene();});
    document.getElementById("angle2Slider").addEventListener('input', function(){g_camAngle2 = this.value; renderScene();});
    document.getElementById("leftArmSlider").addEventListener('input', function(){g_leftArmRotate = this.value; renderScene();});
    document.getElementById("rightArmSlider").addEventListener('input', function(){g_rightArmRotate = this.value; renderScene();});
    document.getElementById("headSlider").addEventListener('input', function(){g_headRotate = this.value; renderScene();});
    document.getElementById("tail1Slider").addEventListener('input', function(){g_tail1Rotate = this.value; renderScene();});
    document.getElementById("tail2Slider").addEventListener('input', function(){g_tail2Rotate = this.value; renderScene();});
    document.getElementById("tail3Slider").addEventListener('input', function(){g_tail3Rotate = this.value; renderScene();});
    document.getElementById("waveLeftOn").onclick = function(){g_waveLeftAnimation = true;};
    document.getElementById("waveLeftOff").onclick = function(){g_waveLeftAnimation = false;};
    document.getElementById("waveRightOn").onclick = function(){g_waveRightAnimation = true;};
    document.getElementById("waveRightOff").onclick = function(){g_waveRightAnimation = false;};
    document.getElementById("nodOn").onclick = function(){g_nodAnimation = true;};
    document.getElementById("nodOff").onclick = function(){g_nodAnimation = false;};
    document.getElementById("walkOn").onclick = function(){g_walkAnimation = true;};
    document.getElementById("walkOff").onclick = function(){g_walkAnimation = false;};
    document.getElementById("wagOn").onclick = function(){g_wagAnimation = true;};
    document.getElementById("wagOff").onclick = function(){g_wagAnimation = false;};
    document.addEventListener("keydown", (event) =>{
      if (event.key === "Shift") g_shiftClick = true;
    });
    document.addEventListener("keyup", (event) =>{
      if (event.key === "Shift") g_shiftClick = false;
    });
    document.addEventListener("mousedown", (event) =>{
      g_mouseClick = true;
    });
    document.addEventListener("mouseup", (event) =>{
      g_mouseClick = false;
    });
}


function main() {

    setupWebGL();

    connectVariablesToGLSL();

    initTextures();

    addActionsForHTMLUI();  

    // Register function (event handler) to be called on a mouse press
    canvas.addEventListener("click", function(ev) {click(ev, canvas);});
    //document.onkeydown = keydown;
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderScene(); 
    requestAnimationFrame(tick);
 }

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;


function tick(){
  g_seconds = performance.now() / 1000.0 - g_startTime;
  //console.log(g_seconds);
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
 }

function click(ev, canvas) {

    let rect = canvas.getBoundingClientRect();
    let x = ((ev.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
    let y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);

    g_camAngle = x * -180;
    g_camAngle2 = y * 90;

    tohtmlval(g_camAngle, "angleSlider");
    tohtmlval(g_camAngle2, "angle2Slider");

    //console.log(g_camAngle);
    //console.log(g_camAngle2);

    var globalRotMat = new Matrix4().rotate(g_camAngle, 0, 1, 0);
    globalRotMat.rotate(g_camAngle2, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);    

    renderScene();
}