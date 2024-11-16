import generateTailwindColorFamily from "./generateTailwindColorFamily";
import tailwindColors3 from "./tailwind3";
import chroma from "chroma-js";

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

        //Create darkened shades
        shades.forEach((shade) => {
            document.documentElement.style.setProperty(`--${key}-${shade.number}-darkened`, chroma(shade.hexcode).set('luminosity', 'dark').hex());
        });
    }
};

export default myshades;
