#version 300 es
precision highp float;

in vec2 fs_UV;
out vec4 out_Col;

uniform sampler2D u_frame;
uniform float u_Time;
uniform vec2 u_Dimensions;


// Apply bloom effect
void main() {
	float threshold = 0.2;  // luminance threshold

	vec3 col = vec3(texture(u_frame, fs_UV));
	float gray = 0.21 * col.x + 0.72 * col.y + 0.07 * col.z;
	if (gray > threshold) {
		out_Col = texture(u_frame, fs_UV);
	} else {
		out_Col = vec4(0.0);
	}

}
