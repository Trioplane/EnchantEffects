import { ensureDir } from "https://deno.land/std@0.181.0/fs/mod.ts";
import gifFrames from "npm:gif-frames";

const PATHS = {
  raw_textures: "./raw_textures",
  textures: "./assets/encheff/textures/item/overlays",
};

async function copyDirectories(copyDir,pasteDir) {
  for await (const dirEntry of Deno.readDir(copyDir)) {
    if (!dirEntry.isDirectory) continue
    ensureDir(`${pasteDir}/${dirEntry.name}`)
  }
}

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
  const { stdout, stderr } = await ffmpegCommand.output();
  console.warn(new TextDecoder().decode(stdout));
  console.error(new TextDecoder().decode(stderr));
  console.log('wahr??')
}

gifToSpritesheet(`${PATHS.raw_textures}/sword/sweeping_edge.gif`,`${PATHS.textures}/sword/sweeping_edge.png`)
// ffmpeg -skip_frame nokey -i ./raw_textures/sword/sweeping_edge.gif -vf 'tile=1x19' -an -vsync 0 out.png