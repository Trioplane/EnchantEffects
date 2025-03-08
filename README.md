# EnchantEffects
 Adds animated visuals per item type with specific enchants.

> [!WARNING]
> Disclaimer: This is still a **W.I.P**! Using this pack currently in this state will show missing textures on enchantments I haven't animated yet.

## Credits
All enchantment animations are credited to @Trioplane a.k.a the creator of this pack and using them requires crediting on where you are using it.\
All of the code inside the build JS files were written by @Trioplane\
For the malicious people out there, I know this won't help but it's worth a try, PLEASE PLEASE PLEASE ~~don't prove I'm right~~ don't re-upload this and steal credit, I worked hard on this and tried to finish this along with my busy school schedule. Thanks.

## Adding extra enchantments
You can add extra enchantments inside `buildJSONs.js` to be added to the pack by finding these lines at the bottom of the file:
```js
const SharedEnchantments = new EnchantmentsList("mending", "unbreaking", "vanishing_curse")
const WeaponSharedEnchantments = new EnchantmentsList("sharpness", "fire_aspect", "looting", "knockback", "smite", "bane_of_arthropods")
const ToolSharedEnchantments = new EnchantmentsList("efficiency", "fortune", "silk_touch")
const Enchantments = {
    sword: new EnchantmentsList("sweeping_edge", WeaponSharedEnchantments,  SharedEnchantments),
    pickaxe: new EnchantmentsList(ToolSharedEnchantments, SharedEnchantments),
    axe: new EnchantmentsList(ToolSharedEnchantments, WeaponSharedEnchantments, SharedEnchantments),
    shovel: new EnchantmentsList(ToolSharedEnchantments, SharedEnchantments),
    hoe: new EnchantmentsList(ToolSharedEnchantments, SharedEnchantments),
}
```

For example, if you want to add a custom enchantment in the weapon shared enchantments category, simply just append a new string like `"custom_enchantment"` and it will show up on the weapon tools (sword, and axe) when building.\

After that you can make a .gif inside the `raw_textures/<tool>` folder with the correct name and build it.

> [!NOTE]
> Custom namespaces are not supported yet.

## Building the resource pack.

> [!NOTE]
> This is not for using the original pack, this is for people who added extra enchantments.

To build the project, you must have [Deno](https://deno.com/) and [ffmpeg](https://www.ffmpeg.org/) installed on your system.\

Once you have that installed, just run `deno run jsonbuild` to make the `.png.mcmeta` and `.json` files needed for the resource pack (with an additional mcfunction file that summons all tools with the enchantments provided), then run `deno run imgbuild` to turn the gifs you put in the `raw_textures` folder into spritesheets which the game can use.\

Now this step is optional but if you want to share it easily, just zip these files and folders together: `assets`, `pack.mcmeta`, `LICENSE`.\

After all of those, you are now ready to use the pack!