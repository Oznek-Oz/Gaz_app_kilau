# Active Context: GazCom - Application de commande de gaz en ligne

## Current State

**Status**: ✅ Application complète déployée

Application complète de commande de gaz en ligne pour GazCom, Maroua, Cameroun.

## Recently Completed

- [x] Configuration centrale `src/lib/config.ts` — personnalisation sans code (nom, devise, frais, fidélité, paiements)
- [x] Base de données complète (9 tables): users, products, categories, orders, order_items, order_status_history, notifications, loyalty_transactions, promotions
- [x] Authentification JWT (login, register, logout, session cookie)
- [x] Page d'accueil avec hero, produits phares, avantages, points de vente
- [x] Catalogue produits avec filtres par catégorie et recherche
- [x] Page détail produit avec ajout au panier
- [x] Panier persistant (localStorage + context)
- [x] Checkout complet: type de livraison, point de retrait, paiement (cash/MTN/Orange), fidélité
- [x] Suivi commande temps réel avec historique des statuts + auto-refresh 30s
- [x] Espace client: profil, commandes, points fidélité, notifications
- [x] Dashboard admin: stats, commandes récentes, stocks bas
- [x] Admin: gestion commandes (changement de statut), produits (CRUD), clients (rôles, activation)
- [x] Notifications in-app (commandes, fidélité, système)
- [x] Données initiales: gaz butane/propane (6kg, 12kg, 38kg), accessoires, admin par défaut
- [x] Design mobile-first rouge/bleu-navy/blanc

## Admin par défaut

- Email: `admin@gazcom.cm`
- Mot de passe: `Admin@GazCom2024`

## Structure

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/produits` | Catalogue (filtres catégorie/recherche) |
| `/produits/[slug]` | Détail produit |
| `/commande` | Checkout (auth requise) |
| `/suivi` | Suivi commande en temps réel |
| `/connexion` | Login / Inscription |
| `/compte` | Espace client |
| `/compte/commandes` | Historique commandes |
| `/notifications` | Notifications |
| `/contact` | Page contact |
| `/admin` | Dashboard admin |
| `/admin/commandes` | Gestion commandes |
| `/admin/produits` | Gestion produits CRUD |
| `/admin/clients` | Gestion utilisateurs |

## Personnalisation

Tout se configure dans `src/lib/config.ts` :
- Infos entreprise (nom, téléphone, email, horaires)
- Tarifs de livraison
- Règles fidélité
- Méthodes de paiement
- Points de vente

## Session History

| Date | Changes |
|------|---------|
| Initial | Template créé |
| 2024-03 | Application complète GazCom construite |
