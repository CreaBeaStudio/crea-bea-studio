// Maps each level to its Payhip product key.
// Find these in Payhip: open the product, look at the URL --
// e.g. https://payhip.com/b/ean3D  ->  the key is "ean3D"
// Replace the placeholders below once your Payhip products are created.
export const LEVEL_TO_PAYHIP_KEY: Record<string, string> = {
    "15": "REPLACE_WITH_BEGINNER_KEY",     // Beginner
    "24": "REPLACE_WITH_INTERMEDIATE_KEY", // Intermediate
    "36": "REPLACE_WITH_ADVANCED_KEY",     // Advanced
  };
  
  /**
   * Builds a Payhip multi-item checkout URL from a list of levels.
   * e.g. levels = ["15", "15", "24"] -> repeats the Beginner key twice
   * and adds the Intermediate key once.
   * Returns null if any level doesn't have a Payhip key set up yet.
   */
  export function buildPayhipCheckoutUrl(levels: string[]): string | null {
    const keys = levels.map((level) => LEVEL_TO_PAYHIP_KEY[level]).filter(Boolean);
  
    if (keys.length === 0 || keys.length !== levels.length) {
      return null;
    }
  
    const params = keys.map((key) => `cart_links[]=${encodeURIComponent(key)}`).join("&");
    return `https://payhip.com/buy?${params}`;
  }
  