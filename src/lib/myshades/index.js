// const { join } = require("path");
// const { writeFile } = require("fs").promises;
import generateTailwindColorFamily from "./generateTailwindColorFamily";
import tailwindColors3 from "./tailwind3";

const generate = (hex = "#ffffff", referenceColors = tailwindColors3) =>
    generateTailwindColorFamily(hex, referenceColors);

/**
 * @param {Record<string, string>} args
 * @returns {Promise<import("vite").Plugin>}
 */
const myshades = async (args = {}) => {
    let keys = Object.entries(args);

    for (const [key, hex] of keys) {
        const shades = generateTailwindColorFamily(hex, tailwindColors3);

        shades.forEach((shade) => {
            document.documentElement.style.setProperty(`--${key}-${shade.number}`, shade.hexcode);
        });

        // shades.forEach((shade) => {
        //     document.documentElement.style.setProperty(`--on-${key}-${shade.number}`, shade.luminance < 40 ? `var(--${key}-100)` : `var(--${key}-900)`);
        // });
    }
};

export default myshades;
