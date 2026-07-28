import * as PIXI from "pixi.js";

export const WiggleEffectType = {
  DREAMY: 0,
  WAVY: 1,
  HEAT_WAVE_HORIZONTAL: 2,
  HEAT_WAVE_VERTICAL: 3,
  FLAG: 4
};

const fragmentSource = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTime;
uniform int effectType;
uniform float uSpeed;
uniform float uFrequency;
uniform float uWaveAmplitude;

const int EFFECT_TYPE_DREAMY = 0;
const int EFFECT_TYPE_WAVY = 1;
const int EFFECT_TYPE_HEAT_WAVE_HORIZONTAL = 2;
const int EFFECT_TYPE_HEAT_WAVE_VERTICAL = 3;
const int EFFECT_TYPE_FLAG = 4;

vec2 sineWave(vec2 pt) {
  float x = 0.0;
  float y = 0.0;

  if (effectType == EFFECT_TYPE_DREAMY) {
    float offsetX = sin(pt.y * uFrequency + uTime * uSpeed) * uWaveAmplitude;
    pt.x += offsetX;
  } else if (effectType == EFFECT_TYPE_WAVY) {
    float offsetY = sin(pt.x * uFrequency + uTime * uSpeed) * uWaveAmplitude;
    pt.y += offsetY;
  } else if (effectType == EFFECT_TYPE_HEAT_WAVE_HORIZONTAL) {
    x = sin(pt.x * uFrequency + uTime * uSpeed) * uWaveAmplitude;
  } else if (effectType == EFFECT_TYPE_HEAT_WAVE_VERTICAL) {
    y = sin(pt.y * uFrequency + uTime * uSpeed) * uWaveAmplitude;
  } else if (effectType == EFFECT_TYPE_FLAG) {
    y = sin(pt.y * uFrequency + 10.0 * pt.x + uTime * uSpeed) * uWaveAmplitude;
    x = sin(pt.x * uFrequency + 5.0 * pt.y + uTime * uSpeed) * uWaveAmplitude;
  }

  return vec2(pt.x + x, pt.y + y);
}

void main() {
  vec2 uv = sineWave(vTextureCoord);
  gl_FragColor = texture2D(uSampler, uv);
}
`;

export class WiggleShader extends PIXI.Filter {
  constructor() {
    super({
      glProgram: PIXI.GlProgram.from({
        vertex: PIXI.defaultFilterVert,
        fragment: fragmentSource
      }),
      resources: {
        wiggleUniforms: {
          uTime: { value: 0, type: "f32" },
          effectType: { value: 0, type: "i32" },
          uSpeed: { value: 0, type: "f32" },
          uFrequency: { value: 0, type: "f32" },
          uWaveAmplitude: { value: 0, type: "f32" }
        }
      }
    });
  }
}

export class WiggleEffect {
  constructor() {
    this.shader = new WiggleShader();
    this._effectType = WiggleEffectType.DREAMY;
    this._waveSpeed = 0;
    this._waveFrequency = 0;
    this._waveAmplitude = 0;
  }

  get effectType() {
    return this._effectType;
  }

  set effectType(v) {
    this._effectType = v;
    this.shader.resources.wiggleUniforms.uniforms.effectType = v;
  }

  get waveSpeed() {
    return this._waveSpeed;
  }

  set waveSpeed(v) {
    this._waveSpeed = v;
    this.shader.resources.wiggleUniforms.uniforms.uSpeed = v;
  }

  get waveFrequency() {
    return this._waveFrequency;
  }

  set waveFrequency(v) {
    this._waveFrequency = v;
    this.shader.resources.wiggleUniforms.uniforms.uFrequency = v;
  }

  get waveAmplitude() {
    return this._waveAmplitude;
  }

  set waveAmplitude(v) {
    this._waveAmplitude = v;
    this.shader.resources.wiggleUniforms.uniforms.uWaveAmplitude = v;
  }

  update(elapsed) {
    this.shader.resources.wiggleUniforms.uniforms.uTime += elapsed;
  }

  update(elapsed) {
    this.shader.resources.wiggleUniforms.uniforms.uTime += elapsed / 1000;
  }
}
