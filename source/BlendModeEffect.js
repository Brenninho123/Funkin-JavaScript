export class BlendModeEffect {
  constructor(shader, color) {
    this.shader = shader;
    this.shader.resources.uBlendColor.uniforms.value = new Float32Array(4);
    this._color = 0;
    this.color = color;
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color = color;

    const r = ((color >> 16) & 0xff) / 255;
    const g = ((color >> 8) & 0xff) / 255;
    const b = (color & 0xff) / 255;
    const a = ((color >> 24) & 0xff) / 255 || 1;

    const value = this.shader.resources.uBlendColor.uniforms.value;
    value[0] = r;
    value[1] = g;
    value[2] = b;
    value[3] = a;
  }
}
