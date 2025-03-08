import { ensureDir } from "https://deno.land/std@0.181.0/fs/mod.ts";
import gifFrames from "npm:gif-frames";

const PATHS = {
  raw_textures: "./raw_textures",
  textures: "./assets/encheff/textures/item/overlays",
};

async function gifToSpritesheet(gifPath,outputDir) {
  const frames = await gifFrames({ url: gifPath, frames: 'all' })
  const ffmpegCommand = new Deno.Command("ffmpeg", {
    args: [
      "-y",
      "-skip_frame",
      "nokey",
      "-i",
      gifPath,
      "-vf",
      `tile=1x${frames.length}`,
      "-an",
      "-vsync",
      "0",
      outputDir
    ]
  })
  await ffmpegCommand.output();
  console.log(`✅ Converted '${gifPath}' into a spritesheet`)
}

for await (const dirEntry of Deno.readDir(PATHS.raw_textures)) {
  if (!dirEntry.isDirectory) continue
  ensureDir(`${PATHS.textures}/${dirEntry.name}`)

  for await (const file of Deno.readDir(`${PATHS.raw_textures}/${dirEntry.name}`)) {
    if (!file.isFile) continue
    if (!file.name.endsWith(".gif")) continue
    gifToSpritesheet(`${PATHS.raw_textures}/${dirEntry.name}/${file.name}`,`${PATHS.textures}/${dirEntry.name}/${file.name.replace('.gif','.png')}`)
  }
}
// ffmpeg -skip_frame nokey -i ./raw_textures/sword/sweeping_edge.gif -vf 'tile=1x19' -an -vsync 0 out.png