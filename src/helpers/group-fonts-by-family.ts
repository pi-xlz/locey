import { basename, join } from "path";
import fs from "fs";
import { getFileNames } from "../utils/get-file-names";
import { logger } from "../utils/logger";
import { folderExists } from "../utils/exists";
import { moveFile } from "../utils/move-fs-items";
import { Wght, getFontWeight } from "../utils/get-font-meta";

type Font = {
  name: string;
  path: string;
  style: "normal" | "italic";
  weight: Wght;
};

type Family = {
  familyName: string;
  fonts: Font[];
};

export const groupFontsByFamily = (
  fontFiles: string[],
  fontsDirPath: string
) => {
  logger.info("Grouping font files into families...");
  const fontFamilies: Family[] = [];
  getFileNames(fontFiles).forEach((fileName) => {
    let fontFamilyFolderPath = join(fontsDirPath, `/${fileName}`);
    const filesToMove = fontFiles
      .filter((fontFile) => {
        return getFileNames([fontFile])[0] === fileName;
      })
      .map((file) => `${fontsDirPath}/${file}`);
    if (!folderExists(fontFamilyFolderPath)) {
      fontFamilyFolderPath = fs.mkdirSync(fontFamilyFolderPath, {
        recursive: true,
      }) as string;
    }
    moveFile(filesToMove, fontFamilyFolderPath, (err, mvdFilePaths) => {
      if (err) process.exit(1);
      const fonts = mvdFilePaths.map((filePath): Font => {
        return {
          name: basename(filePath),
          path: filePath,
          style: "normal",
          weight: getFontWeight(basename(filePath)),
        };
      });
      const family: Family = {
        familyName: fileName,
        fonts: [...fonts],
      };
      fontFamilies.push(family);
    });
  });
  logger.info("Grouped fonts into families...");
  return fontFamilies;
};