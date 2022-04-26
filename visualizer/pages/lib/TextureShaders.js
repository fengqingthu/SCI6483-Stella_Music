const vertexShader = () => {
  return `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0 );
      }
    `;
};

const fragmentShader = () => {
  return `
    
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  varying vec2 vUv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform sampler2D u_texture;
  
  void main() {
      vec4 color = texture2D(u_texture, vUv);
      gl_FragColor = vec4(color);
  }
  `;
};

export { vertexShader, fragmentShader };
