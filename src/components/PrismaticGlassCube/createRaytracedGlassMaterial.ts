import * as THREE from 'three';

const MAX_BOUNCES = 6;
const MAX_MARCH_STEPS = 52;
const STOCHASTIC_SAMPLES = 32;

const vertexShader = /* glsl */ `
  varying vec3 vLocalPosition;
  varying vec3 vLocalNormal;

  void main() {
    vLocalPosition = position;
    vLocalNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  #define MAX_BOUNCES ${MAX_BOUNCES}
  #define MAX_MARCH_STEPS ${MAX_MARCH_STEPS}
  #define STOCHASTIC_SAMPLES ${STOCHASTIC_SAMPLES}

  varying vec3 vLocalPosition;
  varying vec3 vLocalNormal;

  uniform vec3 uHalfExtents;
  uniform float uRadius;
  uniform vec3 uCameraLocal;
  uniform mat4 uModelMatrix;
  uniform mat3 uNormalMatrix;
  uniform int uBounceCount;
  uniform int uSampleCount;
  uniform float uRoughness;

  const float SURFACE_EPSILON = 0.0014;
  const float RAY_OFFSET = 0.006;
  const float MAX_DISTANCE = 7.0;

  float sdRoundedBox(vec3 point) {
    vec3 q = abs(point) - uHalfExtents + vec3(uRadius);
    return min(max(q.x, max(q.y, q.z)), 0.0)
      + length(max(q, 0.0))
      - uRadius;
  }

  vec3 roundedBoxNormal(vec3 point) {
    vec2 epsilon = vec2(0.0012, 0.0);
    return normalize(vec3(
      sdRoundedBox(point + epsilon.xyy) - sdRoundedBox(point - epsilon.xyy),
      sdRoundedBox(point + epsilon.yxy) - sdRoundedBox(point - epsilon.yxy),
      sdRoundedBox(point + epsilon.yyx) - sdRoundedBox(point - epsilon.yyx)
    ));
  }

  bool traceInside(
    vec3 rayOrigin,
    vec3 rayDirection,
    out vec3 hitPosition,
    out vec3 hitNormal,
    out float hitDistance
  ) {
    float distanceTravelled = RAY_OFFSET * 2.5;
    bool reachedInterior = false;

    for (int step = 0; step < MAX_MARCH_STEPS; step++) {
      vec3 point = rayOrigin + rayDirection * distanceTravelled;
      float distanceToSurface = sdRoundedBox(point);
      reachedInterior = reachedInterior || distanceToSurface < -0.008;

      if (reachedInterior && abs(distanceToSurface) < SURFACE_EPSILON) {
        hitPosition = point;
        hitNormal = roundedBoxNormal(point);
        hitDistance = distanceTravelled;
        return true;
      }

      // Inside a convex SDF, -distance is the distance to the nearest wall.
      // A conservative factor prevents tunnelling through the narrow bevel.
      distanceTravelled += max(abs(distanceToSurface) * 0.72, 0.0025);
      if (distanceTravelled > MAX_DISTANCE) break;
    }

    return false;
  }

  vec3 localToWorldPoint(vec3 point) {
    return (uModelMatrix * vec4(point, 1.0)).xyz;
  }

  vec3 localToWorldDirection(vec3 direction) {
    return normalize(mat3(uModelMatrix) * direction);
  }

  vec3 perturbSurfaceNormal(vec3 surfaceNormal, vec2 slope) {
    vec3 helper = abs(surfaceNormal.z) < 0.92
      ? vec3(0.0, 0.0, 1.0)
      : vec3(0.0, 1.0, 0.0);
    vec3 tangent = normalize(cross(helper, surfaceNormal));
    vec3 bitangent = normalize(cross(surfaceNormal, tangent));
    return normalize(surfaceNormal + tangent * slope.x + bitangent * slope.y);
  }

  float hash12(vec2 point) {
    vec3 p3 = fract(vec3(point.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 randomizedBeckmannSlope(int sampleIndex, vec2 scramble) {
    float sampleCount = max(float(uSampleCount), 1.0);
    float index = float(sampleIndex);

    // Cranley-Patterson scrambling gives every pixel a different, but stable,
    // stratified sequence. Unlike a shared deterministic ring, neighbouring
    // pixels do not reproduce the same coherent RGB light-card silhouette.
    float xi = fract((index + 0.5) / sampleCount + scramble.x);
    float azimuth = fract(index * 0.61803398875 + scramble.y);

    // The Blender material uses the Beckmann refraction distribution. Its
    // Gaussian slope tails produce a softer light-card response than GGX and
    // avoid the long, repeated spectral streaks of the previous sampler.
    float alpha = max(uRoughness * 0.55, 0.001);
    float slopeRadius = alpha * sqrt(-log(max(1.0 - xi, 0.0001)));
    float angle = azimuth * 6.28318530718;
    return vec2(cos(angle), sin(angle)) * slopeRadius;
  }

  float schlick(float cosine, float ior) {
    float f0 = (ior - 1.0) / (ior + 1.0);
    f0 *= f0;
    return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
  }

  float softRectIntersection(
    vec3 rayOrigin,
    vec3 rayDirection,
    vec3 center,
    vec3 normal,
    vec3 axisU,
    vec3 axisV,
    vec2 halfSize,
    float softness
  ) {
    float denominator = dot(rayDirection, normal);
    if (abs(denominator) < 0.0001) return 0.0;

    float distanceToPlane = dot(center - rayOrigin, normal) / denominator;
    if (distanceToPlane <= 0.001) return 0.0;

    vec3 localHit = rayOrigin + rayDirection * distanceToPlane - center;
    vec2 normalizedHit = vec2(
      abs(dot(localHit, axisU)) / max(halfSize.x, 0.001),
      abs(dot(localHit, axisV)) / max(halfSize.y, 0.001)
    );
    float edge = max(normalizedHit.x, normalizedHit.y);
    return 1.0 - smoothstep(1.0 - softness, 1.0 + softness, edge);
  }

  float reflectedStudioLights(vec3 rayOrigin, vec3 rayDirection) {
    // Blender's 100 W horizontal area light at the cube centre. It exists for
    // specular paths only: transmitted exit rays never call this function.
    float centreLight = softRectIntersection(
      rayOrigin,
      rayDirection,
      vec3(0.0),
      vec3(0.0, 1.0, 0.0),
      vec3(1.0, 0.0, 0.0),
      vec3(0.0, 0.0, 1.0),
      vec2(0.6, 0.8),
      0.30
    ) * 1.2;

    // The second 50 W light sits below and to the right, aimed at the cube.
    vec3 lowerRightCenter = vec3(3.2, -2.8, 3.0);
    vec3 lowerRightNormal = normalize(-lowerRightCenter);
    vec3 lowerRightU = normalize(cross(vec3(0.0, 1.0, 0.0), lowerRightNormal));
    vec3 lowerRightV = normalize(cross(lowerRightNormal, lowerRightU));
    float lowerRightLight = softRectIntersection(
      rayOrigin,
      rayDirection,
      lowerRightCenter,
      lowerRightNormal,
      lowerRightU,
      lowerRightV,
      vec2(1.55, 1.28),
      0.26
    ) * 0.6;

    return centreLight + lowerRightLight;
  }

  float neutralEnvironment(vec3 direction) {
    float upperSoftbox = pow(max(direction.y * 0.5 + 0.5, 0.0), 7.0) * 0.052;
    float horizon = exp(-pow(direction.y * 7.0, 2.0)) * 0.018;
    return 0.006 + upperSoftbox + horizon;
  }

  float directAreaHighlight(
    vec3 worldPosition,
    vec3 worldNormal,
    vec3 worldView,
    vec3 lightPosition,
    float intensity
  ) {
    vec3 normal = worldNormal;
    vec3 toLight = normalize(lightPosition - worldPosition);
    float ndotl = max(dot(normal, toLight), 0.0);
    vec3 halfVector = normalize(toLight + worldView);
    float specularPower = mix(96.0, 28.0, clamp(uRoughness, 0.0, 1.0));
    float specular = pow(max(dot(normal, halfVector), 0.0), specularPower);
    return intensity * (specular * 0.046 + ndotl * 0.0014);
  }

  float traceSpectralChannel(float ior, int sampleIndex, vec2 scramble) {
    vec2 roughnessSample = randomizedBeckmannSlope(sampleIndex, scramble);
    vec3 entryPosition = vLocalPosition;
    vec3 entryNormal = perturbSurfaceNormal(normalize(vLocalNormal), roughnessSample);
    vec3 incident = normalize(entryPosition - uCameraLocal);
    vec3 entryReflection = reflect(incident, entryNormal);
    float entryFresnel = schlick(dot(-incident, entryNormal), ior);

    vec3 entryWorld = localToWorldPoint(entryPosition);
    vec3 entryNormalWorld = normalize(uNormalMatrix * entryNormal);
    vec3 viewWorld = normalize(-localToWorldDirection(incident));
    float radiance = entryFresnel * (
      neutralEnvironment(localToWorldDirection(entryReflection))
      + reflectedStudioLights(entryWorld, localToWorldDirection(entryReflection))
      + directAreaHighlight(
        entryWorld,
        entryNormalWorld,
        viewWorld,
        vec3(3.2, -2.8, 3.0),
        1.1
      )
    );

    vec3 insideDirection = refract(incident, entryNormal, 1.0 / ior);
    if (dot(insideDirection, insideDirection) < 0.0001) return radiance;

    vec3 rayOrigin = entryPosition + insideDirection * RAY_OFFSET;
    vec3 rayDirection = normalize(insideDirection);
    float throughput = 1.0 - entryFresnel;

    for (int bounce = 0; bounce < MAX_BOUNCES; bounce++) {
      if (bounce >= uBounceCount || throughput < 0.002) break;

      vec3 hitPosition;
      vec3 hitNormal;
      float hitDistance;
      if (!traceInside(rayOrigin, rayDirection, hitPosition, hitNormal, hitDistance)) break;

      vec2 bounceScramble = fract(
        scramble + vec2(float(bounce + 1) * 0.38196601125, float(bounce + 1) * 0.754877666)
      );
      vec2 bounceSample = randomizedBeckmannSlope(sampleIndex, bounceScramble) * 0.82;
      vec3 interfaceNormal = perturbSurfaceNormal(hitNormal, bounceSample);

      vec3 worldDirection = localToWorldDirection(rayDirection);

      vec3 hitWorld = localToWorldPoint(hitPosition);
      vec3 normalWorld = normalize(uNormalMatrix * interfaceNormal);
      vec3 innerViewWorld = normalize(-worldDirection);
      vec3 reflectedDirection = normalize(reflect(rayDirection, interfaceNormal));
      radiance += throughput * reflectedStudioLights(
        hitWorld,
        localToWorldDirection(reflectedDirection)
      );
      radiance += throughput * directAreaHighlight(
        hitWorld,
        normalWorld,
        innerViewWorld,
        vec3(3.2, -2.8, 3.0),
        0.78
      );

      float exitCosine = abs(dot(rayDirection, interfaceNormal));
      float fresnel = schlick(exitCosine, ior);
      vec3 exitDirection = refract(rayDirection, -interfaceNormal, ior);

      if (dot(exitDirection, exitDirection) > 0.0001) {
        // Lights are absent from this radiance lookup, matching Blender's
        // disabled transmission-ray visibility. Only a faint studio ambience
        // passes straight through the otherwise black scene.
        radiance += throughput
          * (1.0 - fresnel)
          * neutralEnvironment(localToWorldDirection(exitDirection));
        throughput *= fresnel;
      } else {
        // Total internal reflection preserves the path and is where the long,
        // high-energy spectral bands in the reference are formed.
        throughput *= 0.92;
      }

      rayDirection = reflectedDirection;
      rayOrigin = hitPosition + rayDirection * RAY_OFFSET;
    }

    return radiance;
  }

  void main() {
    // The three monochromatic paths reproduce Blender's summed Refraction
    // shaders: the same white lights are traced with three different IORs.
    // Each pixel gets a stable randomized Beckmann sequence. We retain true
    // multi-sampling, but remove the frame-coherent rings that read as repeated
    // RGB stripes when the cube rotates.
    vec2 pixel = floor(gl_FragCoord.xy);
    vec2 scramble = vec2(
      hash12(pixel + vec2(17.0, 43.0)),
      hash12(pixel + vec2(89.0, 131.0))
    );
    vec3 spectral = vec3(0.0);
    float sampleWeight = 0.0;
    for (int sampleIndex = 0; sampleIndex < STOCHASTIC_SAMPLES; sampleIndex++) {
      if (sampleIndex >= uSampleCount) break;
      spectral += vec3(
        traceSpectralChannel(1.40, sampleIndex, scramble),
        traceSpectralChannel(1.45, sampleIndex, scramble),
        traceSpectralChannel(1.50, sampleIndex, scramble)
      );
      sampleWeight += 1.0;
    }
    spectral /= max(sampleWeight, 0.0001);

    float neutral = dot(spectral, vec3(0.2126, 0.7152, 0.0722));
    vec3 chroma = spectral - vec3(neutral);
    vec3 color = max(vec3(neutral * 0.50) + chroma * 2.05, vec3(0.0)) * 0.82;
    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface RaytracedGlassBundle {
  material: THREE.ShaderMaterial;
  uniforms: {
    uHalfExtents: { value: THREE.Vector3 };
    uRadius: { value: number };
    uCameraLocal: { value: THREE.Vector3 };
    uModelMatrix: { value: THREE.Matrix4 };
    uNormalMatrix: { value: THREE.Matrix3 };
    uBounceCount: { value: number };
    uSampleCount: { value: number };
    uRoughness: { value: number };
  };
  dispose: () => void;
}

export function createRaytracedGlassMaterial(
  halfExtents: THREE.Vector3,
  radius: number,
  compact: boolean,
): RaytracedGlassBundle {
  const uniforms = {
    uHalfExtents: { value: halfExtents.clone() },
    uRadius: { value: radius },
    uCameraLocal: { value: new THREE.Vector3() },
    uModelMatrix: { value: new THREE.Matrix4() },
    uNormalMatrix: { value: new THREE.Matrix3() },
    uBounceCount: { value: compact ? 3 : 4 },
    uSampleCount: { value: compact ? 12 : 24 },
    uRoughness: { value: 0.2 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthWrite: true,
    depthTest: true,
    side: THREE.FrontSide,
    transparent: false,
    toneMapped: true,
  });

  return {
    material,
    uniforms,
    dispose: () => material.dispose(),
  };
}
