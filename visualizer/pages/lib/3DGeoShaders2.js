const vertexShader = () => {
  return `
    varying vec3 vPos;
    varying vec2 vUv;
    void main() {
      vPos = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;
};

const fragmentShader = () => {
  return `

  varying vec3 vPos;
  varying vec2 vUv;

  uniform sampler2D u_texture;
  uniform float u_time;
  uniform vec2 u_resolution;

  float fbm(vec2 p) {
    // orientation
    mat2 m=mat2(.2,.4,-.4,.3);
    p/=120.;
    float f=.8*texture(u_texture,p).x; p*=m*2.02;
    f+=.25*texture(u_texture,p).x; p*=m*2.03;
    f+=.325*texture(u_texture,p).x; p*=m*2.01;
	  f+=.3625*texture(u_texture,p).x;
    return f/.7375;
  }


void main() {
    vec3 color = texture(u_texture, vUv).xyz;
    float t = u_time*0.01;
    vec2 R = color.xy;
    vec2 U = vUv;
    // to 0.1 with good shape
    vec2 p = (R-U)/(0.1*R.x);
    vec2 q = 0.01*(U+U-R)/R.y;
    // background
    vec3 c=vec3(.0);
    
    float r=length(q),
          r2=length(p),
          a=atan(p.y,p.x);
          
    
    float f=fbm(p*20.0);
    c=mix(c,vec3(.4,.9,.1),f);
    a+=.8*fbm(2. * p) + .1 * fbm(30.*p);
    f=smoothstep(.0,.8,fbm(vec2(3.*r2,20.*a)));
    // contrast
    c=mix(c,vec3(1.6),f);
    // diagnal waves
    f=fbm(vec2(r2*10.,a*10.));
    // color
    c=mix(c,vec3(.1,.3,.1),f);
    f=smoothstep(.4,.2,r);
    c*=f;
    f=smoothstep(.5,.0,length(q-vec2(.1,.2)));
    // highlight
    c+=vec3(.9,.8,.7)*.6*f;
    f=smoothstep(.75,.9,r);
    // boundary
    c=mix(c,vec3(0.1),f);
    
    // standard 1.3
    c = pow(c, vec3(1.3));
    vec4 diffuseColor = vec4(c, 1.);
    // gl_FragColor.xyz= c;
} 
  `;
};

export { vertexShader, fragmentShader };
