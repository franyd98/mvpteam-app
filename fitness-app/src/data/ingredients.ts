// ──────────────────────────────────────────────────────────────────
// ingredients.ts  –  Base de datos de alimentos
// Fuente: Excel "Dieta para Fran" (entrenador)
// Todos los valores son por 100 g de producto
// ──────────────────────────────────────────────────────────────────

export type IngredientCategory =
  | "lean_protein"    // Proteínas magras
  | "fatty_protein"   // Proteínas grasas
  | "veggie_protein"  // Proteínas vegetales
  | "protein_carb"    // Hidratos proteicos (legumbres, avena, quinoa…)
  | "clean_carb"      // Hidratos limpios (arroz, pasta, patata…)
  | "fatty_carb"      // Hidratos grasos (pan integral, fajitas…)
  | "fruit"           // Fruta
  | "fat"             // Grasas y frutos secos
  | "veggie_fat";     // Verduras con grasa (gazpacho, crema)

// Alias para compatibilidad con código antiguo
export type IngCategory = IngredientCategory;

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  lean_protein:   "Proteína Magra",
  fatty_protein:  "Proteína Grasa",
  veggie_protein: "Proteína Vegetal",
  protein_carb:   "Hidrato Proteico",
  clean_carb:     "Hidrato Limpio",
  fatty_carb:     "Hidrato Graso",
  fruit:          "Fruta",
  fat:            "Grasa / Fruto Seco",
  veggie_fat:     "Verdura Grasa",
};

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  kcal: number;    // por 100 g
  protein: number; // g por 100 g
  carbs: number;   // g por 100 g
  fat: number;     // g por 100 g
}

export const ingredients: Ingredient[] = [

  // ── PROTEÍNAS MAGRAS ─────────────────────────────────────────────
  { id: "iso",             name: "Proteína ISO",                                   category: "lean_protein",   kcal: 379,   protein: 90,    carbs: 2.1,  fat: 1.2  },
  { id: "whey",            name: "Proteína Whey",                                  category: "lean_protein",   kcal: 386,   protein: 75,    carbs: 8.4,  fat: 5.6  },
  { id: "yogur_prot",      name: "Yogur Proteico (Hacendado)",                     category: "lean_protein",   kcal: 52,    protein: 10,    carbs: 3.1,  fat: 0.5  },
  { id: "qso_batido",      name: "Queso Fresco Batido Desnatado",                  category: "lean_protein",   kcal: 46,    protein: 8,     carbs: 3.5,  fat: 0.1  },
  { id: "leche_prot",      name: "Leche +Proteínas (Hacendado)",                   category: "lean_protein",   kcal: 46,    protein: 7.6,   carbs: 2.2,  fat: 0.6  },
  { id: "qso_eatlean",     name: "Queso Proteico EATLEAN",                         category: "lean_protein",   kcal: 169,   protein: 37,    carbs: 0.5,  fat: 3.0  },
  { id: "qso_fresco",      name: "Queso Fresco Desnatado (Burgos)",                category: "lean_protein",   kcal: 68,    protein: 12.3,  carbs: 4.4,  fat: 0.2  },
  { id: "clara",           name: "Clara de Huevo",                                 category: "lean_protein",   kcal: 50,    protein: 11,    carbs: 0.5,  fat: 0.1  },
  { id: "pollo",           name: "Pechuga de Pollo",                               category: "lean_protein",   kcal: 107,   protein: 23,    carbs: 0.1,  fat: 1.6  },
  { id: "pavo",            name: "Pechuga de Pavo",                                category: "lean_protein",   kcal: 103,   protein: 24,    carbs: 0,    fat: 0.9  },
  { id: "fiambre_pavo",    name: "Fiambre de Pechuga de Pavo",                     category: "lean_protein",   kcal: 76,    protein: 16.5,  carbs: 0.5,  fat: 1.3  },
  { id: "salchi_pavo_ff",  name: "Salchichas de Pavo Frankfurt (Hacendado)",       category: "lean_protein",   kcal: 92.5,  protein: 13.1,  carbs: 2.3,  fat: 3.0  },
  { id: "lomo_cerdo",      name: "Lomo de Cerdo",                                  category: "lean_protein",   kcal: 117,   protein: 18,    carbs: 0,    fat: 5.0  },
  { id: "atun_lata",       name: "Atún en Lata al Natural",                        category: "lean_protein",   kcal: 89,    protein: 18,    carbs: 0.5,  fat: 0.7  },
  { id: "merluza",         name: "Merluza",                                        category: "lean_protein",   kcal: 82,    protein: 18,    carbs: 0.5,  fat: 1.2  },
  { id: "tilapia",         name: "Tilapia Congelada",                              category: "lean_protein",   kcal: 96,    protein: 20,    carbs: 0,    fat: 1.7  },
  { id: "lenguado",        name: "Lenguado",                                       category: "lean_protein",   kcal: 91,    protein: 18.8,  carbs: 1.0,  fat: 1.2  },
  { id: "lubina",          name: "Lubina",                                         category: "lean_protein",   kcal: 148,   protein: 20.73, carbs: 0,    fat: 7.9  },
  { id: "lomo_atun",       name: "Lomo de Atún (plancha)",                         category: "lean_protein",   kcal: 89,    protein: 20,    carbs: 1.3,  fat: 0.6  },
  { id: "sepia",           name: "Sepia",                                          category: "lean_protein",   kcal: 78,    protein: 18,    carbs: 0.6,  fat: 0.5  },
  { id: "calamar",         name: "Calamar",                                        category: "lean_protein",   kcal: 78,    protein: 16,    carbs: 0,    fat: 1.6  },
  { id: "gambas",          name: "Gambas",                                         category: "lean_protein",   kcal: 77,    protein: 16.4,  carbs: 0.7,  fat: 0.94 },

  // ── PROTEÍNAS GRASAS ─────────────────────────────────────────────
  { id: "mozza_light",     name: "Mozzarella Light (en agua)",                     category: "fatty_protein",  kcal: 153,   protein: 17,    carbs: 1.0,  fat: 9.0  },
  { id: "qso_pizza",       name: "Queso Pizza Light Arla",                         category: "fatty_protein",  kcal: 241,   protein: 31,    carbs: 1.4,  fat: 12.0 },
  { id: "havarti",         name: "Queso Havarti Light",                            category: "fatty_protein",  kcal: 252,   protein: 27,    carbs: 2.2,  fat: 15.0 },
  { id: "lomo_embuchado",  name: "Lomo Embuchado de Cerdo",                        category: "fatty_protein",  kcal: 199,   protein: 38,    carbs: 0.5,  fat: 5.0  },
  { id: "lomo_curado_pavo",name: "Lomo Curado de Pavo",                            category: "fatty_protein",  kcal: 215,   protein: 40,    carbs: 0.7,  fat: 5.8  },
  { id: "jamon",           name: "Jamón Serrano (sin grasa visible)",              category: "fatty_protein",  kcal: 232,   protein: 31,    carbs: 0,    fat: 12.0 },
  { id: "ternera",         name: "Cadera de Ternera Magra",                        category: "fatty_protein",  kcal: 122,   protein: 23,    carbs: 2.2,  fat: 3.5  },
  { id: "picada_pollo",    name: "Carne Picada Pavo/Pollo (Hacendado)",            category: "fatty_protein",  kcal: 137,   protein: 19,    carbs: 1.0,  fat: 6.0  },
  { id: "hamburguesa",     name: "Hamburguesa Pavo/Pollo (Hacendado)",             category: "fatty_protein",  kcal: 129,   protein: 18.4,  carbs: 2.6,  fat: 5.0  },
  { id: "salchi_pollo",    name: "Salchichas de Pollo Embutido (Hacendado)",       category: "fatty_protein",  kcal: 136,   protein: 18,    carbs: 2.5,  fat: 6.0  },
  { id: "huevo",           name: "Huevo Entero",                                   category: "fatty_protein",  kcal: 191,   protein: 12.7,  carbs: 1.0,  fat: 9.7  },
  { id: "salmon",          name: "Salmón",                                         category: "fatty_protein",  kcal: 224,   protein: 20,    carbs: 0,    fat: 16.0 },
  { id: "trucha",          name: "Trucha",                                         category: "fatty_protein",  kcal: 174,   protein: 21,    carbs: 0,    fat: 10.0 },

  // ── PROTEÍNAS VEGETALES ───────────────────────────────────────────
  { id: "tofu",            name: "Tofu",                                           category: "veggie_protein", kcal: 110,   protein: 11.1,  carbs: 0.9,  fat: 6.9  },
  { id: "heura",           name: "Heura",                                          category: "veggie_protein", kcal: 136,   protein: 19.7,  carbs: 1.8,  fat: 3.0  },
  { id: "soja_tex",        name: "Soja Texturizada",                               category: "veggie_protein", kcal: 326,   protein: 51,    carbs: 20,   fat: 1.3  },
  { id: "edamame",         name: "Edamame",                                        category: "veggie_protein", kcal: 130,   protein: 11,    carbs: 10,   fat: 4.0  },
  { id: "seitan",          name: "Seitán",                                         category: "veggie_protein", kcal: 123.5, protein: 24,    carbs: 3.5,  fat: 1.5  },
  { id: "yogur_soja",      name: "Yogur de Soja Sin Azúcar",                       category: "veggie_protein", kcal: 56,    protein: 5,     carbs: 4.5,  fat: 2.0  },
  { id: "vegan_prozis",    name: "Vegan Prozis",                                   category: "veggie_protein", kcal: 380,   protein: 70,    carbs: 13,   fat: 6.8  },

  // ── HIDRATOS PROTEICOS ────────────────────────────────────────────
  { id: "garbanzo",        name: "Garbanzos (conserva)",                           category: "protein_carb",   kcal: 95,    protein: 5.7,   carbs: 11,   fat: 1.9  },
  { id: "alubia_blanca",   name: "Alubia Blanca (conserva)",                       category: "protein_carb",   kcal: 112,   protein: 5.8,   carbs: 10.7, fat: 0.5  },
  { id: "lenteja",         name: "Lenteja (conserva)",                             category: "protein_carb",   kcal: 81,    protein: 5.7,   carbs: 11.2, fat: 0.4  },
  { id: "alubia_tomate",   name: "Alubias con Salsa de Tomate Heinz",              category: "protein_carb",   kcal: 79,    protein: 4.7,   carbs: 12.9, fat: 0.2  },
  { id: "helices_lenteja", name: "Hélices 100% Lenteja Roja (Hacendado)",          category: "protein_carb",   kcal: 334,   protein: 26,    carbs: 50,   fat: 1.7  },
  { id: "quinoa",          name: "Quinoa",                                         category: "protein_carb",   kcal: 389,   protein: 14,    carbs: 66,   fat: 6.1  },
  { id: "avena_copos",     name: "Copos de Avena",                                 category: "protein_carb",   kcal: 375,   protein: 14,    carbs: 59,   fat: 7.0  },
  { id: "harina_avena",    name: "Harina de Avena",                                category: "protein_carb",   kcal: 391,   protein: 14,    carbs: 53,   fat: 11.0 },
  { id: "avena_crunchy",   name: "Avena Crunchy (Hacendado)",                      category: "protein_carb",   kcal: 390,   protein: 13,    carbs: 66,   fat: 5.8  },
  { id: "tortas_legumbre", name: "Tortas de Legumbres (Hacendado)",                category: "protein_carb",   kcal: 366,   protein: 25,    carbs: 55,   fat: 3.1  },
  { id: "pan_fibra",       name: "Pan de Fibra y Sésamo (Hacendado)",              category: "protein_carb",   kcal: 391,   protein: 13,    carbs: 60,   fat: 7.6  },
  { id: "pan_wasa",        name: "Pan Wasa Fibra",                                 category: "protein_carb",   kcal: 339,   protein: 12.5,  carbs: 42,   fat: 13.0 },

  // ── HIDRATOS LIMPIOS ──────────────────────────────────────────────
  { id: "pasta",           name: "Pasta",                                          category: "clean_carb",     kcal: 354,   protein: 11,    carbs: 72,   fat: 1.2  },
  { id: "pasta_integral",  name: "Pasta Integral",                                 category: "clean_carb",     kcal: 346,   protein: 12,    carbs: 66,   fat: 2.0  },
  { id: "arroz",           name: "Arroz Blanco",                                   category: "clean_carb",     kcal: 347,   protein: 6.7,   carbs: 77,   fat: 1.1  },
  { id: "arroz_int",       name: "Arroz Integral",                                 category: "clean_carb",     kcal: 338,   protein: 8,     carbs: 72,   fat: 2.0  },
  { id: "patata",          name: "Patata",                                         category: "clean_carb",     kcal: 78,    protein: 2.86,  carbs: 17.2, fat: 0.1  },
  { id: "patata_bote",     name: "Patata en Conserva (bote)",                      category: "clean_carb",     kcal: 57,    protein: 1.2,   carbs: 12,   fat: 0.5  },
  { id: "boniato",         name: "Boniato Naranja",                                category: "clean_carb",     kcal: 107,   protein: 1.61,  carbs: 24,   fat: 0.1  },
  { id: "noquis",          name: "Ñoquis de Patata",                               category: "clean_carb",     kcal: 174,   protein: 4.5,   carbs: 37.6, fat: 0.4  },
  { id: "pan_blanco",      name: "Pan Blanco de Panadería",                        category: "clean_carb",     kcal: 261,   protein: 8.5,   carbs: 51.5, fat: 1.6  },
  { id: "pan_integral_pan",name: "Pan Integral de Panadería",                      category: "clean_carb",     kcal: 234,   protein: 7,     carbs: 45,   fat: 2.9  },
  { id: "noodles_arroz",   name: "Noodles de Arroz",                               category: "clean_carb",     kcal: 343,   protein: 6.4,   carbs: 77,   fat: 0.6  },
  { id: "cuscus",          name: "Cuscús",                                         category: "clean_carb",     kcal: 346,   protein: 12,    carbs: 69,   fat: 1.6  },
  { id: "arroz_3del",      name: "Arroz Tres Delicias Congelado",                  category: "clean_carb",     kcal: 109,   protein: 4.6,   carbs: 19,   fat: 1.4  },
  { id: "arroz_bolsita",   name: "Arroz Congelado Hacendado (bolsitas)",           category: "clean_carb",     kcal: 127,   protein: 2.7,   carbs: 28,   fat: 0.3  },
  { id: "tortas_arroz",    name: "Tortas de Arroz",                                category: "clean_carb",     kcal: 382,   protein: 8.2,   carbs: 81,   fat: 2.0  },
  { id: "tortas_maiz",     name: "Tortas de Maíz",                                 category: "clean_carb",     kcal: 368,   protein: 7.5,   carbs: 80,   fat: 1.8  },
  { id: "corn_flakes",     name: "Corn Flakes Sin Azúcar",                         category: "clean_carb",     kcal: 377,   protein: 8.5,   carbs: 82,   fat: 1.1  },
  { id: "copos_trigo",     name: "Copos de Trigo y Arroz Integral Sin Azúcar",     category: "clean_carb",     kcal: 364,   protein: 9.6,   carbs: 76,   fat: 1.7  },
  { id: "rice_krispies",   name: "Rice Krispies Kellogg's",                        category: "clean_carb",     kcal: 377,   protein: 8,     carbs: 84,   fat: 1.0  },
  { id: "cereal_mix",      name: "Cereal Mix Sin Azúcares (Hacendado)",            category: "clean_carb",     kcal: 389,   protein: 10.1,  carbs: 74.1, fat: 4.1  },
  { id: "churros",         name: "Churros Congelados (Hacendado)",                 category: "clean_carb",     kcal: 173,   protein: 5.2,   carbs: 33,   fat: 1.7  },
  { id: "crema_arroz",     name: "Crema de Arroz Sin Azúcares",                    category: "clean_carb",     kcal: 379,   protein: 7.3,   carbs: 85,   fat: 0.7  },
  { id: "choco_zero",      name: "Choco Zero (marca Esgir)",                       category: "clean_carb",     kcal: 392,   protein: 6.41,  carbs: 83,   fat: 3.41 },
  { id: "miel",            name: "Miel",                                           category: "clean_carb",     kcal: 332,   protein: 0,     carbs: 82.4, fat: 0.5  },
  { id: "maltodextrina",   name: "Maltodextrina",                                  category: "clean_carb",     kcal: 380,   protein: 0,     carbs: 95,   fat: 0    },
  { id: "ciclodextrina",   name: "Ciclodextrina",                                  category: "clean_carb",     kcal: 388,   protein: 0,     carbs: 97,   fat: 0    },

  // ── HIDRATOS GRASOS ───────────────────────────────────────────────
  { id: "pan_tostado",     name: "Pan Tostado 100% Integral (Hacendado)",          category: "fatty_carb",     kcal: 376,   protein: 16,    carbs: 59.4, fat: 6.0  },
  { id: "pan_molde",       name: "Pan de Molde Integral",                          category: "fatty_carb",     kcal: 230,   protein: 6,     carbs: 38,   fat: 2.9  },
  { id: "pizza_masa",      name: "Masa de Pizza Precocida",                        category: "fatty_carb",     kcal: 283,   protein: 6.5,   carbs: 53.4, fat: 4.4  },
  { id: "pizza_int",       name: "Masa de Pizza Precocida Integral",               category: "fatty_carb",     kcal: 258,   protein: 8.7,   carbs: 46.1, fat: 4.3  },
  { id: "fajitas",         name: "Tortillas de Trigo (Fajitas)",                   category: "fatty_carb",     kcal: 308,   protein: 7.1,   carbs: 55,   fat: 6.2  },
  { id: "patatas_fritas",  name: "Patatas Fritas Congeladas (corte grueso)",        category: "fatty_carb",     kcal: 116,   protein: 2.1,   carbs: 20,   fat: 2.4  },
  { id: "muesli",          name: "Muesli Sin Azúcares (Hacendado)",                category: "fatty_carb",     kcal: 409,   protein: 9.3,   carbs: 64,   fat: 13.0 },

  // ── FRUTA ─────────────────────────────────────────────────────────
  { id: "fresas",          name: "Fresas",                                         category: "fruit",          kcal: 34.9,  protein: 0.65,  carbs: 6.14, fat: 0.2  },
  { id: "frambuesas",      name: "Frambuesas",                                     category: "fruit",          kcal: 51,    protein: 1.2,   carbs: 11.94,fat: 0.65 },
  { id: "arandanos",       name: "Arándanos",                                      category: "fruit",          kcal: 57,    protein: 0.74,  carbs: 14.49,fat: 0.33 },
  { id: "frutos_rojos",    name: "Frutos Rojos Congelados (Hacendado)",            category: "fruit",          kcal: 39,    protein: 0,     carbs: 5.5,  fat: 0.9  },
  { id: "pina",            name: "Piña",                                           category: "fruit",          kcal: 48,    protein: 0.54,  carbs: 12.63,fat: 0.12 },
  { id: "kiwi",            name: "Kiwi",                                           category: "fruit",          kcal: 61,    protein: 1.14,  carbs: 14.66,fat: 0.62 },
  { id: "platano",         name: "Plátano",                                        category: "fruit",          kcal: 89,    protein: 1.09,  carbs: 22.84,fat: 0.33 },
  { id: "melocoton",       name: "Melocotón",                                      category: "fruit",          kcal: 39,    protein: 0.91,  carbs: 9.54, fat: 0.25 },
  { id: "pera",            name: "Pera",                                           category: "fruit",          kcal: 58,    protein: 0.38,  carbs: 15.46,fat: 0.12 },
  { id: "manzana",         name: "Manzana",                                        category: "fruit",          kcal: 72,    protein: 0.36,  carbs: 19.06,fat: 0.23 },
  { id: "datiles",         name: "Dátiles",                                        category: "fruit",          kcal: 298,   protein: 2,     carbs: 68.9, fat: 0.5  },
  { id: "pasas",           name: "Pasas Sultanas",                                 category: "fruit",          kcal: 324,   protein: 3.1,   carbs: 73,   fat: 1.1  },
  { id: "higos",           name: "Higos Secos",                                    category: "fruit",          kcal: 279,   protein: 3.2,   carbs: 63.3, fat: 0.6  },
  { id: "orejones",        name: "Orejones de Albaricoque",                        category: "fruit",          kcal: 208,   protein: 2.8,   carbs: 46,   fat: 0.5  },
  { id: "uva",             name: "Uva",                                            category: "fruit",          kcal: 69,    protein: 0.72,  carbs: 18.1, fat: 0.16 },
  { id: "sandia",          name: "Sandía",                                         category: "fruit",          kcal: 30,    protein: 0.6,   carbs: 8,    fat: 0.2  },
  { id: "melon",           name: "Melón",                                          category: "fruit",          kcal: 36,    protein: 0.54,  carbs: 9.08, fat: 0.14 },
  { id: "cerezas",         name: "Cerezas",                                        category: "fruit",          kcal: 58,    protein: 1.02,  carbs: 14.77,fat: 0.22 },
  { id: "mermelada",       name: "Mermelada Sin Azúcar",                           category: "fruit",          kcal: 210,   protein: 0,     carbs: 52,   fat: 0.5  },

  // ── GRASAS Y FRUTOS SECOS ─────────────────────────────────────────
  { id: "aceite_oliva",    name: "Aceite de Oliva Virgen Extra",                   category: "fat",            kcal: 822,   protein: 0,     carbs: 0,    fat: 91.0 },
  { id: "aceite_coco",     name: "Aceite de Coco",                                 category: "fat",            kcal: 900,   protein: 0,     carbs: 0,    fat: 100  },
  { id: "aceite_lino",     name: "Aceite de Lino",                                 category: "fat",            kcal: 900,   protein: 0,     carbs: 0,    fat: 100  },
  { id: "aguacate",        name: "Aguacate",                                       category: "fat",            kcal: 160,   protein: 2,     carbs: 2,    fat: 15.0 },
  { id: "guacamole",       name: "Guacamole 95% Aguacate",                         category: "fat",            kcal: 149,   protein: 1.9,   carbs: 2,    fat: 13.7 },
  { id: "aceitunas",       name: "Aceitunas",                                      category: "fat",            kcal: 150,   protein: 1.6,   carbs: 0.9,  fat: 15.0 },
  { id: "crema_cacah",     name: "Crema de Cacahuete 100%",                        category: "fat",            kcal: 618,   protein: 30,    carbs: 7,    fat: 50.0 },
  { id: "cacahuete",       name: "Cacahuete",                                      category: "fat",            kcal: 618,   protein: 24,    carbs: 13,   fat: 50.4 },
  { id: "almendras",       name: "Almendras",                                      category: "fat",            kcal: 603,   protein: 25,    carbs: 5.4,  fat: 51.0 },
  { id: "anacardos",       name: "Anacardos",                                      category: "fat",            kcal: 604,   protein: 21.9,  carbs: 19,   fat: 48.2 },
  { id: "nuez",            name: "Nuez Mondada",                                   category: "fat",            kcal: 716,   protein: 17,    carbs: 2.2,  fat: 69.6 },
  { id: "chocolate85",     name: "Chocolate Negro 85% Cacao",                      category: "fat",            kcal: 597,   protein: 12,    carbs: 20,   fat: 49.0 },
  { id: "omega3",          name: "Omega 3 (aceite)",                               category: "fat",            kcal: 900,   protein: 0,     carbs: 0,    fat: 100  },

  // ── VERDURAS GRASAS ───────────────────────────────────────────────
  { id: "crema_verduras",  name: "Crema de Verduras (Hacendado)",                  category: "veggie_fat",     kcal: 107,   protein: 2.6,   carbs: 16,   fat: 2.9  },
  { id: "gazpacho",        name: "Gazpacho Hacendado",                             category: "veggie_fat",     kcal: 110,   protein: 2,     carbs: 9,    fat: 6.0  },
];

// ── Helpers ───────────────────────────────────────────────────────

/** Devuelve los ingredientes de una o varias categorías */
export function byCategory(...cats: IngredientCategory[]): Ingredient[] {
  return ingredients.filter(i => cats.includes(i.category));
}

/** Macro neta de un alimento en `grams` gramos */
export function macroAt(ing: Ingredient, grams: number) {
  const f = grams / 100;
  return {
    kcal:    Math.round(ing.kcal    * f * 10) / 10,
    protein: Math.round(ing.protein * f * 10) / 10,
    carbs:   Math.round(ing.carbs   * f * 10) / 10,
    fat:     Math.round(ing.fat     * f * 10) / 10,
  };
}

// ── Compatibilidad con DietEditor / DietPage ──────────────────────
// Los slots internos de los planes de dieta usan nombres en español.

/** Alias — la lista completa de ingredientes */
export const INGREDIENTS = ingredients;

/** Slot de macro usado en los planes de dieta */
export type MainSlot = "proteina" | "hidrato" | "grasa" | "extra";

/** Resultado de macros por ración */
export interface MacroResult {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Devuelve ingredientes según el slot del plan de dieta */
export function bySlot(slot: MainSlot): Ingredient[] {
  switch (slot) {
    case "proteina":
      return ingredients.filter(i =>
        i.category === "lean_protein" ||
        i.category === "fatty_protein" ||
        i.category === "veggie_protein"
      );
    case "hidrato":
      return ingredients.filter(i =>
        i.category === "clean_carb" ||
        i.category === "fatty_carb" ||
        i.category === "protein_carb" ||
        i.category === "fruit"
      );
    case "grasa":
      return ingredients.filter(i =>
        i.category === "fat" ||
        i.category === "veggie_fat"
      );
    case "extra":
    default:
      return ingredients;
  }
}

/** Calcula macros de un ingrediente por id y gramos */
export function calcMacros(ingId: string, grams: number): MacroResult {
  const ing = ingredients.find(i => i.id === ingId);
  if (!ing || !grams) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const f = grams / 100;
  return {
    kcal:    Math.round(ing.kcal    * f * 10) / 10,
    protein: Math.round(ing.protein * f * 10) / 10,
    carbs:   Math.round(ing.carbs   * f * 10) / 10,
    fat:     Math.round(ing.fat     * f * 10) / 10,
  };
}

/** Suma un array de MacroResult */
export function sumMacros(arr: MacroResult[]): MacroResult {
  return arr.reduce(
    (acc, m) => ({
      kcal:    Math.round((acc.kcal    + m.kcal)    * 10) / 10,
      protein: Math.round((acc.protein + m.protein) * 10) / 10,
      carbs:   Math.round((acc.carbs   + m.carbs)   * 10) / 10,
      fat:     Math.round((acc.fat     + m.fat)     * 10) / 10,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
