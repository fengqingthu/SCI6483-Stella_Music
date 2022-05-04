const vertexShader = () => {
  return `
    varying vec3 vPos;
    void main() {
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;
};

const fragmentShader = () => {
  return `

  varying vec3 vPos;

  uniform sampler2D u_texture;
  uniform float u_time;
  uniform vec2 u_resolution;

  float fbm(vec2 p) {
    // orientation
    mat2 m=mat2(.6,.8,-.6,.8);
    p/=300.;
    float f=.8*texture(u_texture,p).x; p*=m*2.02;
    f+=.25*texture(u_texture,p).x; p*=m*2.03;
    f+=.325*texture(u_texture,p).x; p*=m*2.01;
	  f+=.3625*texture(u_texture,p).x;
    return f/.7375;
  }


void main() {
    float t = u_time*0.01;
    vec2 R = u_resolution.xy;
    vec2 U = gl_FragCoord.xy;
    // to 0.1 with good shape
    vec2 p=(U-R)/(0.2*R.y);
    vec2 q=(U+U-R)/R.y;
    // background
    vec3 c=vec3(.0);
    
    float r=length(q),
          r2=length(p),
          a=atan(p.y,p.x);
          
    if(r<0.8)
    {

        float f=fbm(p*20.0);
        c=mix(c,vec3(.4,.9,.1),f);
        a+=.8*fbm(2. * p) + .1 * fbm(30.*p);
        f=smoothstep(.0,.8,fbm(vec2(6.*r2,20.*a)));
        // contrast
        c=mix(c,vec3(1.1),f);
        // diagnal waves
        f=fbm(vec2(r2*5.,a*10.));
        // color
        c=mix(c,vec3(.5,.3,.1),f);
        f=smoothstep(.95,.0,r);
        c*=f;
        f=smoothstep(.5,.0,length(q-vec2(.3,.4)));
        // highlight
        c+=vec3(.9,.8,.7)*.8*f;
        f=smoothstep(.75,.9,r);
        // boundary
        c=mix(c,vec3(0.1),f);
    } 
    // standard 1.3
    c = pow(c, vec3(1.1));
    
    gl_FragColor.xyz= c;
} 
  `;
};

export { vertexShader, fragmentShader };
