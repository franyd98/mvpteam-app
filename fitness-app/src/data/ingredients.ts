// Base de datos de ingredientes – valores por 100 g (crudo/seco salvo indicación)
// Fuentes: AESAN, etiquetas Mercadona/Hacendado, FatSecret ES, Heinz

export type IngCategory =
  | "huevo"
  | "carne"
  | "pescado"
  | "fiambre"
  | "lacteo"
  | "suplemento"
  | "pan"
  | "cereal_desayuno"
  | "pasta_arroz"
  | "tuberculo"
  | "legumbre"
  | "grasa"
  | "verdura"
  | "fruta"
  | "bebida"
  | "condimento"
  | "postre";

export type MainSlot = "proteina" | "hidrato" | "grasa" | "extra";

export type Ingredient = {
  id: string;
  name: string;
  kcal: number;
  fat: number;
  carbs: number;
  protein: number;
  category: IngCategory;
  slot: MainSlot;
};

export const INGREDIENTS: Ingredient[] = [
  // ── PROTEÍNAS ─────────────────────────────────────────────────
  // Huevos
  { id: "ING001", name: "Claras de huevo líquidas", kcal: 42,  fat: 0.1,  carbs: 0.3,  protein: 9.0,  category: "huevo",       slot: "proteina" },
  { id: "ING002", name: "Huevo entero",              kcal: 150, fat: 10.5, carbs: 0.6,  protein: 13.0, category: "huevo",       slot: "proteina" },
  // Carnes
  { id: "ING003", name: "Pechuga de pollo",          kcal: 106, fat: 1.2,  carbs: 0.0,  protein: 22.0, category: "carne",       slot: "proteina" },
  { id: "ING004", name: "Pechuga de pavo",           kcal: 103, fat: 1.0,  carbs: 0.0,  protein: 22.5, category: "carne",       slot: "proteina" },
  { id: "ING005", name: "Lomo de cerdo",             kcal: 143, fat: 5.5,  carbs: 0.0,  protein: 22.5, category: "carne",       slot: "proteina" },
  { id: "ING006", name: "Ternera magra picada/filetes", kcal: 155, fat: 7.0, carbs: 0.0, protein: 22.0, category: "carne",      slot: "proteina" },
  { id: "ING011", name: "Carne picada pavo/pollo Hacendado", kcal: 105, fat: 2.5, carbs: 0.0, protein: 20.5, category: "carne", slot: "proteina" },
  { id: "ING012", name: "Hamburguesas pavo/pollo Hacendado", kcal: 115, fat: 4.0, carbs: 2.0, protein: 18.0, category: "carne", slot: "proteina" },
  { id: "ING013", name: "Salchichas de pollo Hacendado",     kcal: 135, fat: 7.0, carbs: 2.5, protein: 16.0, category: "carne", slot: "proteina" },
  { id: "ING014", name: "Salchichas de pavo 3% grasa",       kcal: 95,  fat: 3.0, carbs: 2.0, protein: 15.0, category: "carne", slot: "proteina" },
  // Pescados
  { id: "ING007", name: "Merluza",            kcal: 85,  fat: 1.5, carbs: 0.0, protein: 18.0, category: "pescado", slot: "proteina" },
  { id: "ING008", name: "Lenguado",           kcal: 91,  fat: 2.0, carbs: 0.0, protein: 18.5, category: "pescado", slot: "proteina" },
  { id: "ING009", name: "Lubina",             kcal: 97,  fat: 2.0, carbs: 0.0, protein: 18.5, category: "pescado", slot: "proteina" },
  { id: "ING010", name: "Atún al natural/plancha", kcal: 98, fat: 0.9, carbs: 0.0, protein: 22.5, category: "pescado", slot: "proteina" },
  // Fiambres y curados
  { id: "ING015", name: "Lomo embuchado",              kcal: 190, fat: 9.5,  carbs: 0.0, protein: 26.0, category: "fiambre", slot: "proteina" },
  { id: "ING016", name: "Lomo de pavo curado",         kcal: 105, fat: 2.0,  carbs: 0.5, protein: 22.0, category: "fiambre", slot: "proteina" },
  { id: "ING017", name: "Fiambre pechuga de pavo",     kcal: 95,  fat: 1.0,  carbs: 2.0, protein: 19.5, category: "fiambre", slot: "proteina" },
  { id: "ING018", name: "Jamón serrano (sin grasa)",   kcal: 247, fat: 15.0, carbs: 0.0, protein: 28.0, category: "fiambre", slot: "proteina" },
  // Lácteos
  { id: "ING019", name: "Yogur sin lactosa",           kcal: 55,  fat: 1.5, carbs: 4.5, protein: 5.0,  category: "lacteo", slot: "proteina" },
  { id: "ING020", name: "Yogur proteico",              kcal: 62,  fat: 0.5, carbs: 6.5, protein: 8.5,  category: "lacteo", slot: "proteina" },
  { id: "ING021", name: "Yogur +Proteínas Hacendado",  kcal: 65,  fat: 0.3, carbs: 7.0, protein: 9.5,  category: "lacteo", slot: "proteina" },
  { id: "ING022", name: "Mousse proteico Hacendado",   kcal: 88,  fat: 2.5, carbs: 8.5, protein: 7.5,  category: "lacteo", slot: "proteina" },
  { id: "ING023", name: "Queso fresco desnatado Burgos", kcal: 86, fat: 3.5, carbs: 2.5, protein: 12.0, category: "lacteo", slot: "proteina" },
  { id: "ING024", name: "Queso fresco batido desnatado", kcal: 58, fat: 0.3, carbs: 4.5, protein: 9.5,  category: "lacteo", slot: "proteina" },
  { id: "ING025", name: "Yogur griego ligero natural",  kcal: 60,  fat: 2.0, carbs: 5.0, protein: 6.5,  category: "lacteo", slot: "proteina" },
  // Suplementos
  { id: "ING028b", name: "Proteína ISO (whey isolate)", kcal: 380, fat: 1.5, carbs: 4.5, protein: 84.0, category: "suplemento", slot: "proteina" },

  // ── HIDRATOS ──────────────────────────────────────────────────
  // Pan
  { id: "ING031", name: "Pan de centeno",                    kcal: 258, fat: 1.7, carbs: 49.0, protein: 8.9,  category: "pan", slot: "hidrato" },
  { id: "ING032", name: "Pan de espelta",                    kcal: 248, fat: 2.5, carbs: 44.0, protein: 9.5,  category: "pan", slot: "hidrato" },
  { id: "ING033", name: "Pan tostado 100% integral Mercadona", kcal: 352, fat: 3.5, carbs: 64.0, protein: 11.5, category: "pan", slot: "hidrato" },
  { id: "ING034", name: "Pan integral",                      kcal: 250, fat: 3.0, carbs: 44.0, protein: 9.5,  category: "pan", slot: "hidrato" },
  { id: "ING035", name: "Tortas de arroz",                   kcal: 381, fat: 2.5, carbs: 80.0, protein: 7.5,  category: "pan", slot: "hidrato" },
  { id: "ING036", name: "Tortas de maíz",                    kcal: 375, fat: 3.0, carbs: 78.0, protein: 7.0,  category: "pan", slot: "hidrato" },
  // Cereales de desayuno
  { id: "ING028", name: "Harina / Copos de avena (neutros)", kcal: 375, fat: 7.5, carbs: 58.0, protein: 13.0, category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING029", name: "Copos de avena finos",              kcal: 375, fat: 7.5, carbs: 59.0, protein: 13.0, category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING030", name: "Avena Crunchy sin azúcar",          kcal: 415, fat: 14.0, carbs: 56.0, protein: 12.0, category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING045", name: "Corn Flakes sin azúcar añadido",    kcal: 360, fat: 0.9,  carbs: 80.0, protein: 7.5,  category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING046", name: "Crema de arroz / Papilla cereales", kcal: 365, fat: 1.2,  carbs: 80.0, protein: 7.0,  category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING047", name: "Copos de trigo y arroz integral",   kcal: 356, fat: 1.8,  carbs: 74.0, protein: 9.5,  category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING048", name: "Rice Krispies Kellogg's",           kcal: 384, fat: 0.9,  carbs: 85.0, protein: 7.0,  category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING049", name: "Choco Zero Esgir",                  kcal: 360, fat: 4.0,  carbs: 72.0, protein: 8.0,  category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING050", name: "Cereal Mix 0% azúcares Hacendado",  kcal: 368, fat: 5.0,  carbs: 70.0, protein: 10.0, category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING051", name: "Weetabix 95% trigo integral",       kcal: 340, fat: 2.7,  carbs: 67.0, protein: 12.0, category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING052", name: "Muesli sin azúcares añadidos",      kcal: 370, fat: 8.0,  carbs: 60.0, protein: 9.5,  category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING053", name: "Copos de maíz sin azúcares añadidos", kcal: 360, fat: 0.9, carbs: 80.0, protein: 7.5,  category: "cereal_desayuno", slot: "hidrato" },
  { id: "ING054", name: "Churros congelados (airfryer)",     kcal: 290, fat: 10.0, carbs: 42.0, protein: 5.5,  category: "cereal_desayuno", slot: "hidrato" },
  // Pasta, arroz, otros
  { id: "ING037", name: "Pasta seca (espagueti/macarrón)",   kcal: 356, fat: 1.5, carbs: 72.0, protein: 12.5, category: "pasta_arroz", slot: "hidrato" },
  { id: "ING038", name: "Arroz seco",                        kcal: 357, fat: 0.8, carbs: 78.0, protein: 7.0,  category: "pasta_arroz", slot: "hidrato" },
  { id: "ING039", name: "Arroz tres delicias Hacendado",     kcal: 150, fat: 4.5, carbs: 22.0, protein: 4.0,  category: "pasta_arroz", slot: "hidrato" },
  { id: "ING040", name: "Ñoquis de patata",                  kcal: 168, fat: 1.5, carbs: 34.0, protein: 4.0,  category: "pasta_arroz", slot: "hidrato" },
  { id: "ING041", name: "Quinoa seca",                       kcal: 368, fat: 6.0, carbs: 64.0, protein: 14.0, category: "pasta_arroz", slot: "hidrato" },
  { id: "ING042", name: "Cuscús seco",                       kcal: 357, fat: 0.6, carbs: 72.0, protein: 12.8, category: "pasta_arroz", slot: "hidrato" },
  { id: "ING043", name: "Noodles de arroz",                  kcal: 356, fat: 0.6, carbs: 81.0, protein: 7.0,  category: "pasta_arroz", slot: "hidrato" },
  { id: "ING044", name: "Fajitas (tortillas de trigo)",      kcal: 307, fat: 7.0, carbs: 51.0, protein: 9.0,  category: "pasta_arroz", slot: "hidrato" },
  // Tubérculos
  { id: "ING055", name: "Patata",        kcal: 77,  fat: 0.1, carbs: 17.0, protein: 2.0, category: "tuberculo", slot: "hidrato" },
  { id: "ING056", name: "Boniato rojo",  kcal: 86,  fat: 0.1, carbs: 20.0, protein: 1.6, category: "tuberculo", slot: "hidrato" },
  // Legumbres
  { id: "ING104", name: "Legumbre cocida de bote (garb./lentejas/alubias)", kcal: 97,  fat: 1.5, carbs: 13.0, protein: 6.7, category: "legumbre", slot: "hidrato" },
  { id: "ING105", name: "Guisantes congelados",        kcal: 72,  fat: 0.4, carbs: 11.5, protein: 5.0, category: "legumbre", slot: "hidrato" },
  { id: "ING106", name: "Alubias con tomate Heinz",    kcal: 73,  fat: 0.3, carbs: 12.5, protein: 5.0, category: "legumbre", slot: "hidrato" },

  // ── GRASAS ────────────────────────────────────────────────────
  { id: "ING057", name: "Aceite de oliva virgen extra", kcal: 884, fat: 100.0, carbs: 0.0, protein: 0.0, category: "grasa", slot: "grasa" },
  { id: "ING058", name: "Aceite de coco",               kcal: 892, fat: 99.1,  carbs: 0.0, protein: 0.0, category: "grasa", slot: "grasa" },
  { id: "ING059", name: "Aguacate",                     kcal: 160, fat: 14.7,  carbs: 8.5, protein: 2.0, category: "grasa", slot: "grasa" },
  { id: "ING060", name: "Guacamole 95% aguacate",       kcal: 155, fat: 13.5,  carbs: 7.5, protein: 2.0, category: "grasa", slot: "grasa" },
  { id: "ING061", name: "Chocolate negro 85% cacao",    kcal: 580, fat: 45.0,  carbs: 20.0, protein: 12.0, category: "grasa", slot: "grasa" },

  // ── VERDURAS ─────────────────────────────────────────────────
  { id: "ING076", name: "Brócoli",                   kcal: 34,  fat: 0.4, carbs: 7.0,  protein: 2.8, category: "verdura", slot: "extra" },
  { id: "ING077", name: "Alcachofa",                 kcal: 47,  fat: 0.2, carbs: 10.5, protein: 3.3, category: "verdura", slot: "extra" },
  { id: "ING078", name: "Espárrago verde",           kcal: 23,  fat: 0.2, carbs: 3.7,  protein: 2.2, category: "verdura", slot: "extra" },
  { id: "ING079", name: "Espárrago blanco conserva", kcal: 20,  fat: 0.5, carbs: 2.0,  protein: 2.0, category: "verdura", slot: "extra" },
  { id: "ING080", name: "Judía verde",               kcal: 28,  fat: 0.1, carbs: 4.8,  protein: 2.0, category: "verdura", slot: "extra" },
  { id: "ING081", name: "Cebolla",                   kcal: 40,  fat: 0.1, carbs: 8.6,  protein: 1.3, category: "verdura", slot: "extra" },
  { id: "ING082", name: "Champiñones",               kcal: 22,  fat: 0.3, carbs: 3.3,  protein: 3.1, category: "verdura", slot: "extra" },
  { id: "ING083", name: "Pimiento rojo",             kcal: 31,  fat: 0.3, carbs: 6.0,  protein: 1.0, category: "verdura", slot: "extra" },
  { id: "ING084", name: "Pimiento verde",            kcal: 20,  fat: 0.2, carbs: 3.0,  protein: 0.9, category: "verdura", slot: "extra" },
  { id: "ING085", name: "Berenjena",                 kcal: 25,  fat: 0.2, carbs: 5.7,  protein: 1.0, category: "verdura", slot: "extra" },
  { id: "ING086", name: "Coliflor",                  kcal: 25,  fat: 0.3, carbs: 5.0,  protein: 1.9, category: "verdura", slot: "extra" },
  { id: "ING087", name: "Zanahoria",                 kcal: 35,  fat: 0.2, carbs: 7.5,  protein: 0.9, category: "verdura", slot: "extra" },
  { id: "ING088", name: "Lechuga romana",            kcal: 16,  fat: 0.2, carbs: 2.0,  protein: 1.0, category: "verdura", slot: "extra" },
  { id: "ING089", name: "Tomate natural",            kcal: 18,  fat: 0.2, carbs: 3.0,  protein: 0.9, category: "verdura", slot: "extra" },
  { id: "ING090", name: "Pepino",                    kcal: 15,  fat: 0.1, carbs: 2.9,  protein: 0.7, category: "verdura", slot: "extra" },
  { id: "ING091", name: "Remolacha en conserva",     kcal: 45,  fat: 0.1, carbs: 10.0, protein: 1.5, category: "verdura", slot: "extra" },
  { id: "ING092", name: "Maíz dulce en conserva",    kcal: 90,  fat: 1.5, carbs: 17.0, protein: 2.7, category: "verdura", slot: "extra" },
  { id: "ING093", name: "Pepinillos en vinagre",     kcal: 12,  fat: 0.1, carbs: 2.2,  protein: 0.6, category: "verdura", slot: "extra" },
  { id: "ING094", name: "Espinacas",                 kcal: 23,  fat: 0.4, carbs: 1.4,  protein: 2.9, category: "verdura", slot: "extra" },
  { id: "ING095", name: "Ajo",                       kcal: 149, fat: 0.5, carbs: 33.0, protein: 3.4, category: "verdura", slot: "extra" },
  { id: "ING096", name: "Acelgas",                   kcal: 19,  fat: 0.2, carbs: 2.0,  protein: 1.8, category: "verdura", slot: "extra" },
  { id: "ING097", name: "Cebolleta / pimiento vinagre", kcal: 14, fat: 0.1, carbs: 2.5, protein: 0.7, category: "verdura", slot: "extra" },

  // ── FRUTAS ───────────────────────────────────────────────────
  { id: "ING098", name: "Fruta genérica (manzana/naranja/pera…)", kcal: 52, fat: 0.2, carbs: 12.0, protein: 0.3, category: "fruta", slot: "extra" },
  { id: "ING099", name: "Fresas",                  kcal: 33,  fat: 0.3, carbs: 7.7,  protein: 0.7, category: "fruta", slot: "extra" },
  { id: "ING100", name: "Frambuesas",              kcal: 43,  fat: 0.5, carbs: 9.5,  protein: 1.4, category: "fruta", slot: "extra" },
  { id: "ING101", name: "Arándanos congelados",    kcal: 57,  fat: 0.3, carbs: 14.5, protein: 0.7, category: "fruta", slot: "extra" },
  { id: "ING102", name: "Frutos rojos congelados (mix)", kcal: 45, fat: 0.3, carbs: 10.0, protein: 1.0, category: "fruta", slot: "extra" },
  { id: "ING103", name: "Plátano",                 kcal: 89,  fat: 0.3, carbs: 20.0, protein: 1.1, category: "fruta", slot: "extra" },

  // ── BEBIDAS Y LECHES ──────────────────────────────────────────
  { id: "ING026", name: "Leche vegetal sin azúcares", kcal: 30,  fat: 1.0, carbs: 2.5, protein: 1.0, category: "bebida", slot: "extra" },
  { id: "ING027", name: "Leche de almendra sin azúcar", kcal: 24, fat: 1.5, carbs: 0.5, protein: 0.5, category: "bebida", slot: "extra" },

  // ── CONDIMENTOS ───────────────────────────────────────────────
  { id: "ING062", name: "Mermelada sin azúcares añadidos", kcal: 35, fat: 0.1, carbs: 8.0,  protein: 0.4, category: "condimento", slot: "extra" },
  { id: "ING063", name: "Ketchup Zero Heinz",      kcal: 22,  fat: 0.1, carbs: 4.5,  protein: 0.7, category: "condimento", slot: "extra" },
  { id: "ING064", name: "Salsa barbacoa Zero",      kcal: 30,  fat: 0.1, carbs: 6.5,  protein: 0.5, category: "condimento", slot: "extra" },
  { id: "ING065", name: "Salsa de soja sin azúcares", kcal: 60, fat: 0.1, carbs: 6.0,  protein: 6.0, category: "condimento", slot: "extra" },
  { id: "ING066", name: "Tomate triturado/tamizado", kcal: 27,  fat: 0.2, carbs: 5.0,  protein: 1.2, category: "condimento", slot: "extra" },
  { id: "ING067", name: "Salsa de tomate frito",    kcal: 76,  fat: 4.0, carbs: 8.5,  protein: 1.5, category: "condimento", slot: "extra" },
  { id: "ING068", name: "Vinagre de manzana",       kcal: 22,  fat: 0.0, carbs: 0.9,  protein: 0.0, category: "condimento", slot: "extra" },
  { id: "ING069", name: "Vinagre de Módena sin azúcares", kcal: 18, fat: 0.0, carbs: 2.5, protein: 0.5, category: "condimento", slot: "extra" },
  { id: "ING070", name: "Canela en polvo",          kcal: 247, fat: 1.2, carbs: 55.0, protein: 4.0, category: "condimento", slot: "extra" },
  { id: "ING071", name: "Edulcorante líquido",      kcal: 0,   fat: 0.0, carbs: 0.0,  protein: 0.0, category: "condimento", slot: "extra" },
  { id: "ING072", name: "Levadura en polvo",        kcal: 53,  fat: 0.0, carbs: 11.0, protein: 2.5, category: "condimento", slot: "extra" },
  { id: "ING074", name: "Jengibre fresco",          kcal: 80,  fat: 0.8, carbs: 17.0, protein: 1.8, category: "condimento", slot: "extra" },

  // ── POSTRES ───────────────────────────────────────────────────
  { id: "ING075", name: "Gelatina sin azúcares añadidos", kcal: 5, fat: 0.0, carbs: 0.2, protein: 0.7, category: "postre", slot: "extra" },
];

// ── Helpers de cálculo ────────────────────────────────────────────
export type MacroResult = { kcal: number; protein: number; carbs: number; fat: number };

export const calcMacros = (ingId: string, grams: number): MacroResult => {
  const ing = INGREDIENTS.find(i => i.id === ingId);
  if (!ing || !grams) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const f = grams / 100;
  return {
    kcal:    Math.round(ing.kcal    * f * 10) / 10,
    protein: Math.round(ing.protein * f * 10) / 10,
    carbs:   Math.round(ing.carbs   * f * 10) / 10,
    fat:     Math.round(ing.fat     * f * 10) / 10,
  };
};

export const sumMacros = (items: MacroResult[]): MacroResult =>
  items.reduce(
    (acc, m) => ({
      kcal:    Math.round((acc.kcal    + m.kcal)    * 10) / 10,
      protein: Math.round((acc.protein + m.protein) * 10) / 10,
      carbs:   Math.round((acc.carbs   + m.carbs)   * 10) / 10,
      fat:     Math.round((acc.fat     + m.fat)     * 10) / 10,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

// Categorías agrupadas para los selects
export const CATEGORY_LABELS: Record<IngCategory, string> = {
  huevo:           "Huevos",
  carne:           "Carnes y aves",
  pescado:         "Pescados",
  fiambre:         "Fiambres y curados",
  lacteo:          "Lácteos",
  suplemento:      "Suplementos",
  pan:             "Pan y tortas",
  cereal_desayuno: "Cereales de desayuno",
  pasta_arroz:     "Pasta, arroz y otros",
  tuberculo:       "Tubérculos",
  legumbre:        "Legumbres",
  grasa:           "Grasas",
  verdura:         "Verduras",
  fruta:           "Frutas",
  bebida:          "Bebidas y leches",
  condimento:      "Condimentos y salsas",
  postre:          "Postres",
};

export const bySlot = (slot: "proteina" | "hidrato" | "grasa" | "extra") =>
  INGREDIENTS.filter(i => i.slot === slot);
