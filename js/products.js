/**
 * BEIT WURUD — Store Configuration, Flower Products & Café Menu Data
 *
 * CONFIGURATION INSTRUCTIONS:
 * 1. Set `whatsappNumber` below to the shop's WhatsApp phone number in international format
 *    (digits only, no '+' or spaces, e.g., "96170123456").
 * 2. Update the flower product `name` and `price` fields below when final product titles
 *    and prices are confirmed (set `price` to a number like `45.00` or keep `null` for "Price on Request").
 */

window.BEIT_WURUD_CONFIG = {
  // Replace with Beit Wurud's official WhatsApp number (international format, digits only, e.g. "961XXXXXXXX")
  whatsappNumber: "",
  instagramHandle: "@beit.wurud",
  instagramUrl: "https://www.instagram.com/beit.wurud",
  customDesignPrefillMessage:
    "Hello Beit Wurud! I would like to request a custom flower design. Could you please help me?"
};

/**
 * Official Flower Products (Strictly using the two provided product photographs).
 * Note: Names are marked as editable placeholders (`isPlaceholderName: true`) and
 * prices default to `null` ("Price on Request") until configured.
 */
window.BEIT_WURUD_PRODUCTS = [
  {
    id: "bw-bouquet-1",
    name: "Signature Red Rose & Gypsophila Bouquet",
    isPlaceholderName: true,
    category: "bouquets",
    categoryLabel: "Flower Bouquets",
    price: null, // Set to a number (e.g. 55.0) if a fixed price is desired; null displays "Price on Request"
    image: "assets/images/flower-1.jpeg",
    alt: "Handcrafted bouquet of deep red roses and delicate white baby's breath wrapped in cream and gold-trimmed paper with a burgundy satin bow",
    description:
      "Deep crimson roses paired with delicate white gypsophila, wrapped in cream and gold-bordered paper and finished with a rich burgundy satin ribbon and lace bow."
  },
  {
    id: "bw-bouquet-2",
    name: "Serene Blue Hydrangea & White Rose Bouquet",
    isPlaceholderName: true,
    category: "bouquets",
    categoryLabel: "Flower Bouquets",
    price: null, // Set to a number (e.g. 60.0) if a fixed price is desired; null displays "Price on Request"
    image: "assets/images/flower-2.jpeg",
    alt: "Lush bouquet of soft white roses, sky-blue hydrangeas, baby's breath, and fresh eucalyptus leaves wrapped in layered blue paper",
    description:
      "Creamy white roses and sky-blue hydrangeas accented with fresh eucalyptus foliage and baby's breath, wrapped in layered sky-blue artisan paper."
  }
];
