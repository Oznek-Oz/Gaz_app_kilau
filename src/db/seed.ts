/**
 * Données initiales pour GazCom
 * Ce script insère les catégories, produits et un admin par défaut.
 * Exécuté automatiquement au déploiement.
 */
import { db } from "./index";
import { categories, products, users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seed() {
  // Vérifier si les données existent déjà
  const existingCategories = await db.select().from(categories).limit(1);
  if (existingCategories.length > 0) return;

  // --- CATÉGORIES ---
  const [catGazButane] = await db.insert(categories).values({
    name: "Gaz Butane",
    slug: "gaz-butane",
    description: "Bouteilles de gaz butane pour usage domestique",
    icon: "flame",
    sortOrder: 1,
  }).returning();

  const [catGazPropane] = await db.insert(categories).values({
    name: "Gaz Propane",
    slug: "gaz-propane",
    description: "Bouteilles de gaz propane pour usage professionnel",
    icon: "zap",
    sortOrder: 2,
  }).returning();

  const [catAccessoires] = await db.insert(categories).values({
    name: "Accessoires",
    slug: "accessoires",
    description: "Détendeurs, tuyaux, réchauds et accessoires",
    icon: "settings",
    sortOrder: 3,
  }).returning();

  // --- PRODUITS GAZ BUTANE ---
  await db.insert(products).values([
    {
      categoryId: catGazButane.id,
      name: "Bouteille Butane 6 kg",
      slug: "butane-6kg",
      description: "Bouteille de gaz butane 6 kg, idéale pour les petits foyers. Légère et facile à manipuler.",
      price: 4500,
      stock: 50,
      unit: "bouteille",
      weight: 6,
      isFeatured: true,
    },
    {
      categoryId: catGazButane.id,
      name: "Bouteille Butane 12 kg",
      slug: "butane-12kg",
      description: "Bouteille de gaz butane 12 kg, la plus populaire pour les familles.",
      price: 8500,
      stock: 80,
      unit: "bouteille",
      weight: 12,
      isFeatured: true,
    },
    {
      categoryId: catGazButane.id,
      name: "Bouteille Butane 38 kg",
      slug: "butane-38kg",
      description: "Grande bouteille de gaz butane 38 kg, pour les restaurants et usages intensifs.",
      price: 22000,
      stock: 20,
      unit: "bouteille",
      weight: 38,
      isFeatured: false,
    },
  ]);

  // --- PRODUITS GAZ PROPANE ---
  await db.insert(products).values([
    {
      categoryId: catGazPropane.id,
      name: "Bouteille Propane 6 kg",
      slug: "propane-6kg",
      description: "Bouteille de gaz propane 6 kg, supporte les températures extrêmes.",
      price: 5000,
      stock: 30,
      unit: "bouteille",
      weight: 6,
      isFeatured: false,
    },
    {
      categoryId: catGazPropane.id,
      name: "Bouteille Propane 13 kg",
      slug: "propane-13kg",
      description: "Bouteille de gaz propane 13 kg, idéale pour usage professionnel.",
      price: 9500,
      stock: 25,
      unit: "bouteille",
      weight: 13,
      isFeatured: true,
    },
    {
      categoryId: catGazPropane.id,
      name: "Bouteille Propane 35 kg",
      slug: "propane-35kg",
      description: "Grande bouteille propane 35 kg pour installations fixes.",
      price: 24000,
      stock: 10,
      unit: "bouteille",
      weight: 35,
      isFeatured: false,
    },
  ]);

  // --- ACCESSOIRES ---
  await db.insert(products).values([
    {
      categoryId: catAccessoires.id,
      name: "Détendeur Butane Standard",
      slug: "detendeur-butane",
      description: "Détendeur pour bouteilles de gaz butane, avec sécurité automatique.",
      price: 3500,
      stock: 100,
      unit: "unité",
      isFeatured: false,
    },
    {
      categoryId: catAccessoires.id,
      name: "Détendeur Propane",
      slug: "detendeur-propane",
      description: "Détendeur haute pression pour bouteilles propane.",
      price: 4200,
      stock: 50,
      unit: "unité",
      isFeatured: false,
    },
    {
      categoryId: catAccessoires.id,
      name: "Tuyau Flexible Gaz 1m",
      slug: "tuyau-flexible-1m",
      description: "Tuyau flexible pour gaz, longueur 1 mètre, certifié norme sécurité.",
      price: 2000,
      stock: 150,
      unit: "unité",
      isFeatured: false,
    },
    {
      categoryId: catAccessoires.id,
      name: "Tuyau Flexible Gaz 1.5m",
      slug: "tuyau-flexible-1m5",
      description: "Tuyau flexible pour gaz, longueur 1.5 mètre.",
      price: 2500,
      stock: 120,
      unit: "unité",
      isFeatured: false,
    },
    {
      categoryId: catAccessoires.id,
      name: "Réchaud à Gaz 1 Feu",
      slug: "rechaud-1-feu",
      description: "Réchaud portable à gaz, 1 feu, idéal pour la cuisine et les pique-niques.",
      price: 8000,
      stock: 30,
      unit: "unité",
      isFeatured: true,
    },
    {
      categoryId: catAccessoires.id,
      name: "Réchaud à Gaz 2 Feux",
      slug: "rechaud-2-feux",
      description: "Réchaud à gaz 2 feux, usage domestique et professionnel.",
      price: 15000,
      stock: 20,
      unit: "unité",
      isFeatured: false,
    },
  ]);

  // --- ADMIN PAR DÉFAUT ---
  const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@gazcom.cm")).limit(1);
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("Admin@GazCom2024", 10);
    await db.insert(users).values({
      name: "Administrateur",
      email: "admin@gazcom.cm",
      phone: "+237 600 000 000",
      passwordHash,
      role: "admin",
    });
  }

  console.log("Données initiales insérées avec succès !");
}
