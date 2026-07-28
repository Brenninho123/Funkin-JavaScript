export class ChartParser {
  static async parse(songName, section) {
    const csvData = await ChartParser.imageToCSV(
      `assets/data/${songName}/${songName}_section${section}.png`
    );

    const regex = /[ \t]*((\r\n)|\r|\n)[ \t]*/g;
    const lines = csvData.split(regex);
    const rows = lines.filter((line) => line !== "");

    let heightInTiles = rows.length;
    let widthInTiles = 0;
    let row = 0;

    const dopeArray = [];

    while (row < heightInTiles) {
      let rowString = rows[row];
      if (rowString.endsWith(",")) {
        rowString = rowString.substring(0, rowString.length - 1);
      }
      const columns = rowString.split(",");

      if (columns.length === 0) {
        heightInTiles--;
        row++;
        continue;
      }

      if (widthInTiles === 0) {
        widthInTiles = columns.length;
      }

      let column = 0;
      let pushedInColumn = false;

      while (column < widthInTiles) {
        const columnString = columns[column];
        const curTile = parseInt(columnString, 10);

        if (Number.isNaN(curTile)) {
          throw new Error(`String in row ${row}, column ${column} is not a valid integer: "${columnString}"`);
        }

        if (curTile === 1) {
          if (column < 4) {
            dopeArray.push(column + 1);
          } else {
            let tempCol = (column + 1) * -1;
            tempCol += 4;
            dopeArray.push(tempCol);
          }
          pushedInColumn = true;
        }

        column++;
      }

      if (!pushedInColumn) {
        dopeArray.push(0);
      }

      row++;
    }

    return dopeArray;
  }

  static async imageToCSV(imagePath) {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imagePath;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const rows = [];

    for (let y = 0; y < img.height; y++) {
      const cols = [];
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = imageData.data[idx];
        cols.push(r > 0 ? "1" : "0");
      }
      rows.push(cols.join(","));
    }

    return rows.join("\n");
  }
}
