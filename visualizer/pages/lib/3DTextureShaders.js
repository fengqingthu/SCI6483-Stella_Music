const vertexShader = () => {
  return `
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
};

const fragmentShader = () => {
  return `
    
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  varying vec2 vUv;
  varying vec3 vNormal;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform sampler2D u_texture;
  
  void main() {
    float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);

    vec4 color = vec4(texture2D(u_texture, vUv).xyz, 1.0);
    gl_FragColor = vec4(color);
  }
  `;
};

export { vertexShader, fragmentShader };
