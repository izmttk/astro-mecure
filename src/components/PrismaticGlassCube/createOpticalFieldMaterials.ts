import * as THREE from "three";

const fieldVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const fieldFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uHover;
  uniform float uAspect;
  uniform float uCompact;
  uniform vec2 uPointer;

  float gaussianField(vec2 point, vec2 center, vec2 radius) {
    vec2 delta = (point - center) / radius;
    return exp(-dot(delta, delta) * 2.25);
  }

  float contourLine(float distanceValue, float radius, float width) {
    float antiAlias = max(fwidth(distanceValue) * 1.15, 0.00065);
    return 1.0 - smoothstep(width, width + antiAlias, abs(distanceValue - radius));
  }

  void main() {
    vec2 point = (vUv - 0.5) * 2.0;
    point.x *= uAspect;

    vec2 pointer = vec2(uPointer.x * uAspect, uPointer.y);
    vec2 pointerDelta = point - pointer;
    float pointerDistance = max(length(pointerDelta), 0.001);
    float lensStrength = exp(-pointerDistance * pointerDistance * 4.6) * uHover;

    // The contours bend away from the cursor like a weak optical lens. Their
    // centre moves in the opposite direction to the cube for a restrained
    // foreground/background parallax split.
    point += pointerDelta / pointerDistance * lensStrength * 0.07;
    vec2 orbitCenter = -pointer * vec2(0.045, 0.035) * uHover;
    vec2 orbitPoint = point - orbitCenter;
    float angle = atan(orbitPoint.y, orbitPoint.x);
    float ellipticalDistance = length(vec2(orbitPoint.x / 1.58, orbitPoint.y / 0.92));

    // A cursor-localized travelling wave disturbs only the nearby contours.
    // It fades before reaching the logo's opposite side, so the background
    // responds organically without moving as one rigid layer.
    float rippleEnvelope = exp(-pointerDistance * pointerDistance * 4.8) * uHover;
    float pointerRipple = sin(pointerDistance * 31.0 - uTime * 3.2) * 0.018 * rippleEnvelope;
    pointerRipple += sin(pointerDistance * 17.0 + uTime * 1.7) * 0.006 * rippleEnvelope;
    ellipticalDistance += pointerRipple;

    float time = uTime;
    float lineDensity = mix(1.0, 0.78, uCompact);
    vec3 color = vec3(0.0);

    for (int index = 0; index < 12; index++) {
      float layer = float(index);
      float wave = sin(angle * (2.7 + layer * 0.19) + time * (0.055 - layer * 0.0025) + layer * 1.71) * 0.009;
      wave += sin(angle * 5.1 - time * 0.038 + layer * 0.93) * 0.004;
      float radius = 0.30 + layer * 0.088 + sin(layer * 2.19) * 0.006 + wave;
      float line = contourLine(ellipticalDistance, radius, 0.00115 + layer * 0.000035);

      // Broad arc masks keep the curves from reading as a technical HUD.
      float arcWave = sin(angle * (1.25 + layer * 0.12) + layer * 1.43 + time * 0.025);
      float arcMask = 0.16 + 0.84 * smoothstep(-0.18, 0.46, arcWave);
      arcMask *= 0.76 + 0.24 * smoothstep(-0.35, 0.55, cos(angle * 2.0 - layer));

      float cool = pow(max(sin(angle + 1.05 + layer * 0.27), 0.0), 7.0);
      float warm = pow(max(cos(angle - 0.72 - layer * 0.31), 0.0), 9.0);
      vec3 lineColor = vec3(0.58, 0.70, 0.90);
      lineColor = mix(lineColor, vec3(0.12, 0.55, 1.0), cool * 0.72);
      lineColor = mix(lineColor, vec3(1.0, 0.34, 0.08), warm * 0.42);

      float interactionLift = 1.0 + rippleEnvelope * 0.85;
      color += lineColor
        * line
        * arcMask
        * (0.046 - layer * 0.00145)
        * lineDensity
        * interactionLift;
    }

    float hoverLift = mix(0.72, 1.0, uHover);
    vec2 slowMotion = vec2(sin(time * 0.071), cos(time * 0.058));
    float coolCaustic = gaussianField(
      point,
      vec2(-1.12, 0.34) + slowMotion * vec2(0.09, 0.055) - pointer * 0.035 * uHover,
      vec2(0.78, 0.34)
    );
    float warmCaustic = gaussianField(
      point,
      vec2(1.08, -0.38) - slowMotion.yx * vec2(0.085, 0.05) - pointer * 0.028 * uHover,
      vec2(0.72, 0.31)
    );
    color += vec3(0.035, 0.19, 0.62) * coolCaustic * 0.075 * hoverLift;
    color += vec3(0.72, 0.16, 0.025) * warmCaustic * 0.048 * hoverLift;

    // A very soft central lift prevents the cube from feeling pasted onto a
    // flat void while keeping the overwhelming majority of the Hero pure black.
    float centralLift = gaussianField(point, vec2(0.0), vec2(0.92, 0.68));
    color += vec3(0.014, 0.018, 0.027) * centralLift;

    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const dustVertexShader = /* glsl */ `
  precision highp float;

  attribute float aSeed;
  attribute float aSize;
  attribute float aTint;

  varying float vTint;
  varying float vSeed;
  varying float vRepulsion;

  uniform float uTime;
  uniform float uHover;
  uniform float uAspect;
  uniform float uPixelRatio;
  uniform vec2 uPointer;

  void main() {
    float phase = aSeed * 31.4159;
    vec2 point = position.xy;
    point += vec2(
      sin(uTime * (0.075 + aSeed * 0.025) + phase),
      cos(uTime * (0.062 + aSeed * 0.021) + phase * 0.73)
    ) * mix(0.004, 0.013, aSeed);

    point -= uPointer * mix(0.006, 0.017, aSeed) * uHover;

    vec2 delta = point - uPointer;
    vec2 metricDelta = vec2(delta.x * uAspect, delta.y);
    float distanceToPointer = max(length(metricDelta), 0.001);
    float repulsion = smoothstep(0.34, 0.035, distanceToPointer) * uHover;
    vec2 direction = metricDelta / distanceToPointer;
    point += vec2(direction.x / uAspect, direction.y) * repulsion * mix(0.045, 0.078, aSeed);

    vTint = aTint;
    vSeed = aSeed;
    vRepulsion = repulsion;
    gl_Position = vec4(point, 0.25, 1.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + repulsion * 0.38);
  }
`;

const dustFragmentShader = /* glsl */ `
  precision highp float;

  varying float vTint;
  varying float vSeed;
  varying float vRepulsion;

  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5) * 2.0;
    float halo = 1.0 - smoothstep(0.2, 1.0, distanceToCenter);
    float core = 1.0 - smoothstep(0.0, 0.34, distanceToCenter);
    float alpha = (halo * 0.20 + core * 0.66) * mix(0.46, 0.84, vSeed);
    alpha *= 1.0 + vRepulsion * 0.24;

    vec3 neutral = vec3(0.63, 0.70, 0.80);
    vec3 cool = vec3(0.16, 0.62, 1.0);
    vec3 warm = vec3(1.0, 0.38, 0.10);
    vec3 color = mix(neutral, cool, smoothstep(0.78, 0.90, vTint) * 0.78);
    color = mix(color, warm, smoothstep(0.94, 1.0, vTint) * 0.72);

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface OpticalFieldUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uHover: { value: number };
  uAspect: { value: number };
  uCompact: { value: number };
  uPointer: { value: THREE.Vector2 };
}

export interface OpticalDustUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uHover: { value: number };
  uAspect: { value: number };
  uPixelRatio: { value: number };
  uPointer: { value: THREE.Vector2 };
}

export function createOpticalFieldMaterial(compact: boolean) {
  const uniforms: OpticalFieldUniforms = {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uAspect: { value: 1 },
    uCompact: { value: compact ? 1 : 0 },
    uPointer: { value: new THREE.Vector2() },
  };

  return {
    material: new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      fragmentShader: fieldFragmentShader,
      toneMapped: true,
      uniforms,
      vertexShader: fieldVertexShader,
    }),
    uniforms,
  };
}

export function createOpticalDustMaterial() {
  const uniforms: OpticalDustUniforms = {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uAspect: { value: 1 },
    uPixelRatio: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
  };

  return {
    material: new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fragmentShader: dustFragmentShader,
      toneMapped: true,
      transparent: true,
      uniforms,
      vertexShader: dustVertexShader,
    }),
    uniforms,
  };
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function createOpticalDustGeometry(compact: boolean) {
  const count = compact ? 17 : 28;
  const random = seededRandom(0x51a9c3);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const tints = new Float32Array(count);

  for (let index = 0; index < count; index++) {
    let x = 0;
    let y = 0;
    let attempts = 0;

    do {
      x = random() * 1.86 - 0.93;
      y = random() * 1.72 - 0.86;
      attempts++;
    } while (
      attempts < 30 &&
      (x * x) / (0.61 * 0.61) + (y * y) / (0.39 * 0.39) < 1
    );

    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = 0;
    seeds[index] = random();
    sizes[index] = 1.18 + random() * 1.28;
    tints[index] = random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));
  return geometry;
}
