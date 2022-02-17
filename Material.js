import { GLSL3, RawShaderMaterial } from "./third_party/three.module.js";

const vertexShader = `precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform vec3 cameraPosition;

out vec2 vUv;
out vec3 vNormal;
out vec3 vReflect;
out vec3 vRefract;

void main() {
  vUv = uv;
  vNormal = normal;

  vec4 mPosition = modelMatrix * vec4( position, 1.0 );
  vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  vReflect = normalize( reflect( normalize( mPosition.xyz - cameraPosition ), nWorld ) );
  vRefract = normalize( refract( normalize( mPosition.xyz - cameraPosition ), nWorld, 0.9 ) );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const fragmentShader = `precision highp float;

in vec2 vUv;
in vec3 vNormal;
in vec3 vReflect;
in vec3 vRefract;

uniform samplerCube envMap;

out vec4 color;

void main() {
  vec3 n = normalize(vNormal);
  vec4 c1 = texture(envMap, vReflect);
  vec4 c2 = texture(envMap, vRefract);
  color = c1;//vec4(1.,0.,1., 1.);
}`;

const material = new RawShaderMaterial({
  uniforms: { envMap: { value: null } },
  vertexShader,
  fragmentShader,
  glslVersion: GLSL3,
});

export { material };
