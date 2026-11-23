const parseAccepted = (value) => {
  const baseParts = value.split("/").map((p) => p.trim());
  const variants = new Set(baseParts);

  baseParts.forEach((part) => {
    if (part.includes("-")) {
      variants.add(part.replace(/-/g, " "));
    }
  });

  if (baseParts.length > 1) {
    variants.add(baseParts.join("/"));
    variants.add(baseParts.join(" / "));
  }

  return variants.size > 1 ? Array.from(variants) : undefined;
};

// Formato: [español, emoji, archivo_sin_extension, inglés, categoría]
const RAW_FAMILY = [
  // ===== NIVEL 1: FAMILIA NUCLEAR (1–12) =====
  ["Madre / Mamá", "👩", "mother", "mother / mom", "Familia nuclear"],
  ["Padre / Papá", "👨", "father", "father / dad", "Familia nuclear"],
  ["Padres", "👫", "parents", "parents", "Familia nuclear"],
  ["Hermano", "👦", "brother", "brother", "Familia nuclear"],
  ["Hermana", "👧", "sister", "sister", "Familia nuclear"],
  ["Hijo", "👦", "son", "son", "Familia nuclear"],
  ["Hija", "👧", "daughter", "daughter", "Familia nuclear"],
  ["Bebé", "👶", "baby", "baby", "Familia nuclear"],
  ["Hijos / Niños", "🧒", "children", "children / kids", "Familia nuclear"],
  ["Esposo / Marido", "🤵", "husband", "husband", "Familia nuclear"],
  ["Esposa", "👰", "wife", "wife", "Familia nuclear"],
  ["Familia", "👨‍👩‍👧‍👦", "family", "family", "Familia nuclear"],

  // ===== NIVEL 2: ABUELOS Y FAMILIA EXTENDIDA (13–24) =====
  ["Abuela", "👵", "grandmother", "grandmother / grandma", "Familia extendida"],
  ["Abuelo", "👴", "grandfather", "grandfather / grandpa", "Familia extendida"],
  ["Abuelos", "👴👵", "grandparents", "grandparents", "Familia extendida"],
  ["Tío", "🧔", "uncle", "uncle", "Familia extendida"],
  ["Tía", "👩", "aunt", "aunt", "Familia extendida"],
  ["Primo / Prima", "🧑", "cousin", "cousin", "Familia extendida"],
  ["Sobrino", "👦", "nephew", "nephew", "Familia extendida"],
  ["Sobrina", "👧", "niece", "niece", "Familia extendida"],
  ["Nieto", "👦", "grandson", "grandson", "Familia extendida"],
  ["Nieta", "👧", "granddaughter", "granddaughter", "Familia extendida"],
  ["Nietos", "👧👦", "grandchildren", "grandchildren", "Familia extendida"],
  ["Hermanos (en general)", "🧑‍🤝‍🧑", "siblings", "siblings", "Familia extendida"],

  // ===== NIVEL 3: PAREJA Y GENERACIONES (25–34) =====
  ["Novio", "💑", "boyfriend", "boyfriend", "Pareja"],
  ["Novia", "💑", "girlfriend", "girlfriend", "Pareja"],
  ["Prometido / Prometida", "💍", "fiance", "fiance / fiancee", "Pareja"],
  ["Pareja", "❤️", "partner", "partner / couple", "Pareja"],
  ["Gemelo / Mellizo", "👯", "twin", "twin", "Familia"],
  ["Hijo único", "🧒", "only-child", "only child", "Familia"],
  ["Bisabuela", "👵", "great-grandmother", "great-grandmother", "Generaciones"],
  ["Bisabuelo", "👴", "great-grandfather", "great-grandfather", "Generaciones"],
  ["Bisnieto", "👦", "great-grandson", "great-grandson", "Generaciones"],
  ["Bisnieta", "👧", "great-granddaughter", "great-granddaughter", "Generaciones"],

  // ===== NIVEL 4: FAMILIA POLÍTICA (35–42) =====
  ["Suegra", "👩", "mother-in-law", "mother-in-law", "Familia política"],
  ["Suegro", "👨", "father-in-law", "father-in-law", "Familia política"],
  ["Suegros", "👫", "parents-in-law", "parents-in-law / in-laws", "Familia política"],
  ["Cuñado", "👨", "brother-in-law", "brother-in-law", "Familia política"],
  ["Cuñada", "👩", "sister-in-law", "sister-in-law", "Familia política"],
  ["Yerno", "🤵", "son-in-law", "son-in-law", "Familia política"],
  ["Nuera", "👰", "daughter-in-law", "daughter-in-law", "Familia política"],
  ["Parientes / Familiares", "🏡", "relatives", "relatives", "Familia extendida"],

  // ===== NIVEL 5: FAMILIA ENSAMBLADA Y PADRINOS (43–54) =====
  ["Madrastra", "👩", "stepmother", "stepmother", "Familia ensamblada"],
  ["Padrastro", "👨", "stepfather", "stepfather", "Familia ensamblada"],
  ["Hermanastro", "👦", "stepbrother", "stepbrother", "Familia ensamblada"],
  ["Hermanastra", "👧", "stepsister", "stepsister", "Familia ensamblada"],
  ["Hijastro", "👦", "stepson", "stepson", "Familia ensamblada"],
  ["Hijastra", "👧", "stepdaughter", "stepdaughter", "Familia ensamblada"],
  ["Medio hermano", "👦", "half-brother", "half-brother", "Familia ensamblada"],
  ["Media hermana", "👧", "half-sister", "half-sister", "Familia ensamblada"],
  ["Padrino", "🎩", "godfather", "godfather", "Padrinos"],
  ["Madrina", "💐", "godmother", "godmother", "Padrinos"],
  ["Ahijado", "👦", "godson", "godson", "Padrinos"],
  ["Ahijada", "👧", "goddaughter", "goddaughter", "Padrinos"],
];

export const FAMILY = RAW_FAMILY.map(
  ([spanish, emoji, slug, english, category], index) => ({
    id: index + 1,
    spanish,
    emoji,
    image: `/images/family/${slug}.webp`,
    english,
    englishAccepted: parseAccepted(english),
    category,
  })
);