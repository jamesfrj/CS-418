
/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Eric Shaffer <shaffer1@eillinois.edu>  
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The Vertx Shader Transformation Matrix */
var mvMatrix = mat4.create();

/** @global The time variable */
var time = new Date();

/** @global The time of running last animation */
var then = 0;

/** @global Traslation constant */
var Tx = 0.001, Ty = 0.003;

/** @global The coordinate of center of badge */
var CenterX = 0.0, CenterY = 0.0;

/** @global Rotation constant */
var Rad = 0.001;

/** @global The degree of incline  */
var Verticle = 0.0;

/** @global The non-affine transformation constants */
var dance1 = 0.01, dance2 = 0.0;

/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor"); 
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

/**
 * Populate buffers with data
 */
function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  var triangleVertices = [
          //blue top rectangle
          0.893, 0.956, 0.0,
          0.893, 0.665, 0.0,
         -0.893, 0.665, 0.0,

          0.893, 0.956, 0.0,
         -0.893, 0.956, 0.0,
         -0.893, 0.665, 0.0,

          //blue right big rectangle
          0.715, 0.665, 0.0,
          0.715,-0.307, 0.0,
          0.324,-0.307, 0.0,

          0.715, 0.665, 0.0,
          0.324, 0.665, 0.0,
          0.324,-0.307, 0.0,

          //blue left big rectangle
         -0.715, 0.665, 0.0,
         -0.715,-0.307, 0.0,
         -0.324,-0.307, 0.0,

         -0.715, 0.665, 0.0,
         -0.324, 0.665, 0.0,
         -0.324,-0.307, 0.0,

          //blue right small rectangle
          0.182, 0.378, 0.0,
          0.182,-0.048, 0.0,
          0.324,-0.048, 0.0,

          0.182, 0.378, 0.0,
          0.324, 0.378, 0.0,
          0.324,-0.048, 0.0,

          //blue left small rectangle
         -0.182, 0.378, 0.0,
         -0.182,-0.048, 0.0,
         -0.324,-0.048, 0.0,

         -0.182, 0.378, 0.0,
         -0.324, 0.378, 0.0,
         -0.324,-0.048, 0.0,

          //orange right most
          0.715,-0.369, 0.0,
          0.715,-0.502, 0.0,
          0.585,-0.369, 0.0,

          0.585,-0.369, 0.0,
          0.715,-0.502, 0.0,
          0.585,-0.58,  0.0,

          //orange second right
          0.325,-0.369, 0.0,
          0.455,-0.63,  0.0,
          0.455,-0.369, 0.0,

          0.325,-0.369, 0.0,
          0.455,-0.63,  0.0,
          0.325,-0.70,  0.0,

          //orange third right
          0.065,-0.369, 0.0,
          0.195,-0.369, 0.0,
          0.195,-0.75,  0.0,

          0.065,-0.369, 0.0,
          0.195,-0.75,  0.0,
          0.065,-0.80,  0.0,

          //orange left most
         -0.715,-0.369, 0.0,
         -0.715,-0.502, 0.0,
         -0.585,-0.369, 0.0,

         -0.585,-0.369, 0.0,
         -0.715,-0.502, 0.0,
         -0.585,-0.58,  0.0,

          //orange second left
         -0.325,-0.369, 0.0,
         -0.455,-0.63,  0.0,
         -0.455,-0.369, 0.0,

         -0.325,-0.369, 0.0,
         -0.455,-0.63,  0.0,
         -0.325,-0.70,  0.0,

          //orange third left
         -0.065,-0.369, 0.0,
         -0.195,-0.369, 0.0,
         -0.195,-0.75,  0.0,

         -0.065,-0.369,0.0,
         -0.195,-0.75, 0.0,
         -0.065,-0.80, 0.0,
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;        //x,y,z coordinates. 
  vertexPositionBuffer.numberOfItems = 66;  //22 triangles in total. 
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
        //Blue part color. 
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,

        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,

        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,

        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,

        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,
        0.058, 0.114, 0.227, 1.0,

        //red-orange part color. 
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,

        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,

        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,

        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,

        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,

        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
        0.9, 0.192, 0.176, 1.0,
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;   //RGB
  vertexColorBuffer.numItems = 66;  //22 triangles in total. 
}

/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Define the values of mvMatrix
  // Translation values
  mat4.translate(mvMatrix, mvMatrix, [Tx, Ty, 0.0])
  // Rotation values
  mat4.rotateZ(mvMatrix, mvMatrix, Rad)

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)

  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

/**
 * Tick called for every animation frame.
 */
function tick() {
    // Animation time track. 
    requestAnimFrame(tick);
    draw();
    standard_reset()
    coordinate_reset();
}

/**
 * Standard_reset called for reset values of global animation constants. 
 */
function standard_reset() {
  var now = time.getTime();
  var deltaTime = now - then;
  //rebound when touch left of right boundary
  if (CenterX+0.893 >= 1.0 || CenterX-0.891 <= -1.0) {
    Tx *= -1;
  }
  //rebound when touch top or bottom boundary
  if (CenterY +0.956 >= 1.0 || CenterY-0.800 <= -1.0) {
    Ty *= -1;
  }
  //change rotation direction
  if (Verticle >= 0.01 || Verticle <= -0.01) {
    Rad *= -1;
  }
  //open/close the two small rectangles
  if (dance2 >= 0.182 || dance2 <= -0.001) {
    dance1 *= -1;
  }
  //update standard constants
  CenterX += Tx;
  CenterY += Ty;
  Verticle += Rad;
  dance2 += dance1;
  then = now
}

/**
 * Coordinate_reset called to set coordinates for non-affine transformation. 
 * It basically varies the coordinates of the four smalles blue triangles to create
 * the effect of opening/closing the 'I' gate. 
 */
function coordinate_reset() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  var triangleVertices = [
          //blue top rectangle
          0.893, 0.956, 0.0,
          0.893, 0.665, 0.0,
         -0.893, 0.665, 0.0,

          0.893, 0.956, 0.0,
         -0.893, 0.956, 0.0,
         -0.893, 0.665, 0.0,

          //blue right big rectangle
          0.715, 0.665, 0.0,
          0.715,-0.307, 0.0,
          0.324,-0.307, 0.0,

          0.715, 0.665, 0.0,
          0.324, 0.665, 0.0,
          0.324,-0.307, 0.0,

          //blue left big rectangle
         -0.715, 0.665, 0.0,
         -0.715,-0.307, 0.0,
         -0.324,-0.307, 0.0,

         -0.715, 0.665, 0.0,
         -0.324, 0.665, 0.0,
         -0.324,-0.307, 0.0,

          //blue right small rectangle
          0.182-dance2, 0.378, 0.0,
          0.182-dance2,-0.048, 0.0,
          0.324,-0.048, 0.0,

          0.182-dance2, 0.378, 0.0,
          0.324, 0.378, 0.0,
          0.324,-0.048, 0.0,

          //blue left small rectangle
         -0.182+dance2, 0.378, 0.0,
         -0.182+dance2,-0.048, 0.0,
         -0.324,-0.048, 0.0,

         -0.182+dance2, 0.378, 0.0,
         -0.324, 0.378, 0.0,
         -0.324,-0.048, 0.0,

          //orange right most
          0.715,-0.369, 0.0,
          0.715,-0.502, 0.0,
          0.585,-0.369, 0.0,

          0.585,-0.369, 0.0,
          0.715,-0.502, 0.0,
          0.585,-0.58,  0.0,

          //orange second right
          0.325,-0.369, 0.0,
          0.455,-0.63,  0.0,
          0.455,-0.369, 0.0,

          0.325,-0.369, 0.0,
          0.455,-0.63,  0.0,
          0.325,-0.70,  0.0,

          //orange third right
          0.065,-0.369, 0.0,
          0.195,-0.369, 0.0,
          0.195,-0.75,  0.0,

          0.065,-0.369, 0.0,
          0.195,-0.75,  0.0,
          0.065,-0.80,  0.0,

          //orange left most
         -0.715,-0.369, 0.0,
         -0.715,-0.502, 0.0,
         -0.585,-0.369, 0.0,

         -0.585,-0.369, 0.0,
         -0.715,-0.502, 0.0,
         -0.585,-0.58,  0.0,

          //orange second left
         -0.325,-0.369, 0.0,
         -0.455,-0.63,  0.0,
         -0.455,-0.369, 0.0,

         -0.325,-0.369, 0.0,
         -0.455,-0.63,  0.0,
         -0.325,-0.70,  0.0,

          //orange third left
         -0.065,-0.369, 0.0,
         -0.195,-0.369, 0.0,
         -0.195,-0.75,  0.0,

         -0.065,-0.369,0.0,
         -0.195,-0.75, 0.0,
         -0.065,-0.80, 0.0,
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;        //x,y,z coordinates
  vertexPositionBuffer.numberOfItems = 66;  //22 triangles in total. 
}

/**
 * Startup function called from html code to start program.
 */
 function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  // Set background color to white. 
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  // Start animation. 
  tick();
}