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
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
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
    // x, y, z - r, g, b, a - tx, ty
    var vertexData = [-0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, //3
        0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, //1
        0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, //2

        -0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, //3
        0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, //2
        -0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, //4

        0.5, 0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, //2
        0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, //6
        -0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, //8

        -0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, //8
        0.5, 0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, //2
        -0.5, 0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, //4

        0.5, -0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 0.0, 1.0, //5
        0.5, -0.5, -0.5, 1.0, 0.5, 0.0, 1.0, 0.0, 1.0, //6
        0.5, 0.5, -0.5, 1.0, 0.5, 0.0, 1.0, 1.0, 1.0, //2

        0.5, -0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 0.0, 1.0, //5
        0.5, 0.5, -0.5, 1.0, 0.5, 0.0, 1.0, 1.0, 1.0, //2
        0.5, 0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 1.0, 1.0, //1

        -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //7
        -0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //8
        -0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, //4

        -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //7
        -0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, //4
        -0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, //3

        -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, //7
        0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, //5
        0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, //1

        -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, //7
        0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, //1
        -0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, //3

        -0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, //7
        0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, //5
        0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, //6

        -0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, //7
        0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, //6
        -0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, //8
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
			varying mediump vec4 color; \
			void main(void) \
			{ \
				gl_FragColor = 1.0 * color;\
			}';

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Matrix가 M, V, P 세개가 들어가고, 각각 곱해서 MyVertex에 쓴다.
    // vertex cordinate, color, uv
    var vertexShaderSource = '\
			attribute highp vec3 myVertex; \
			attribute highp vec4 myColor; \
			attribute highp vec2 myUV; \
			uniform mediump mat4 Pmatrix; \
			uniform mediump mat4 Vmatrix; \
			uniform mediump mat4 Mmatrix; \
			varying mediump vec4 color; \
			varying mediump vec2 texCoord;\
			void main(void)  \
			{ \
				gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(myVertex, 1.0);\
				color = myColor;\
				texCoord = myUV; \
			}';

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    gl.programObject = gl.createProgram();

    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    gl.bindAttribLocation(gl.programObject, 2, "myUV");

    // Link the program
    gl.linkProgram(gl.programObject);

    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

// FOV(종횡비), Aspect Ratio, Near, Far
// Projection을 만드는 함수
// angle은 시야각
// zMin, zMax를 통해 어디서부터 어디까지 그릴것인지를 정한다.
function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180); //angle*.5
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1, // 마지막 -1은 습관적으로 저렇게 한다.
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

var proj_matrix = get_projection(30, 1.0, 1, 5);
var mov_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// translating z

view_matrix[14] = view_matrix[14] - 2; //zoom, -2를 해서 화면 뒤로 보내서 전체 화면을 볼 수 있게 한다. (카메라를 뒤로 2미터 뺐다)

function idMatrix(m) {
    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;
    m[4] = 0;
    m[5] = 1;
    m[6] = 0;
    m[7] = 0;
    m[8] = 0;
    m[9] = 0;
    m[10] = 1;
    m[11] = 0;
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
}

function mulMatrix(m, k) {
    m0 = m[0];
    m1 = m[1];
    m2 = m[2];
    m3 = m[3];
    m4 = m[4];
    m5 = m[5];
    m6 = m[6];
    m7 = m[7];
    m8 = m[8];
    m9 = m[9];
    m10 = m[10];
    m11 = m[11];
    m12 = m[12];
    m13 = m[13];
    m14 = m[14];
    m15 = m[15];
    k0 = k[0];
    k1 = k[1];
    k2 = k[2];
    k3 = k[3];
    k4 = k[4];
    k5 = k[5];
    k6 = k[6];
    k7 = k[7];
    k8 = k[8];
    k9 = k[9];
    k10 = k[10];
    k11 = k[11];
    k12 = k[12];
    k13 = k[13];
    k14 = k[14];
    k15 = k[15];

    a0 = k0 * m0 + k3 * m12 + k1 * m4 + k2 * m8;
    a4 = k4 * m0 + k7 * m12 + k5 * m4 + k6 * m8;
    a8 = k8 * m0 + k11 * m12 + k9 * m4 + k10 * m8;
    a12 = k12 * m0 + k15 * m12 + k13 * m4 + k14 * m8;

    a1 = k0 * m1 + k3 * m13 + k1 * m5 + k2 * m9;
    a5 = k4 * m1 + k7 * m13 + k5 * m5 + k6 * m9;
    a9 = k8 * m1 + k11 * m13 + k9 * m5 + k10 * m9;
    a13 = k12 * m1 + k15 * m13 + k13 * m5 + k14 * m9;

    a2 = k2 * m10 + k3 * m14 + k0 * m2 + k1 * m6;
    a6 = k6 * m10 + k7 * m14 + k4 * m2 + k5 * m6;
    a10 = k10 * m10 + k11 * m14 + k8 * m2 + k9 * m6;
    a14 = k14 * m10 + k15 * m14 + k12 * m2 + k13 * m6;

    a3 = k2 * m11 + k3 * m15 + k0 * m3 + k1 * m7;
    a7 = k6 * m11 + k7 * m15 + k4 * m3 + k5 * m7;
    a11 = k10 * m11 + k11 * m15 + k8 * m3 + k9 * m7;
    a15 = k14 * m11 + k15 * m15 + k12 * m3 + k13 * m7;

    m[0] = a0;
    m[1] = a1;
    m[2] = a2;
    m[3] = a3;
    m[4] = a4;
    m[5] = a5;
    m[6] = a6;
    m[7] = a7;
    m[8] = a8;
    m[9] = a9;
    m[10] = a10;
    m[11] = a11;
    m[12] = a12;
    m[13] = a13;
    m[14] = a14;
    m[15] = a15;
}

function translate(m, tx, ty, tz) {
    var tm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    tm[12] = tx;
    tm[13] = ty;
    tm[14] = tz;
    mulMatrix(m, tm);
}

function rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
        mv4 = m[4],
        mv8 = m[8];

    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];
    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
    mulMatrix(rm, m);
}

function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1],
        mv5 = m[5],
        mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
        mv4 = m[4],
        mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

rotValue = 0.0;
animRotValue = 0.0;
transX = 0.0;
frames = 1;

// html에서 쓴 함수
function animRotate() {
    animRotValue += 0.01;
}

function trXinc() {
    transX += 0.01;
    document.getElementById("webTrX").innerHTML = "transX : " + transX.toFixed(4);
}

function renderScene() {

    //console.log("Frame "+frames+"\n");
    frames += 1;

    var Pmatrix = gl.getUniformLocation(gl.programObject, "Pmatrix");
    var Vmatrix = gl.getUniformLocation(gl.programObject, "Vmatrix");
    var Mmatrix = gl.getUniformLocation(gl.programObject, "Mmatrix");

    idMatrix(mov_matrix);
    rotateZ(mov_matrix, rotValue);
    rotateX(mov_matrix, rotValue);
    rotValue += animRotValue;
    translate(mov_matrix, transX, 0.0, 0.0);
    //transX += 0.01; 

    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 36, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 36, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 36, 28);


    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // gl.enable(gl.CULL_FACE);
    // gl.enable(gl.BLEND); 

    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
    document.getElementById("matrix0").innerHTML = mov_matrix[0].toFixed(4);
    document.getElementById("matrix1").innerHTML = mov_matrix[1].toFixed(4);
    document.getElementById("matrix2").innerHTML = mov_matrix[2].toFixed(4);
    document.getElementById("matrix3").innerHTML = mov_matrix[3].toFixed(4);
    document.getElementById("matrix4").innerHTML = mov_matrix[4].toFixed(4);
    document.getElementById("matrix5").innerHTML = mov_matrix[5].toFixed(4);
    document.getElementById("matrix6").innerHTML = mov_matrix[6].toFixed(4);
    document.getElementById("matrix7").innerHTML = mov_matrix[7].toFixed(4);
    document.getElementById("matrix8").innerHTML = mov_matrix[8].toFixed(4);
    document.getElementById("matrix9").innerHTML = mov_matrix[9].toFixed(4);
    document.getElementById("matrix10").innerHTML = mov_matrix[10].toFixed(4);
    document.getElementById("matrix11").innerHTML = mov_matrix[11].toFixed(4);
    document.getElementById("matrix12").innerHTML = mov_matrix[12].toFixed(4);
    document.getElementById("matrix13").innerHTML = mov_matrix[13].toFixed(4);
    document.getElementById("matrix14").innerHTML = mov_matrix[14].toFixed(4);
    document.getElementById("matrix15").innerHTML = mov_matrix[15].toFixed(4);
    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
    var canvas = document.getElementById("helloapicanvas");
    console.log("Start");

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
    requestAnimFrame = (
        function() {
            //	return window.requestAnimationFrame || window.webkitRequestAnimationFrame 
            //	|| window.mozRequestAnimationFrame || 
            return function(callback) {
                // console.log("Callback is"+callback); 
                window.setTimeout(callback, 100, 10);
            };
        })();

    (function renderLoop(param) {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}