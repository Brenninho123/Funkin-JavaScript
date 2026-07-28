export const AssetPaths = {
  file(name, folder = "") {
    return folder ? `assets/${folder}/${name}` : `assets/${name}`;
  },

  image(name) {
    return `assets/images/${name}.png`;
  },

  sound(name, ext = "mp3") {
    return `assets/sounds/${name}.${ext}`;
  },

  music(name, ext = "mp3") {
    return `assets/music/${name}.${ext}`;
  },

  font(name) {
    return `assets/fonts/${name}`;
  },

  data(name) {
    return `assets/data/${name}`;
  },

  video(name, ext = "mp4") {
    return `assets/videos/${name}.${ext}`;
  }
};
