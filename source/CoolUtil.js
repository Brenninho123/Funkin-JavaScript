export class CoolUtil {
  static async coolTextFile(path) {
    const response = await fetch(path);
    const text = await response.text();

    return text
      .trim()
      .split("\n")
      .map((line) => line.trim());
  }

  static numberArray(max, min = 0) {
    const dumbArray = [];
    for (let i = min; i < max; i++) {
      dumbArray.push(i);
    }
    return dumbArray;
  }
}
