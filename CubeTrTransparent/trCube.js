var gl;

function testGLError(functionLastCalled) {
    /*
        파라미터 : 가장 최근에 call된 gl함수를 파라미터로 받고, 이를 test하여 에러가 발생하는지 확인한다.
        에러가 발생하면, 에러 메시지를 출력하고 false를 리턴한다. 정상적이면 true를 리턴한다.
    */
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }

    return true;
}

// GL 초기화
function initialiseGL(canvas) {
    try {
        // webgl혹은 experimental-webgl(베타버전)을 쓸거라는 선언
        // HTML document의 canvas(실제로 그릴 그림)
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        // 원근법을 설정하기 위해 viewport를 정한다.
        // canvas의 x.start, y.start값과, 폭과 높이, 시작점을 받아온다.
        gl.viewport(0, 0, canvas.width, canvas.height);
    } catch (e) {}

    // 에러가 발생하면, gl이 null일 것이므로, 경고 메시지를 보여준다. 이후 false 리턴
    // 정상적이면 true 리턴.
    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }

    return true;
}

var shaderProgram;

// Vertex Buffer 초기화: Vertex Buffer에서 그릴 때 마다 가져올 필요 없이, 미리 GPU에 저장해 놓는다.
function initialiseBuffer() {

    // 삼각형의 vertex를 의미한다. x, y, z (정규화된 좌표계)
    // x와 y는 -1부터 1까지의 값을 가진다.
    // y는 화면 위로 갈때 1, 화면 아래로 갈때 -1
    // x, y, z ,r, g, b, a, tx, ty (texture cordinate)
    var vertexData = [-0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 0.5, 0.0, 1.0, //3
        0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 0.5, 1.0, 1.0, //1
        0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 0.5, 1.0, 1.0, //2

        -0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 0.5, 0.0, 1.0, //3
        0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 0.5, 1.0, 1.0, //2
        -0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 0.5, 0.0, 1.0, //4

        0.5, 0.5, -0.5, 0.0, 0.0, 0.0, 0.5, 1.0, 1.0, //2
        0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.5, 1.0, 0.0, //6
        -0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, //8

        -0.5, 0.5, -0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 1.0, //4
        0.5, 0.5, -0.5, 0.0, 0.0, 0.0, 0.5, 1.0, 1.0, //2
        -0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, //8

        0.5, -0.5, 0.5, 1.0, 0.5, 0.0, 0.5, 0.0, 1.0, //5
        0.5, -0.5, -0.5, 1.0, 0.5, 0.0, 0.5, 0.0, 1.0, //6
        0.5, 0.5, -0.5, 1.0, 0.5, 0.0, 0.5, 1.0, 1.0, //2

        0.5, -0.5, 0.5, 1.0, 0.5, 0.0, 0.5, 0.0, 1.0, //5
        0.5, 0.5, -0.5, 1.0, 0.5, 0.0, 0.5, 1.0, 1.0, //2
        0.5, 0.5, 0.5, 1.0, 0.5, 0.0, 0.5, 1.0, 1.0, //1

        -0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 0.5, 0.0, 1.0, //4
        -0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.5, 0.0, 0.0, //8
        -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.5, 0.0, 0.0, //7

        -0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 0.5, 0.0, 1.0, //3
        -0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 0.5, 0.0, 1.0, //4
        -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.5, 0.0, 0.0, //7

        -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 0.0, 0.0, //7
        0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 1.0, 0.0, //5
        0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 1.0, 1.0, //1

        -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 0.0, 0.0, //7
        0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 1.0, 1.0, //1
        -0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 0.0, 1.0, //3

        0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 1.0, 0.0, //6
        0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 0.5, 1.0, 0.0, //5
        -0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0, //7

        -0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0, //8
        0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 1.0, 0.0, //6
        -0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0, //7
    ];

    // buffer object 생성
    gl.vertexBuffer = gl.createBuffer();
    // 생성된 buffer를 vertex buffer로 bind하고, data를 채운다.
    /*
        GL_STATIC_DRAW: buffer object data는 애플리케이션에 의해 한 번 구체화되고, primitive들을 그리기 위해 여러 번 사용될 것이다.
        GL_DYNAMIC_DRAW: buffer object는 애플리케이션에 의해 반복적으로 구체화되고, primitive들을 그리기 위해 여러 번 사용될 것이다.
        GL_STREAM_DRAW: buffer object는 애플리케이션에 의해 한 번 구체화되고, primitive들을 그리기 위해 조금 사용될 것이다.
    */
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    // 버퍼의 크기를 조정한다. gl.STATIC_DRAW는 GPU의 버퍼에서 읽고, 수정하지 않을 것이라는 것을 알려준다.
    // CPU 메모리에 있는 Vertex Element Data를 실제로 GPU(VBO)로 보내준다. VBO의 초기화 혹은 업데이트에 사용된다.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return testGLError("initialiseBuffers");
}

// 쉐이더 초기화
function initialiseShaders() {

    // Fragment Shader가 Vertex Shader에서 Attribute로 color를 받고, frag color에 사용. 
    var fragmentShaderSource = '\
			varying mediump vec4 color; \
			void main(void) \
			{ \
				gl_FragColor = 1.0 * color;\
			}';

    // fragment shader object 생성.
    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    // Load the source code into it
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    // Compile the source code
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // 매트릭스 4개 -> MVP 매트릭스 M: 물체에 대한 회전, V: 카메라에 대한 위치, P: 원근법을 만들기 위한 매트릭스
    // Varying을 통해 Fragment Shader로 Color를 넣어주었다.
    // 벡터가 4개(vec4) javascript코드에서 Transformation Matrix를 제외한 나머지는 알아서 채운다. 마지막은 1.
    // 매트릭스(renderScene에 있음)도 4X4로 받아온다. (vector가 4차원이기 때문)
    // myVertex attribute 사용, myColor attribute 사용
    // varying으로 color 선언 후, mycolor를 color에 넣는다.
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

    // if (gl_Position.w != 0.0) { \
    //     gl_Position.x = gl_Position.x / gl_Position.w + 1.0;\
    //     gl_Position.y = gl_Position.y / gl_Position.w + 1.0;\
    //     gl_Position.z = gl_Position.z / gl_Position.w + 1.0;\
    //     }   \
    //     else    \
    //     {   \
    //         gl_Position.x += 1.0;   \
    //         gl_Position.y += 1.0;   \
    //         gl_Position.z += 1.0;   \
    //     }   \

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

    // gl.bindAttribLocation(program, index, name);
    /*
        Vertex가 어떤 attribute를 사용할지 C코드에 bind한다.
        index: attribute index
        name: C코드에서 정의한 attribute의 이름
    */
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    gl.bindAttribLocation(gl.programObject, 2, "myUV");

    // Link the program
    gl.linkProgram(gl.programObject);

    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    // Fragment Shader와 Vertex Shader의 값들을 메모리에 로딩해서 실행할 준비를 한다.
    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

// FOV, Aspect Ratio, Near, Far
// Projection Matrix 생성
/*
    angle(Field of View): 시야각. 숫자가 커질수록 그리는 그림의 크기가 작아진다.
    a: 종횡비(가로 세로 비율). 원하는 만큼 가로 세로 비율을 줄 수 있다.
    zMin, zMax: z의 범위 정함. 이 범위를 벗어나면 잘리게 된다.
*/
function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180); //angle*.5
    // Matrix의 가운데 자리는(대각선) Scale이 일어나는 자리이다.
    return [
        0.5 / ang, 0, 0, 0, // 시야각 맞춤
        0, 0.5 * a / ang, 0, 0, // 종횡비 맞춤
        0, 0, -(zMax + zMin) / (zMax - zMin), -1, // -1때문에 왼손 좌표계로 바뀐다.
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0 // 원근법 조절 (P)
    ];
}

// Z-buffer 범위
var proj_matrix = get_projection(30, 1.0, 1, 7.0);
var mov_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// identity Matrix인데, 14번에 -2
var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// translating z

// 카메라를 2만큼 뒤로 뺀다. (V)
view_matrix[14] = view_matrix[14] - 4;

// identity Matrix
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

// r <- m * k
function mulStoreMatrix(r, m, k) {
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

    r[0] = a0;
    r[1] = a1;
    r[2] = a2;
    r[3] = a3;
    r[4] = a4;
    r[5] = a5;
    r[6] = a6;
    r[7] = a7;
    r[8] = a8;
    r[9] = a9;
    r[10] = a10;
    r[11] = a11;
    r[12] = a12;
    r[13] = a13;
    r[14] = a14;
    r[15] = a15;
}

// m <- m * k
function mulMatrix(m, k) {
    mulStoreMatrix(m, m, k);
}

// tx, ty, tz를 통해 이동시키는 것. -> colum Major
function translate(m, tx, ty, tz) {
    var tm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    tm[12] = tx;
    tm[13] = ty;
    tm[14] = tz;
    mulMatrix(m, tm);
}

function scale(m, sx, sy, sz) {
    var tm = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
    mulMatrix(m, tm);
}

// rotation matrix: X축을 기준으로 - Fan
function rotateX(m, angle) {
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    rm[5] = c;
    rm[6] = s;
    rm[9] = -s;
    rm[10] = c;
    mulMatrix(m, rm);
}

// rotation matrix: Y축을 기준으로 - Tilt
function rotateY(m, angle) {
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    rm[0] = c;
    rm[2] = -s;
    rm[8] = s;
    rm[10] = c;
    mulMatrix(m, rm);
}

// rotation matrix: Z축을 기준으로 - Roll
function rotateZ(m, angle) {
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    rm[0] = c;
    rm[1] = s;
    rm[4] = -s;
    rm[5] = c;
    mulMatrix(m, rm);
}

// x, y, z를 제곱해서 square root for 나눗셈
function normalizeVec3(v) {
    sq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    sq = Math.sqrt(sq);
    if (sq < 0.000001) // Too Small
        return -1;
    // vector를 단위벡터 크기로 만듬.
    v[0] /= sq;
    v[1] /= sq;
    v[2] /= sq;
}

// 원하는 축의 각도를 정해서 하기 위함.
function rotateArbAxis(m, angle, axis) {
    var axis_rot = [0, 0, 0];
    var ux, uy, uz;
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var c1 = 1.0 - c;
    var s = Math.sin(angle);
    axis_rot[0] = axis[0];
    axis_rot[1] = axis[1];
    axis_rot[2] = axis[2];
    if (normalizeVec3(axis_rot) == -1)
        return -1;
    ux = axis_rot[0];
    uy = axis_rot[1];
    uz = axis_rot[2];
    // console.log("Log", angle);
    rm[0] = c + ux * ux * c1;
    rm[1] = uy * ux * c1 + uz * s;
    rm[2] = uz * ux * c1 - uy * s;
    rm[3] = 0;

    rm[4] = ux * uy * c1 - uz * s;
    rm[5] = c + uy * uy * c1;
    rm[6] = uz * uy * c1 + ux * s;
    rm[7] = 0;

    rm[8] = ux * uz * c1 + uy * s;
    rm[9] = uy * uz * c1 - ux * s;
    rm[10] = c + uz * uz * c1;
    rm[11] = 0;

    rm[12] = 0;
    rm[13] = 0;
    rm[14] = 0;
    rm[15] = 1;

    mulMatrix(m, rm);
}

rotValue = 0.0;
animRotValue = 0.0;
transX = 0.0;
frames = 1;

// 돌아가는 속도
function animRotate() {
    animRotValue += 0.01;
}

function animPause() {
    animRotValue = 0.0;
}

function trXinc() {
    transX += 0.01;
    document.getElementById("webTrX").innerHTML = "transX : " + transX.toFixed(4);
}

function trXdec() {
    transX -= 0.01;
    document.getElementById("webTrX").innerHTML = "transX : " + transX.toFixed(4);
}

// function clearRot() {
//     animRotValue = 0.0;
//     mov_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
//     console.log(mov_matrix);
//     document.getElementById("matrix0").innerHTML = mov_matrix[0].toFixed(4);
//     document.getElementById("matrix1").innerHTML = mov_matrix[1].toFixed(4);
//     document.getElementById("matrix2").innerHTML = mov_matrix[2].toFixed(4);
//     document.getElementById("matrix3").innerHTML = mov_matrix[3].toFixed(4);
//     document.getElementById("matrix4").innerHTML = mov_matrix[4].toFixed(4);
//     document.getElementById("matrix5").innerHTML = mov_matrix[5].toFixed(4);
//     document.getElementById("matrix6").innerHTML = mov_matrix[6].toFixed(4);
//     document.getElementById("matrix7").innerHTML = mov_matrix[7].toFixed(4);
//     document.getElementById("matrix8").innerHTML = mov_matrix[8].toFixed(4);
//     document.getElementById("matrix9").innerHTML = mov_matrix[9].toFixed(4);
//     document.getElementById("matrix10").innerHTML = mov_matrix[10].toFixed(4);
//     document.getElementById("matrix11").innerHTML = mov_matrix[11].toFixed(4);
//     document.getElementById("matrix12").innerHTML = mov_matrix[12].toFixed(4);
//     document.getElementById("matrix13").innerHTML = mov_matrix[13].toFixed(4);
//     document.getElementById("matrix14").innerHTML = mov_matrix[14].toFixed(4);
//     document.getElementById("matrix15").innerHTML = mov_matrix[15].toFixed(4);
// }

// 화면에 그리는 명령
function renderScene() {

    //console.log("Frame "+frames+"\n");
    frames += 1;
    rotAxis = [1, 1, 0];

    var locPmatrix = gl.getUniformLocation(gl.programObject, "Pmatrix"); // 원근법
    var locVmatrix = gl.getUniformLocation(gl.programObject, "Vmatrix"); // 카메라 뒤로 뺄 때 사용
    var locMmatrix = gl.getUniformLocation(gl.programObject, "Mmatrix"); // 모델 회전

    idMatrix(mov_matrix);
    // rotateX(mov_matrix, rotValue);
    // rotateY(mov_matrix, rotValue);
    // rotateZ(mov_matrix, rotValue);
    rotateArbAxis(mov_matrix, rotValue, rotAxis);
    // console.log("rotValue= ", rotValue);
    rotValue += animRotValue;
    translate(mov_matrix, transX, 0.0, 0.0);

    // MVP 매트릭스를 Uniform으로 보내줌
    gl.uniformMatrix4fv(locPmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(locVmatrix, false, view_matrix);
    gl.uniformMatrix4fv(locMmatrix, false, mov_matrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    // enableVertexAttribArray(attribute의 위치); -> 해당 attribute를 enable 시킨다.
    /*
        그릴게 많아서, 선택적으로 그랠 때 그리는 것을 껐다가 키기 위한 함수.
    */

    // vertexAttribPointer(vertex attribute의 Index(Index), attribute 개수(size), (type), (normalized),
    // 각 vertex의 attribute의 byte 수(stride), 현 attribute의 시작이 어디인지 바이트 단위로(ptr));
    /*
        Index: 0 ~ max - 1
        size: component의 개수 (1 ~ 4)
        type: GL_BYTE(-128 ~ 127), GL_UNSIGNED_BYTE, GL_SHORT(-32768 ~ 32767), GL_UNSIGNED_SHORT, GL_FLOAT, GL_FIXED, GL_HALF_FLOAT_OES (2 Byte), Floating Point (계산 속도가 빨라지고, 메모리 절약)
        normalized: non-floating 숫자는 정규화되어야 하거나, float이 될때 맞춰져야 한다. GPU는 기본적으로 floating point를 사용하는데,
                    이 (-128 ~ 127)를 normalize(-1.0 ~ 1.0) 되거나, floating point로 변환. (0은 0.5)
        Stride: vertex i와 i+1 사이의 차이값.
        ptr: 현 attribute의 시작이 어디인지 바이트 단위로.
    */
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 36, 0); // x, y, z
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 36, 12); // r, g, b, a
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 36, 28); // u, v


    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }
    // DEPTH Test를 사용 -> z-Buffer를 킨다. 이걸 끄면, 순서대로 그리게 된다.
    // 위에서 정한 영역만 보여지게.
    // g Buffer가 50% 투명하다를 기준으로, 그리고 안그리고를 결정하므로, 결과가 이상하게 나타낸다.
    gl.enable(gl.DEPTH_TEST);
    // 카메라부터 거리가 작은 값만, 같으면 나중에 그린것만 그린다. z-Buffer가 Update되면서 가까운것만 그린다.
    gl.depthFunc(gl.LEQUAL);

    // Culling이란, 안그릴 곳을 정해주는 것을 의미한다.
    // Culling을 키면 뒷면 그리는 것을 아예 하지 않는다.
    gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.FRONT);

    // 이미 그려져 있는 것과, 새로 그려질 것들의 관계
    gl.enable(gl.BLEND);
    // Source가 Over되게 그려짐. Dest가 이미 있는거, Source가 그려질것.
    // 위 둘을 섞는 과정이 Blending
    // ONE은 원색만 보여줌.
    // ZERO는 색을 지워버림.
    gl.blendFunc(gl.DST_ALPHA, gl.ZERO);
    // 그 둘을 더함 (ADD, SUBTRACT, REVERSE_SUBTRACT)
    gl.blendEquation(gl.FUNC_ADD);

    // 배경색을 지우고 바꿔라.
    // HTML 배경과, 캔버스 배경, Cube 색에 따라 육면체에 보여지는 색이 달라진다.
    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    // Depth 초기값을 1.0으로 초기화한다. 그릴것을 제외하고 1.0이 된다.
    gl.clearDepth(1.0);
    // clear를 안하면 그려지지 않는다.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    idMatrix(mov_matrix);
    translate(mov_matrix, transX, 0.0, 0.0);
    rotateArbAxis(mov_matrix, rotValue, rotAxis);

    gl.uniformMatrix4fv(locMmatrix, false, mov_matrix);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    function drawSmallCube(m, x, y, z, s, rs, rotCon) {
        translate(m, x, y, z);
        scale(m, s, s, s);
        if (rotCon === 'x')
            rotateX(m, rotValue * rs);
        else if (rotCon === 'y')
            rotateY(m, rotValue * rs);
        else if (rotCon === 'z')
            rotateZ(m, rotValue * rs);
        else
            rotateArbAxis(m, rotValue * rs, rotAxis);
        gl.uniformMatrix4fv(locMmatrix, false, m);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // 작은 큐브 1
    var mov_matrix_child = mov_matrix.slice();
    drawSmallCube(mov_matrix, 0.7, 0.7, 0.7, 0.25, 3.0, 'x');

    // 작은 큐브 2
    mov_matrix = mov_matrix_child.slice();
    drawSmallCube(mov_matrix, -0.7, -0.7, -0.7, 0.35, 3.0, 'y');

    // 작은 큐브 3
    mov_matrix = mov_matrix_child.slice();
    drawSmallCube(mov_matrix, 0.7, -0.7, -0.7, 0.4, 5.0, 'z');

    // 작은 큐브 4
    mov_matrix = mov_matrix_child.slice();
    drawSmallCube(mov_matrix, -0.7, 0.7, -0.7, 0.45, 6.0);

    // 작은 큐브 5
    mov_matrix = mov_matrix_child.slice();
    drawSmallCube(mov_matrix, -0.7, -0.7, 0.7, 0.5, 1.0, 'x');

    // 작은 큐브 6
    mov_matrix = mov_matrix_child.slice();
    drawSmallCube(mov_matrix, 0.7, 0.7, -0.7, 0.55, 2.0, 'y');

    // 작은 큐브 7
    mov_matrix = mov_matrix_child.slice();
    drawSmallCube(mov_matrix, -0.7, 0.7, 0.7, 0.1, 10.0, 'z');

    // 작은 큐브 8
    mov_matrix = mov_matrix_child.slice();
    drawSmallCube(mov_matrix, 0.7, -0.7, 0.7, 0.25, 3.0);

    // gl.drawArrays(그리는 옵션, 시작점의 위치(음수 x), vertex의 개수 (삼각형 개수 * 3))
    /*
        Primitive들을 그릴 때 사용한다.
    */
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
    // document는 이 js 파일을 호출한 html 문서를 뜻한다.
    // helloapicanvas는 html에서 만든 canvas(2d 비트맵) element의 id이다.
    var canvas = document.getElementById("helloapicanvas");
    console.log("Start");

    // GL 초기화
    if (!initialiseGL(canvas)) {
        return;
    }

    // 버퍼 초기화
    if (!initialiseBuffer()) {
        return;
    }

    // 쉐이더 초기화
    if (!initialiseShaders()) {
        return;
    }

    // scene을 그려라. Frame을 초당 60번 그려라
    // renderScene();
    // window.requestAnimationFrame(60);
    // Render loop
    // 같은 그림을 60장씩 계속 그리고 있는 상태이다.
    // 정해진 단위마다 renderScene을 그리고, showpage를 한다.
    requestAnimFrame = (
        function() {
            //	return window.requestAnimationFrame || window.webkitRequestAnimationFrame 
            //	|| window.mozRequestAnimationFrame || 
            return function(callback) {
                // console.log("Callback is"+callback);
                // 두번째 파라미터는 ms당 하나씩 그린다는 것을 의미.
                window.setTimeout(callback, 2, 10);
            };
        })();

    // Render loop에서 계속 call하는 함수. renderLoop에서는 renderScene을 call한다.
    (function renderLoop(param) {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}