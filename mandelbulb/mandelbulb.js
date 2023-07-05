// Get shader source code
const VERTEX_SHADER = await fetch( './shader.vert' ).then( res => res.text() );
const FRAGMENT_SHADER = await fetch( './shader.frag' ).then( res => res.text() );

// PREP CANVAS
const canvas = document.getElementById( 'mandelbulb' );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let gl = canvas.getContext( "webgl" );

let vertexShaderSource = VERTEX_SHADER;
let fragmentShaderSource = FRAGMENT_SHADER;

// Create vertex shader
let vertexShader = gl.createShader( gl.VERTEX_SHADER );
gl.shaderSource( vertexShader, vertexShaderSource );
gl.compileShader( vertexShader );

// Create fragment shader
let fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
gl.shaderSource( fragmentShader, fragmentShaderSource );
gl.compileShader( fragmentShader );

// Create shader program
let shaderProgram = gl.createProgram();
gl.attachShader( shaderProgram, vertexShader );
gl.attachShader( shaderProgram, fragmentShader );
gl.linkProgram( shaderProgram );
gl.useProgram( shaderProgram );

// Define cube vertices
let vertices = [];
for ( let x = -50;x < 50;x += 2 ) {
  for ( let y = -50;y < 50;y += 2 ) {
    for ( let z = -50;z < 50;z += 2 ) {
      vertices.push( x, y, z );
    }
  }
}

// Create buffer for vertices
let vertexBuffer = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

// Bind vertex buffer to attribute
let aPosition = gl.getAttribLocation( shaderProgram, "aPosition" );
gl.enableVertexAttribArray( aPosition );
gl.vertexAttribPointer( aPosition, 3, gl.FLOAT, false, 0, 0 );

// Set up projection matrix
let projectionMatrix = mat4.create();
mat4.perspective( projectionMatrix, 45.0 * Math.PI / 180.0, canvas.width / canvas.height, 0.1, 1000.0 );

// Set up model-view matrix
let modelViewMatrix = mat4.create();
mat4.translate( modelViewMatrix, modelViewMatrix, [ 0.0, 0.0, -200.0 ] );

// Get uniform locations
let uModelViewMatrix = gl.getUniformLocation( shaderProgram, "uModelViewMatrix" );
let uProjectionMatrix = gl.getUniformLocation( shaderProgram, "uProjectionMatrix" );

// Set uniform values
gl.uniformMatrix4fv( uModelViewMatrix, false, modelViewMatrix );
gl.uniformMatrix4fv( uProjectionMatrix, false, projectionMatrix );

// Set clear color and enable depth testing
gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
gl.enable( gl.DEPTH_TEST );

// Make sure mouse is clicked
let dragging = false;
canvas.addEventListener( "mousedown", e => dragging = true );
canvas.addEventListener( "mouseup", e => dragging = false );

var camera = {
  x: 0.0,
  y: 0.0,
  z: 1.0
};
canvas.addEventListener( "mousemove", function ( event ) {
  if ( !dragging ) return 0;
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  // new camera position based on mouse (inverted x, y) [-1,1]
  // Calculate the camera position relative to the stored position
  camera.x = camera.x + ( 0.5 - x / canvas.width ) * 2.0;
  camera.y = camera.y + ( y / canvas.height - 0.5 ) * 2.0;
  camera.z = camera.z + 1.0;

  let cameraPosition = vec3.fromValues( camera.x, camera.y, camera.z );
  vec3.normalize( cameraPosition, cameraPosition );
  vec3.scale( cameraPosition, cameraPosition, 200.0 );

  // Update model-view matrix
  mat4.lookAt( modelViewMatrix, cameraPosition, [ 0.0, 0.0, 0.0 ], [ 0.0, 1.0, 0.0 ] );
  gl.uniformMatrix4fv( uModelViewMatrix, false, modelViewMatrix );

  // Clear canvas and draw cube
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
  gl.drawArrays( gl.POINTS, 0, vertices.length / 3 );
} );

// canvas.addEventListener( "wheel", function ( event ) {
//   event.preventDefault();
//   console.log( event.deltaY / 100 );

//   let zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
//   camera.z += zoomAmount;
//   camera.z = Math.max( camera.z, 0.1 );
//   camera.z = Math.min( camera.z, 4.0 );

//   let cameraPosition = vec3.fromValues( camera.x, camera.y, camera.z );
//   vec3.normalize( cameraPosition, cameraPosition );
//   vec3.scale( cameraPosition, cameraPosition, 200.0 );

//   // Update model-view matrix
//   mat4.lookAt( modelViewMatrix, cameraPosition, [ 0.0, 0.0, 0.0 ], [ 0.0, 1.0, 0.0 ] );
//   gl.uniformMatrix4fv( uModelViewMatrix, false, modelViewMatrix );

//   // Clear canvas and draw cube
//   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
//   gl.drawArrays( gl.POINTS, 0, vertices.length / 3 );
// } );



// Clear canvas and draw cube
gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
gl.drawArrays( gl.POINTS, 0, vertices.length / 3 );