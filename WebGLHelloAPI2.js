var gl;

function testGLError(functionLastCalled) {
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    } catch (e) {}

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }

    return true;
}

var shaderProgram;

function initialiseBuffer() {

    var vertexData = [-0.5, 0.6, -0.5, 1.0, 0.0, 0.0, 1.0, // Front Face
        -0.5, -0.6, -0.5, 1.0, 0.0, 0.0, 1.0, // Front Face
        0.5, 0.6, -0.5, 1.0, 0.0, 1.0, 1.0, // Front Face
        0.5, -0.6, -0.5, 1.0, 0.0, 0.0, 1.0, // Front Face

        -0.5, -0.6, -0.5, 1.0, 1.0, 0.0, 1.0, // Front Face
        0.5, -0.6, -0.5, 1.0, 1.0, 1.0, 1.0, // Front Face 
        0.5, 0.6, -0.5, 1.0, 1.0, 0.0, 1.0, // Front Face

        -0.5, 0.6, 0.5, 0.0, 0.0, 1.0, 1.0, // Back Face
        0.5, 0.6, 0.5, 0.0, 0.0, 1.0, 1.0, // Back Face
        -0.5, -0.6, 0.5, 0.0, 0.0, 1.0, 1.0, // Back Face
        0.5, 0.6, 0.5, 0.0, 0.0, 1.0, 1.0, // Back Face
        0.5, -0.6, 0.5, 0.0, 0.0, 1.0, 1.0, // Back Face 
        -0.5, -0.6, 0.5, 0.0, 0.0, 1.0, 1.0, // Back Face

    ];

    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();

    // Bind buffer as a vertex buffer so we can fill it with data
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return testGLError("initialiseBuffers");
}

function initialiseShaders() {


    var fragmentShaderSource = '\
			varying highp vec4 color; \
			void main(void) \
			{ \
				gl_FragColor = color; \
			}';
    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    var vertexShaderSource = '\
			attribute highp vec4 myVertex; \
			attribute highp vec4 myColor; \
			uniform mediump mat4 transformationMatrix; \
			varying highp vec4 color; \
			void main(void)  \
			{ \
				gl_Position = transformationMatrix * myVertex; \
				color = myColor; \
			}';

    // Create the vertex shader object
    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);

    // Load the source code into it
    gl.shaderSource(gl.vertexShader, vertexShaderSource);

    // Compile the source code
    gl.compileShader(gl.vertexShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();

    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");

    // Link the program
    gl.linkProgram(gl.programObject);

    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    /*	Use the Program
        Calling gl.useProgram tells WebGL that the application intends to use this program for rendering. Now that it's installed into
        the current state, any further gl.draw* calls will use the shaders contained within it to process scene data. Only one program can
        be active at once, so in a multi-program application this function would be called in the render loop. Since this application only
        uses one program it can be installed in the current state and left there.
    */
    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

var rot_z = 0.0;

function renderScene() {

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");

    // Matrix used to specify the orientation of the triangle on screen
    var transformationMatrix = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];
    rot_z += 0.01;
    transformationMatrix[5] = Math.cos(rot_z);
    transformationMatrix[10] = Math.cos(rot_z);
    transformationMatrix[6] = Math.sin(rot_z);
    transformationMatrix[9] = -Math.sin(rot_z);


    // Pass the identity transformation matrix to the shader using its location
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }


    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
    var canvas = document.getElementById("helloapicanvas");

    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }


    // Render loop
    requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000, 60);
            };
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}