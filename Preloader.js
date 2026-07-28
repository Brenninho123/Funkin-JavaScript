export class Preloader {
  constructor(minDisplayTime = 3) {
    this.minDisplayTime = minDisplayTime;
    this.logo = document.createElement("img");
    this.logo.src = "art/preloaderArt.png";
    this.logo.style.position = "absolute";
  }

  create() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const ratio = this.width / 2560;

    this.logo.onload = () => {
      this.scaleX = ratio;
      this.scaleY = ratio;
      this.applyTransform();
    };

    document.body.appendChild(this.logo);
  }

  applyTransform() {
    const w = this.logo.naturalWidth * this.scaleX;
    const h = this.logo.naturalHeight * this.scaleY;

    this.x = this.width / 2 - w / 2;
    this.y = this.height / 2 - h / 2;

    this.logo.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scaleX}, ${this.scaleY})`;
    this.logo.style.transformOrigin = "top left";
  }

  update(percent) {
    if (percent < 69) {
      this.scaleX += percent / 1920;
      this.scaleY += percent / 1920;
      this.x -= percent * 0.6;
      this.y -= percent / 2;
    } else {
      this.scaleX = this.width / 1280;
      this.scaleY = this.width / 1280;
      this.x = this.width / 2 - (this.logo.naturalWidth * this.scaleX) / 2;
      this.y = this.height / 2 - (this.logo.naturalHeight * this.scaleY) / 2;
    }

    this.applyTransform();
  }

  destroy() {
    this.logo.remove();
  }
}
