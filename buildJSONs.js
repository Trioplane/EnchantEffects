import * as fs from "jsr:@std/fs"

const MCMETA_REPO = "https://raw.githubusercontent.com/misode/mcmeta/refs/heads/data/";
const PATHS = {
    mc_texture: "encheff:item/overlays/",
    path_texture: "./assets/encheff/textures/item/overlays/",
    mc_model: "encheff:item/overlays/",
    path_model: "./assets/encheff/models/item/overlays/",
    path_item_definition: "./assets/minecraft/items/"
};

const INDENT_SIZE = 4;

class EnchantmentsList {
    constructor(...enchantments) {
        this.enchantments = [...new Set(this.flattenEnchantments(enchantments))];

        for (let i = 0; i < this.enchantments.length; i++) {
            if (!this.enchantments[i].startsWith("minecraft:")) {
                this.enchantments[i] = `minecraft:${this.enchantments[i]}`;
            }
        }
    }

    flattenEnchantments(enchantments) {
        return enchantments.flatMap(enchantment => {
            if (enchantment instanceof EnchantmentsList) {
                return this.flattenEnchantments(enchantment.enchantments);
            }
            if (Array.isArray(enchantment)) {
                return this.flattenEnchantments(enchantment);
            }
            return enchantment;
        });
    }
}

class Format {
    constructor() {
        this.value = {};
    }

    build() {
        return new TextEncoder().encode(JSON.stringify(this.value, "", INDENT_SIZE));
    }
}

class ItemDefinitionFormat extends Format {
    constructor(baseModel) {
        super();
        this.value = {
            model: {
                type: "minecraft:composite",
                models: [
                    {
                        type: "minecraft:model",
                        model: baseModel
                    }
                ]
            }
        };
    }

    addEnchantment(enchantmentsList, itemType) {
        for (const enchant of enchantmentsList.enchantments) {
            this.value.model.models.push({
                type: "minecraft:condition",
                property: "minecraft:component",
                predicate: "minecraft:enchantments",
                value: [{
                    enchantments: enchant,
                    levels: { "min": 1, "max": 255 }
                }],
                on_true: { type: "minecraft:model", model: `${PATHS.mc_model}${itemType}/${enchant.replace("minecraft:", "")}` },
                on_false: { type: "minecraft:empty" }
            });
        }
        return this;
    }
}

class OverlayModelFormat extends Format {
    constructor(name, itemType) {
        super();
        this.value = {
            parent: "minecraft:item/handheld",
            textures: {
                layer0: `${PATHS.mc_texture}${itemType}/${name}`
            }
        };
    }
}

class AnimatedTextureSettingsFormat extends Format {
    constructor(frametime) {
        super();
        this.value = {
            animation: {
                frametime: frametime
            }
        };
    }
}

class ItemDefinitionWriter {
    constructor(itemType, enchantments) {
        this.itemType = itemType;
        this.enchantments = enchantments;
    }

    async write(itemCategory) {
        console.log(`[ItemDefinitionWriter] Writing '${itemCategory}'... 🟡`)
        for (const _item of this.itemType) {
            const item = _item.replace("minecraft:", "");
            const Definition = new ItemDefinitionFormat(`minecraft:item/${item}`)
                .addEnchantment(this.enchantments, itemCategory)
                .build();
            await Deno.writeFile(`${PATHS.path_item_definition}${item}.json`, Definition);
        }
        console.log(`[ItemDefinitionWriter] Finished writing '${itemCategory}' ✅`)
    }
}
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
let mcfuncitonFile = {
    content: "",
    x: 0,
    y: 0
}
async function build() {
    const TAGS = {
        sword: (await (await fetch(`${MCMETA_REPO}data/minecraft/tags/item/swords.json`)).json()).values,
        pickaxe: (await (await fetch(`${MCMETA_REPO}data/minecraft/tags/item/pickaxes.json`)).json()).values,
        axe: (await (await fetch(`${MCMETA_REPO}data/minecraft/tags/item/axes.json`)).json()).values,
        shovel: (await (await fetch(`${MCMETA_REPO}data/minecraft/tags/item/shovels.json`)).json()).values,
        hoe: (await (await fetch(`${MCMETA_REPO}data/minecraft/tags/item/hoes.json`)).json()).values
    };

    for (const category in TAGS) {
        const itemTypes = TAGS[category];
        for (const _enchant of Enchantments[category].enchantments) {
            const enchant = _enchant.replace("minecraft:", "");
            const OverlayModel = new OverlayModelFormat(enchant, category).build();
            const AnimatedTextureSettings = new AnimatedTextureSettingsFormat(2).build();
            await fs.ensureDir(`${PATHS.path_model}${category}/`)
            await fs.ensureDir(`${PATHS.path_texture}${category}/`)
            await Deno.writeFile(`${PATHS.path_model}${category}/${enchant}.json`, OverlayModel);
            await Deno.writeFile(`${PATHS.path_texture}${category}/${enchant}.png.mcmeta`, AnimatedTextureSettings);

            for (const item of itemTypes) {
                mcfuncitonFile.content += `execute align xyz run setblock ~${mcfuncitonFile.x} ~${mcfuncitonFile.y} ~2 minecraft:stripped_oak_wood[axis=x]\n`;
                mcfuncitonFile.content += `execute align xyz run summon minecraft:glow_item_frame ~${mcfuncitonFile.x} ~${mcfuncitonFile.y} ~1 {Facing:2b,Invisible:1b,Item:{id:"${item}",components:{"minecraft:enchantments":{"${_enchant}": 1}}}}\n`;
                mcfuncitonFile.y += 1
                if (mcfuncitonFile.y > 5) {
                    mcfuncitonFile.x -= 1
                    mcfuncitonFile.y = 0;
                }
            }
        }
        
        await new ItemDefinitionWriter(itemTypes, Enchantments[category]).write(category);
    }
    await Deno.writeFile("./summon_tools.mcfunction", new TextEncoder().encode(mcfuncitonFile.content));
}

build();
