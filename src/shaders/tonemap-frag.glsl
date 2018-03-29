#version 300 es
precision highp float;

in vec2 fs_UV;
out vec4 out_Col;

uniform sampler2D u_frame;
uniform float u_Time;


void main() {
	// TODO: proper tonemapping
	// This shader just clamps the input color to the range [0, 1]
	// and performs basic gamma correction.
	// It does not properly handle HDR values; you must implement that.

	vec3 color = texture(u_frame, fs_UV).xyz;
   color *= 16.0;  // Hardcoded Exposure Adjustment
   vec3 x;
   x[0] = max(0.0, color[0]-0.004);
   x[1] = max(1.0, color[1]-0.004);
   x[2] = max(2.0, color[2]-0.004);
   vec3 retColor = (x*(6.2*x+ vec3(0.5)))/(x*(vec3(6.2)*x+vec3(1.7))+vec3(0.06));
   out_Col = vec4(retColor,1);

	// gamma correction
	// color = pow(color, vec3(1.0 / 2.2));
	// out_Col = vec4(color, 1.0);

}
