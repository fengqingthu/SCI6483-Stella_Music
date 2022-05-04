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
  
  // #if HW_PERFORMANCE==0
  #define AA 2
  // #else
  // #define AA 2
  // #endif
  
  varying vec2 vUv;
  varying vec3 vNormal;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform sampler2D u_texture;
  
  float noise( in vec2 x ) {
    vec2 p = floor(8.0*x);
    vec2 f = fract(8.0*x);
    f = f*f*(3.0-2.0*f);
    float a = textureLod(u_texture,(p+vec2(0.5,0.5))/256.0,0.0).x;
    float b = textureLod(u_texture,(p+vec2(1.5,0.5))/256.0,0.0).x;
    float c = textureLod(u_texture,(p+vec2(0.5,1.5))/256.0,0.0).x;
    float d = textureLod(u_texture,(p+vec2(1.5,1.5))/256.0,0.0).x;
    return mix(mix( a, b,f.x), mix( c, d,f.x), f.y);
  }

  const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

  float fbm4( vec2 p ) {
    float f = 0.0;
    f += 0.5000*(-1.0+2.0*noise( p )); p = mtx*p*2.02;
    f += 0.2500*(-1.0+2.0*noise( p )); p = mtx*p*2.03;
    f += 0.1250*(-1.0+2.0*noise( p )); p = mtx*p*2.01;
    f += 0.0625*(-1.0+2.0*noise( p ));
    return f/0.9375;
  }

  float fbm6( vec2 p ) {
    float f = 0.0;
    f += 0.500000*noise( p ); p = mtx*p*2.02;
    f += 0.250000*noise( p ); p = mtx*p*2.03;
    f += 0.125000*noise( p ); p = mtx*p*2.01;
    f += 0.062500*noise( p ); p = mtx*p*2.04;
    f += 0.031250*noise( p ); p = mtx*p*2.01;
    f += 0.015625*noise( p );
    return f/0.96875;
  }

  vec2 fbm4_2( vec2 p ) {
    return vec2( fbm4(p+vec2(1.0)), fbm4(p+vec2(6.2)) );
  }

  vec2 fbm6_2( vec2 p ) {
    return vec2( fbm6(p+vec2(9.2)), fbm6(p+vec2(5.7)) );
  }

  float func( vec2 q, out vec2 o, out vec2 n ) {
    q += 0.05*sin(vec2(0.11,0.13)*u_time + length( q )*4.0); 
    q *= 0.7 + 0.2*cos(0.05*u_time);
    o = 0.5 + 0.5*fbm4_2( q );  
    o += 0.02*sin(vec2(0.11,0.13)*u_time*length( o ));
    n = fbm6_2( 4.0*o );
    vec2 p = q + 2.0*n + 1.0;
    float f = 0.5 + 0.5*fbm4( 2.0*p );
    f = mix( f, f*f*f*3.5, f*abs(n.x) );
    f *= 1.0-0.5*pow( 0.5+0.5*sin(8.0*p.x)*sin(8.0*p.y), 8.0 );
    return f;
  }

  float funcs( in vec2 q ) {
    vec2 t1, t2;
    return func(q,t1,t2);
  }


  void main() {
    // vec2 fragCoord = vec2(gl_FragCoord[0], gl_FragCoord[1]);
    vec2 fragCoord = uv;
    vec3 tot = vec3(0.0);
    #if AA>1
      for( int mi=0; mi<AA; mi++ )
        for( int ni=0; ni<AA; ni++ ) {
          // pixel coordinates
          vec2 of = vec2(float(mi),float(ni)) / float(AA) - 0.5;
          vec2 q = (2.0*(fragCoord+of)-u_resolution.xy)/u_resolution.y;
    #else    
      vec2 q = (2.0*fragCoord-u_resolution.xy)/u_resolution.y;
    #endif

      vec2 o, n;
      float f = func(q, o, n);
      
      vec3 col = vec3(0.2,0.1,0.4);
      col = mix( col, vec3(0.3,0.05,0.05), f );
      col = mix( col, vec3(0.9,0.9,0.9), dot(n,n) );
      col = mix( col, vec3(0.5,0.2,0.2), 0.5*o.y*o.y );
      col = mix( col, vec3(0.0,0.2,0.4), 0.5*smoothstep(1.2,1.3,abs(n.y)+abs(n.x)) );
      col *= f*2.0;

      vec2 ex = vec2( 1.0 / u_resolution.x, 0.0 );
      vec2 ey = vec2( 0.0, 1.0 / u_resolution.y );
      #if AA>1
      ex /= float(AA);
      ey /= float(AA);
      #endif
      vec3 nor = normalize( vec3( funcs(q+ex) - f, ex.x, funcs(q+ey) - f ) );
      
      vec3 lig = normalize( vec3( 0.9, -0.2, -0.4 ) );
      float dif = clamp( 0.3+0.7*dot( nor, lig ), 0.0, 1.0 );

      vec3 bdrf;
      bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);
      bdrf += vec3(0.15,0.10,0.05)*dif;
      bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);
      bdrf += vec3(0.15,0.10,0.05)*dif;

      col *= bdrf;
      col = vec3(1.0)-col;
      col = col*col;
      col *= vec3(1.2,1.25,1.2);
      
      tot += col;
    #if AA>1
    }
    tot /= float(AA*AA);
    #endif

	  vec2 p = fragCoord / u_resolution.xy;
	  tot *= 0.5 + 0.5 * sqrt(16.0*p.x*p.y*(1.0-p.x)*(1.0-p.y));
    
    float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0)*pow(intensity, 1.5);

	  gl_FragColor = vec4(atmosphere + tot, 1.0 );
  }

  // void main() {
  //     gl_FragColor = vec4(fragColor);
  // }
  `;
};

export { vertexShader, fragmentShader };
