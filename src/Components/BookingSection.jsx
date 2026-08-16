/* =========================================================
   CATEGORY IMAGES
   =========================================================
   Category-specific Unsplash images.
   These are direct images.unsplash.com URLs so they render
   directly without relying on the deprecated Unsplash Source API.
========================================================= */

const CATEGORY_IMAGES = {
  // AC / HVAC
  "AC Repair":
    "https://images.unsplash.com/photo-1631545806609-6e0a6c0d8f3f?auto=format&fit=crop&w=1200&q=85",

  "Air Conditioning":
    "https://images.unsplash.com/photo-1631545806609-6e0a6c0d8f3f?auto=format&fit=crop&w=1200&q=85",

  HVAC:
    "https://images.unsplash.com/photo-1631545806609-6e0a6c0d8f3f?auto=format&fit=crop&w=1200&q=85",

  // Plumbing
  Plumbing:
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=85",

  // Electrical
  Electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",

  // Automotive
  "Car Repair":
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=85",

  Automotive:
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=85",

  Mechanic:
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=85",

  // Painting
  Painting:
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=85",

  // Cleaning
  Cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",

  "Home Cleaning":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",

  // Carpentry
  Carpentry:
    "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=1200&q=85",

  Woodworking:
    "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=1200&q=85",

  // Home repair
  "Home Repair":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85",

  Handyman:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85",

  // Gardening
  Gardening:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85",

  Landscaping:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85",

  // Pest control
  "Pest Control":
    "https://images.unsplash.com/photo-1628151015968-3a7b9a5c9c6e?auto=format&fit=crop&w=1200&q=85",

  // Appliances
  "Appliance Repair":
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85",

  // Electronics
  Electronics:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",

  // Computer
  "Computer Repair":
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=85",

  "Laptop Repair":
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=85",

  // Mobile
  "Mobile Repair":
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=85",

  "Phone Repair":
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=85",

  // Locksmith
  Locksmith:
    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=85",

  // Moving
  Moving:
    "https://images.unsplash.com/photo-1600510349682-d24e6f9c3f1b?auto=format&fit=crop&w=1200&q=85",

  // Car wash
  "Car Wash":
    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=85",

  // Bike
  "Bike Repair":
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=85",

  // Welding
  Welding:
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85",

  // Roofing
  Roofing:
    "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=85",

  // Flooring
  Flooring:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85",

  // Laundry
  Laundry:
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1200&q=85",

  // Beauty
  Beauty:
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=85",

  // Salon
  Salon:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85",
};


/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85";


/* =========================================================
   CATEGORY IMAGE RESOLVER
========================================================= */

const getCategoryImage = (category) => {
  if (!category) {
    return FALLBACK_CATEGORY_IMAGE;
  }

  const normalized = String(category)
    .toLowerCase()
    .trim();

  /* -----------------------------------------
     Exact match
  ----------------------------------------- */

  if (CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category];
  }

  /* -----------------------------------------
     Case-insensitive match
  ----------------------------------------- */

  const exactNormalizedKey =
    Object.keys(CATEGORY_IMAGES).find(
      (key) =>
        key.toLowerCase().trim() === normalized,
    );

  if (exactNormalizedKey) {
    return CATEGORY_IMAGES[exactNormalizedKey];
  }

  /* -----------------------------------------
     AC / HVAC
  ----------------------------------------- */

  if (
    normalized.includes("air condition") ||
    normalized.includes("air-conditioning") ||
    normalized.includes("aircon") ||
    normalized.includes("a/c") ||
    normalized === "ac" ||
    normalized.includes(" ac ") ||
    normalized.includes("hvac") ||
    normalized.includes("cooling") ||
    normalized.includes("cooler")
  ) {
    return CATEGORY_IMAGES["AC Repair"];
  }

  /* -----------------------------------------
     Plumbing
  ----------------------------------------- */

  if (
    normalized.includes("plumb") ||
    normalized.includes("pipe") ||
    normalized.includes("drain") ||
    normalized.includes("water") ||
    normalized.includes("sanitary")
  ) {
    return CATEGORY_IMAGES["Plumbing"];
  }

  /* -----------------------------------------
     Electrical
  ----------------------------------------- */

  if (
    normalized.includes("electric") ||
    normalized.includes("wiring") ||
    normalized.includes("electrician") ||
    normalized.includes("light") ||
    normalized.includes("power")
  ) {
    return CATEGORY_IMAGES["Electrical"];
  }

  /* -----------------------------------------
     Cars / Automotive
  ----------------------------------------- */

  if (
    normalized.includes("car") ||
    normalized.includes("auto") ||
    normalized.includes("vehicle") ||
    normalized.includes("mechanic") ||
    normalized.includes("automotive")
  ) {
    return CATEGORY_IMAGES["Car Repair"];
  }

  /* -----------------------------------------
     Painting
  ----------------------------------------- */

  if (
    normalized.includes("paint") ||
    normalized.includes("wall paint") ||
    normalized.includes("wallpaper") ||
    normalized.includes("decor")
  ) {
    return CATEGORY_IMAGES["Painting"];
  }

  /* -----------------------------------------
     Cleaning
  ----------------------------------------- */

  if (
    normalized.includes("clean") ||
    normalized.includes("maid") ||
    normalized.includes("housekeeping") ||
    normalized.includes("janitor")
  ) {
    return CATEGORY_IMAGES["Cleaning"];
  }

  /* -----------------------------------------
     Carpentry
  ----------------------------------------- */

  if (
    normalized.includes("carpent") ||
    normalized.includes("wood") ||
    normalized.includes("furniture") ||
    normalized.includes("cabinet")
  ) {
    return CATEGORY_IMAGES["Carpentry"];
  }

  /* -----------------------------------------
     Gardening
  ----------------------------------------- */

  if (
    normalized.includes("garden") ||
    normalized.includes("gardener") ||
    normalized.includes("landscap") ||
    normalized.includes("lawn") ||
    normalized.includes("plant")
  ) {
    return CATEGORY_IMAGES["Gardening"];
  }

  /* -----------------------------------------
     Pest Control
  ----------------------------------------- */

  if (
    normalized.includes("pest") ||
    normalized.includes("insect") ||
    normalized.includes("termite") ||
    normalized.includes("mosquito")
  ) {
    return CATEGORY_IMAGES["Pest Control"];
  }

  /* -----------------------------------------
     Appliance Repair
  ----------------------------------------- */

  if (
    normalized.includes("appliance") ||
    normalized.includes("refrigerator") ||
    normalized.includes("fridge") ||
    normalized.includes("washing machine") ||
    normalized.includes("microwave")
  ) {
    return CATEGORY_IMAGES["Appliance Repair"];
  }

  /* -----------------------------------------
     Computer / Laptop
  ----------------------------------------- */

  if (
    normalized.includes("computer") ||
    normalized.includes("laptop") ||
    normalized.includes("pc") ||
    normalized.includes("desktop")
  ) {
    return CATEGORY_IMAGES["Computer Repair"];
  }

  /* -----------------------------------------
     Mobile / Phone
  ----------------------------------------- */

  if (
    normalized.includes("mobile") ||
    normalized.includes("phone") ||
    normalized.includes("smartphone") ||
    normalized.includes("iphone") ||
    normalized.includes("android")
  ) {
    return CATEGORY_IMAGES["Mobile Repair"];
  }

  /* -----------------------------------------
     Electronics
  ----------------------------------------- */

  if (
    normalized.includes("electronic") ||
    normalized.includes("electronics") ||
    normalized.includes("circuit") ||
    normalized.includes("gadget")
  ) {
    return CATEGORY_IMAGES["Electronics"];
  }

  /* -----------------------------------------
     Car Wash
  ----------------------------------------- */

  if (
    normalized.includes("car wash") ||
    normalized.includes("carwash") ||
    normalized.includes("detailing") ||
    normalized.includes("vehicle wash")
  ) {
    return CATEGORY_IMAGES["Car Wash"];
  }

  /* -----------------------------------------
     Bike
  ----------------------------------------- */

  if (
    normalized.includes("bike") ||
    normalized.includes("motorcycle") ||
    normalized.includes("motorbike")
  ) {
    return CATEGORY_IMAGES["Bike Repair"];
  }

  /* -----------------------------------------
     Welding
  ----------------------------------------- */

  if (
    normalized.includes("weld") ||
    normalized.includes("fabrication") ||
    normalized.includes("metal work")
  ) {
    return CATEGORY_IMAGES["Welding"];
  }

  /* -----------------------------------------
     Roofing
  ----------------------------------------- */

  if (
    normalized.includes("roof") ||
    normalized.includes("roofing")
  ) {
    return CATEGORY_IMAGES["Roofing"];
  }

  /* -----------------------------------------
     Flooring
  ----------------------------------------- */

  if (
    normalized.includes("floor") ||
    normalized.includes("flooring") ||
    normalized.includes("tile") ||
    normalized.includes("tiles")
  ) {
    return CATEGORY_IMAGES["Flooring"];
  }

  /* -----------------------------------------
     Laundry
  ----------------------------------------- */

  if (
    normalized.includes("laundry") ||
    normalized.includes("clothes") ||
    normalized.includes("cloth wash") ||
    normalized.includes("dry clean")
  ) {
    return CATEGORY_IMAGES["Laundry"];
  }

  /* -----------------------------------------
     Beauty / Salon
  ----------------------------------------- */

  if (
    normalized.includes("beauty") ||
    normalized.includes("salon") ||
    normalized.includes("hair") ||
    normalized.includes("barber") ||
    normalized.includes("makeup")
  ) {
    return CATEGORY_IMAGES["Beauty"];
  }

  /* -----------------------------------------
     Locksmith
  ----------------------------------------- */

  if (
    normalized.includes("lock") ||
    normalized.includes("locksmith") ||
    normalized.includes("key")
  ) {
    return CATEGORY_IMAGES["Locksmith"];
  }

  /* -----------------------------------------
     Moving
  ----------------------------------------- */

  if (
    normalized.includes("moving") ||
    normalized.includes("mover") ||
    normalized.includes("shifting") ||
    normalized.includes("relocation")
  ) {
    return CATEGORY_IMAGES["Moving"];
  }

  /* -----------------------------------------
     Generic home repair fallback
  ----------------------------------------- */

  if (
    normalized.includes("repair") ||
    normalized.includes("maintenance") ||
    normalized.includes("handyman") ||
    normalized.includes("home")
  ) {
    return CATEGORY_IMAGES["Home Repair"];
  }

  return FALLBACK_CATEGORY_IMAGE;
};
