import { ASSETS_LIST as assets, ASSETS_DIR as assetsDir } from "@/constants"

function importOne(filePath: string) {
  if (!assets[filePath]) {
    throw new Error(`Asset "${filePath}" must be placed in root directory of ${assetsDir}`)
  }
  return assets[filePath]().then((res) => res.default)
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
