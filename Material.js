import {
  GLSL3,
  RawShaderMaterial,
  TextureLoader,
  RepeatWrapping,
} from "./third_party/three.module.js";

const vertexShader = `precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform vec3 cameraPosition;
uniform mat3 normalMatrix;

out vec2 vUv;
out vec3 vNormal;
out vec3 vWNormal;
out vec3 vMNormal;
out vec3 vPosition;
out vec4 vMPosition;
out vec3 vReflect;
out vec3 vRefract;
out mat3 nMat;

void main() {
  vUv = uv;
  vNormal = normal;
  vMNormal = normalMatrix * normal;

  vMPosition = modelMatrix * vec4( position, 1.0 );
  nMat = mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz );
  vWNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const fragmentShader = `precision highp float;

in vec2 vUv;
in vec3 vNormal;
in vec3 vWNormal;
in vec3 vMNormal;
in vec4 vMPosition;
in vec3 vPosition;
in vec3 vReflect;
in vec3 vRefract;
in mat3 nMat;

uniform samplerCube envMap;
uniform sampler2D normalMap;
uniform sampler2D roughnessMap;
uniform vec3 cameraPosition;

out vec4 color;

// "p" point being textured
// "n" surface normal at "p"
// "k" controls the sharpness of the blending in the transitions areas
// "s" texture sampler
vec4 biplanar( sampler2D sam, in vec3 p, in vec3 n, in float k )
{
    // grab coord derivatives for texturing
    vec3 dpdx = dFdx(p);
    vec3 dpdy = dFdy(p);
    n = abs(n);

    // determine major axis (in x; yz are following axis)
    ivec3 ma = (n.x>n.y && n.x>n.z) ? ivec3(0,1,2) :
               (n.y>n.z)            ? ivec3(1,2,0) :
                                      ivec3(2,0,1) ;
    // determine minor axis (in x; yz are following axis)
    ivec3 mi = (n.x<n.y && n.x<n.z) ? ivec3(0,1,2) :
               (n.y<n.z)            ? ivec3(1,2,0) :
                                      ivec3(2,0,1) ;
    // determine median axis (in x;  yz are following axis)
    ivec3 me = ivec3(3) - mi - ma;
    
    // project+fetch
    vec4 x = textureGrad( sam, vec2(   p[ma.y],   p[ma.z]), 
                               vec2(dpdx[ma.y],dpdx[ma.z]), 
                               vec2(dpdy[ma.y],dpdy[ma.z]) );
    vec4 y = textureGrad( sam, vec2(   p[me.y],   p[me.z]), 
                               vec2(dpdx[me.y],dpdx[me.z]),
                               vec2(dpdy[me.y],dpdy[me.z]) );
    
    // blend fac  s
    vec2 w = vec2(n[ma.x],n[me.x]);
    // make local support
    w = clamp( (w-0.5773)/(1.0-0.5773), 0.0, 1.0 );
    // shape transition
    w = pow( w, vec2(k/8.0) );
    // blend and return
    return (x*w.x + y*w.y) / (w.x + w.y);
}

void main() {
  
  vec3 n = normalize( vNormal.xyz );
  vec3 blend_weights = abs( n );
  blend_weights = ( blend_weights - 0.2 ) * 7.;  
  blend_weights = max( blend_weights, 0. );
  blend_weights /= ( blend_weights.x + blend_weights.y + blend_weights.z );

  vec2 texScale = vec2(10.);
  vec2 coord1 = vPosition.yz * texScale;
  vec2 coord2 = vPosition.zx * texScale;
  vec2 coord3 = vPosition.xy * texScale;

  // vec4 col1 = texture( textureMap, coord1 );  
  // vec4 col2 = texture( textureMap, coord2 );  
  // vec4 col3 = texture( textureMap, coord3 ); 

  vec4 roughness1 = texture( roughnessMap, coord1 );  
  vec4 roughness2 = texture( roughnessMap, coord2 );  
  vec4 roughness3 = texture( roughnessMap, coord3 ); 

  vec3 normal1 = texture( normalMap, coord1 ).rgb;  
  vec3 normal2 = texture( normalMap, coord2 ).rgb;  
  vec3 normal3 = texture( normalMap, coord3 ).rgb; 

  // vec4 blended_color = col1 * blend_weights.xxxx +  
  //                       col2 * blend_weights.yyyy +  
  //                       col3 * blend_weights.zzzz; 

  vec4 blendedRoughness = roughness1 * blend_weights.xxxx +  
                          roughness2 * blend_weights.yyyy +  
                          roughness3 * blend_weights.zzzz; 

  vec3 blendedNormal = normal1 * blend_weights.xxx +  
                      normal2 * blend_weights.yyy +  
                      normal3 * blend_weights.zzz;

  vec3 tanX = vec3(  vNormal.x, -vNormal.z,  vNormal.y );
  vec3 tanY = vec3(  vNormal.z,  vNormal.y, -vNormal.x );
  vec3 tanZ = vec3( -vNormal.y,  vNormal.x,  vNormal.z );
  vec3 blended_tangent = tanX * blend_weights.xxx +  
                          tanY * blend_weights.yyy +  
                          tanZ * blend_weights.zzz; 
                          

  float normalScale = .5;
  vec3 normalTex = blendedNormal * 2.0 - 1.0;
  normalTex.xy *= normalScale;
  normalTex.y *= -1.;
  normalTex = normalize( normalTex );
  mat3 tsb = mat3( normalize( blended_tangent ), normalize( cross( vNormal, blended_tangent ) ), normalize( vNormal ) );
  vec3 finalNormal = tsb * normalTex;

  vec3 fn = normalize(nMat * finalNormal);
  vec3 refl = normalize(reflect(normalize(vMPosition.xyz - cameraPosition), fn));
  vec3 refr = normalize(refract(normalize(vMPosition.xyz - cameraPosition), fn, 0.9));

  float r = smoothstep(.2, .5, blendedRoughness.r) * 5.;
  vec4 c1 = texture(envMap, refl, 0.);
  vec4 c2 = texture(envMap, refr, 5.);
  color = mix(c1, c2, blendedRoughness.r);// roughness;//vec4(1.,0.,1., 1.);
}`;

const loader = new TextureLoader();

const roughnessMap = loader.load("./assets/Wavy_Water - Color Map.png");
roughnessMap.repeat.set(1, 1);
roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping;

const normalMap = loader.load("./assets/Wavy_Water - Height (Normal Map).png");
normalMap.repeat.set(1, 1);
normalMap.wrapS = normalMap.wrapT = RepeatWrapping;

const material = new RawShaderMaterial({
  uniforms: {
    envMap: { value: null },
    roughnessMap: { value: roughnessMap },
    normalMap: { value: normalMap },
  },
  vertexShader,
  fragmentShader,
  glslVersion: GLSL3,
});

export { material };
