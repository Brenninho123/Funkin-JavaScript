import * as PIXI from "pixi.js";

const fragmentSource = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 uBlendColor;

vec3 blendLighten(vec3 base, vec3 blend) {
  return mix(
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    2.0 * base * blend,
    step(base, vec3(0.5))
  );
}

vec4 blendLighten(vec4 base, vec4 blend, float opacity) {
  return vec4(blendLighten(base.rgb, blend.rgb) * opacity + base.rgb * (1.0 - opacity), base.a);
}

void main() {
  vec4 base = texture2D(uSampler, vTextureCoord);
  gl_FragColor = blendLighten(base, uBlendColor, uBlendColor.a);
}
`;

export class OverlayShader extends PIXI.Filter {
  constructor() {
    super({
      glProgram: PIXI.GlProgram.from({
        vertex: PIXI.defaultFilterVert,
        fragment: fragmentSource
      }),
      resources: {
        uBlendColor: { value: new Float32Array(4), type: "vec4<f32>" }
      }
    });
  }
}
