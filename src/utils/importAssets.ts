import urlJoin from "url-join"
import { ASSETS_LIST as assets, ASSETS_DIR as assetsDir } from "@/constants"

function importOne(filePath: string) {
  if (!assets[urlJoin(assetsDir, filePath)]) {
    throw new Error(`All assets must be placed in root directory of ${assetsDir}`)
  }
  return assets[urlJoin(assetsDir, filePath)]().then((res) => res.default)
}

export default function importAssets(filePath: string): Promise<ImageMetadata>;
export default function importAssets(filePath: string[]): Promise<ImageMetadata[]>;
export default function importAssets(filePath: string | string[]) {
  if (Array.isArray(filePath)) {
    return Promise.all(filePath.map(importOne))
  } else {
    return importOne(filePath)
  }
}
