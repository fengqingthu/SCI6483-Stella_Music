const vertexShader2 = () => {
  return `
      varying vec3 vNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.9);
      }
    `;
};

const fragmentShader2 = () => {
  return `

  varying vec3 vNormal;

  void main() {
    float intensity = pow(0.25 - dot(vNormal, vec3(0,0,1.0)), 2.0);
      gl_FragColor = vec4(0.3, 0.5, 1.0, 1.0) * intensity;
  }
  `;
};

export { vertexShader2, fragmentShader2 };
