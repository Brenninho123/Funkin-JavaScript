export class Highscore {
  static songScores = new Map();

  static saveScore(song, score = 0, diff = 0) {
    const daSong = Highscore.formatSong(song, diff);

    if (Highscore.songScores.has(daSong)) {
      if (Highscore.songScores.get(daSong) < score) {
        Highscore.setScore(daSong, score);
      }
    } else {
      Highscore.setScore(daSong, score);
    }
  }

  static saveWeekScore(week = 1, score = 0, diff = 0) {
    const daWeek = Highscore.formatSong("week" + week, diff);

    if (Highscore.songScores.has(daWeek)) {
      if (Highscore.songScores.get(daWeek) < score) {
        Highscore.setScore(daWeek, score);
      }
    } else {
      Highscore.setScore(daWeek, score);
    }
  }

  static setScore(song, score) {
    Highscore.songScores.set(song, score);
    localStorage.setItem("songScores", JSON.stringify(Array.from(Highscore.songScores.entries())));
  }

  static formatSong(song, diff) {
    let daSong = song;

    if (diff === 0) {
      daSong += "-easy";
    } else if (diff === 2) {
      daSong += "-hard";
    }

    return daSong;
  }

  static getScore(song, diff) {
    const key = Highscore.formatSong(song, diff);
    if (!Highscore.songScores.has(key)) {
      Highscore.setScore(key, 0);
    }
    return Highscore.songScores.get(key);
  }

  static getWeekScore(week, diff) {
    const key = Highscore.formatSong("week" + week, diff);
    if (!Highscore.songScores.has(key)) {
      Highscore.setScore(key, 0);
    }
    return Highscore.songScores.get(key);
  }

  static load() {
    const saved = localStorage.getItem("songScores");
    if (saved) {
      Highscore.songScores = new Map(JSON.parse(saved));
    }
  }
}
