precision highp float;

uniform mat4 u_matrix;
uniform mat4 u_exmatrix;

attribute vec2 a_pos;

varying vec2 v_extrude;


#ifdef DATA_DRIVEN_SIZE
attribute mediump float a_size;
#else
uniform mediump float u_size;
#endif

#ifdef DATA_DRIVEN_COLOR
attribute lowp vec4 a_color;
varying vec4 uv_color;
#endif

#ifdef DATA_DRIVEN_BLUR
attribute lowp float uv_blur;
varying float uv_blur;
#endif

void main(void) {

#ifdef DATA_DRIVEN_SIZE
    mediump float u_size = a_size;
#endif

    // unencode the extrusion vector that we snuck into the a_pos vector
    v_extrude = vec2(mod(a_pos, 2.0) * 2.0 - 1.0);

    vec4 extrude = u_exmatrix * vec4(v_extrude * ua_size, 0, 0);
    // multiply a_pos by 0.5, since we had it * 2 in order to sneak
    // in extrusion data
    gl_Position = u_matrix * vec4(floor(a_pos * 0.5), 0, 1);

    // gl_Position is divided by gl_Position.w after this shader runs.
    // Multiply the extrude by it so that it isn't affected by it.
    gl_Position += extrude * gl_Position.w;

#ifdef DATA_DRIVEN_COLOR
    varying uv_color = a_color / 255.0;
#endif

#ifdef DATA_DRIVEN_BLUR
    varying uv_blur = a_blur / 255.0;
#endif
}
