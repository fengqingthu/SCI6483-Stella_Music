const vertexShader = () => {
  return `
      varying vec3 vNormal;
      varying vec3 v_pos;
      varying vec3 v_dir;

      void main() {
        //vPos = position;
        //vNormal =  normal;
        //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        v_dir = position - cameraPosition; // Points from camera to vertex
        v_pos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
};

const fragmentShader = () => {
  return `
  #define RECIPROCAL_PI 0.3183098861837907
  #define RECIPROCAL_PI2 0.15915494309189535
  varying vec3 vNormal;
  varying vec3 v_pos;
  varying vec3 v_dir;

  uniform vec3 colorA;
  uniform vec3 colorB;
  uniform sampler2D u_texture;
  uniform int iterations;
  uniform float depth;
  uniform float smoothing;

  vec2 equirectUv( in vec3 dir ) {
    float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
    float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
    return vec2( u, v );
  }

  vec3 marchMarble(vec3 rayOrigin, vec3 rayDir) {
    float perIteration = 1. / float(iterations);
    vec3 deltaRay = rayDir * perIteration * depth;

    // Start at point of intersection and accumulate volume
    vec3 p = rayOrigin;
    float totalVolume = 0.;

    for (int i=0; i<iterations; ++i) {
      // Read heightmap from current spherical direction
      vec2 uv = equirectUv(normalize(p));
      float heightMapVal = texture(u_texture, uv).r;

      // Take a slice of the heightmap
      float height = length(p); // 1 at surface, 0 at core, assuming radius = 1
      float cutoff = 1. - float(i) * perIteration;
      float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);

      // Accumulate the volume and advance the ray forward one step
      totalVolume += slice * perIteration;
      p += deltaRay;
    }
    return mix(colorA, colorB, totalVolume);
  }

  void main() {
  //vec3 rgb = vNormal * 0.5 + 0.5;
	//gl_FragColor = vec4(rgb, 1.); 
      vec3 rayDir = normalize(v_dir);
      vec3 rayOrigin = v_pos;
      vec3 rgb = marchMarble(rayOrigin, rayDir);
      gl_FragColor = vec4(rgb, 1.);
  }
  `;
};

export { vertexShader, fragmentShader };
