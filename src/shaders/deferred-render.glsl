#version 300 es
precision highp float;

#define EPS 0.0001
#define PI 3.1415962

in vec2 fs_UV;
out vec4 out_Col;

uniform sampler2D u_gb0;
uniform sampler2D u_gb1;
uniform sampler2D u_gb2;

uniform float u_Time;
uniform vec2 u_Dimensions;

uniform mat4 u_View;
uniform vec4 u_CamPos;   

float fovy = 45.0 * 3.1415962 / 180.0;

vec3 lightPos = vec3(5, 5, 5); 
//-----------------------
float length2(vec2 p){
    return dot(p,p);
}

float noise(vec2 p){
	return fract(sin(fract(sin(p.x) * (2000.13311)) + p.y) * 1000.0011);
}

float worley(vec2 p) {
	float d = 1e30;
	for (int x = -5; x <= 5; ++x) {
		for (int y = -5; y <= 5; ++y) {
			vec2 tp = floor(p) + vec2(x, y);
			d = min(d, length2(p - tp - noise(tp)));
		}
	}
	return 10.0*exp(-20.0*abs(2.5*d - 1.0));
}

float fworley(vec2 p) {
	return sqrt(sqrt(sqrt(
		worley(p*5.0 + 0.05* u_Time) *
		sqrt(worley(p * 50.0 + 0.12 + -0.1*u_Time)) *
		sqrt(sqrt(worley(p * -10.0 + 0.03*u_Time))))));
}

//-----------------------


void main() { 
	vec4 isBG = texture(u_gb1, fs_UV);
	if (isBG.x == 1.0) {
		// lambert shading
		out_Col = vec4(1.0, 0.0, 0.0, 1.0);

		vec4 nor_depth = texture(u_gb0, fs_UV);
		vec3 nor = vec3(nor_depth.xyz);
		float depth = nor_depth[3];

		vec2 ndc = fs_UV * 2.0 - 1.0;
		vec3 eye = vec3(u_CamPos.xyz);
		float alpha = fovy /  2.0;
		float aspect = 1.0;

		vec3 look = vec3(0.0, 0.0, 1.0);  
		vec3 up = vec3(0.0, 1.0, 0.0);
		vec3 right = vec3(1.0, 0.0, 0.0);

		vec3 ref = eye + depth * look;
		float len = length(ref - eye);

		vec3 V = up * len * tan(alpha);
		vec3 H = right * len * aspect * tan(alpha);

		vec3 pos = ref + ndc.x * H + ndc.y * V;

		vec3 fs_LightVec = lightPos - pos;

		vec4 diffuseColor = texture(u_gb2, fs_UV);
		float diffuseTerm = dot(normalize(nor), normalize(fs_LightVec));
		float ambientTerm = 0.2;
		float lightIntensity = diffuseTerm + ambientTerm;
		out_Col = vec4(diffuseColor.rgb * lightIntensity * 3.0, diffuseColor.a);
		
	} else {
		// procedural background
		//============reference: https://www.shadertoy.com/view/llS3RK===================
		out_Col = vec4(1.0, 0.0, 0.0, 1.0);

        vec2 uv = vec2(gl_FragCoord.x / u_Dimensions.x, gl_FragCoord.y / u_Dimensions.y);
        out_Col = vec4(uv, 0.0, 1.0);
        float t = fworley(uv * u_Dimensions.xy / 1500.0);
        t *= exp(-length2(abs(0.7 * uv - 1.0)));	
        out_Col = vec4(t * vec3(0.1, 1.1 * t, pow(t, 1.0 - t)), 1.0);
		
	}

	


}





