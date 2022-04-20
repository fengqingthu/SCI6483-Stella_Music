const vertexShader = () => {
  return `
      varying float x;
      varying float y;
      varying float z;
      varying vec3 vUv;

      uniform float u_time;
      uniform float u_amplitude;
      uniform float[64] u_data_arr;

      void main() {
        vUv = position;

        x = abs(position.x);
	      y = abs(position.y);

        float floor_x = round(x);
	      float floor_y = round(y);

        // float x_multiplier = (32.0 - x) / 8.0;
        // float y_multiplier = (32.0 - y) / 8.0;

        float k = sin(u_data_arr[int(floor_x)] / 50.0 + u_data_arr[int(floor_y)] / 50.0) * u_amplitude;
        // x = position.x + normal[0] * k;
        // y = position.y + normal[1] * k;
        // z = position.z + normal[2] * k;

        // gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, k, 1.0);
      }
    `;
};

const fragmentShader = () => {
  return `
    varying float x;
    varying float y;
    varying float z;
    varying vec3 vUv;

    uniform float u_time;
    // uniform vec3 u_black;
    // uniform vec3 u_white;

    void main() {
      // gl_FragColor = vec4((5.0 - abs(x)) / 5.0, (5.0 - abs(y)) / 5.0, (abs(x + y) / 2.0) / 5.0, 1.0);
      gl_FragColor = vec4((30.0 - abs(x)) / 30.0, (30.0 - abs(y)) / 30.0, (abs(x + y) / 2.0) / 30.0, 1.0);
    }
  `;
};

export { vertexShader, fragmentShader };
