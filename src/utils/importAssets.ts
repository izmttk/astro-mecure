// import { ASSETS_LIST, ASSETS_DIR, ASSETS_URL_PREFIX } from "@/constants"
// import urlJoin from "url-join"

// function importOne(filePath: string) {
//   if (filePath.startsWith(ASSETS_URL_PREFIX)) {
//     filePath = urlJoin(ASSETS_DIR, filePath.slice(ASSETS_URL_PREFIX.length))
//   }
//   if (!ASSETS_LIST[filePath]) {
//     throw new Error(`Asset "${filePath}" must be placed in root directory of ${ASSETS_DIR}`)
//   }
//   return ASSETS_LIST[filePath]().then((res) => res.default)
// }

// export default function importAssets(filePath: string): Promise<ImageMetadata>;
// export default function importAssets(filePath: string[]): Promise<ImageMetadata[]>;
// export default function importAssets(filePath: string | string[]) {
//   if (Array.isArray(filePath)) {
//     return Promise.all(filePath.map(importOne))
//   } else {
//     return importOne(filePath)
//   }
// }
