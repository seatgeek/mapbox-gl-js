precision mediump float;

varying vec2 v_extrude;

#ifdef DATA_DRIVEN_COLOR
varying vec4 uv_color;
#else
uniform lowp vec4 uv_color;
#endif

#ifdef DATA_DRIVEN_BLUR
varying float uv_blur;
#else
uniform lowp float uv_blur;
#endif

void main() {
    float t = smoothstep(1.0 - uv_blur, 1.0, length(v_extrude));
    gl_FragColor = uv_color * (1.0 - t);
}
