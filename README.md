# 🎓 FormConsult - Plateforme de Formation & Consulting 

> Une plateforme complète de formation et de consulting B2B développée avec Next.js 15, TypeScript, et Prisma.



## ✨ Fonctionnalités

### 🎯 Formation
- **Catalogue de formations** certifiantes avec catégories
- **Système de quiz** interactifs et évaluations
- **Suivi de progression** personnalisé pour chaque utilisateur
- **Gestion de contenus** multimédias (vidéos, documents, ressources)
- **Certificats numériques** délivrés automatiquement

### 👥 Consulting
- **Réservation de sessions** de consulting personnalisées
- **Gestion d'agenda** pour les consultants
- **Système de feedback** et évaluations
- **Notifications en temps réel** pour les rendez-vous

### 📊 Tableaux de bord
- **Dashboard Admin** : Gestion complète de la plateforme
- **Dashboard Formateur** : Création et gestion des formations
- **Dashboard Consultant** : Planning et suivi des consultations
- **Dashboard Employé** : Suivi personnel et formations assignées

### 💳 Gestion des abonnements
- **3 plans d'abonnement** : Essentiel, Pro, Entreprise
- **Intégration Stripe** pour les paiements sécurisés
- **Gestion automatique** des accès selon l'abonnement

## 🛠️ Technologies utilisées

### Frontend
- **Next.js 15** - Framework React avec App Router
- **React 18** - Bibliothèque UI avec hooks
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes modernes

### Backend
- **Next.js API Routes** - API serverless
- **Prisma ORM** - Base de données type-safe
- **NextAuth.js** - Authentification complète
- **Nodemailer** - Envoi d'emails

### Services externes
- **Stripe** - Paiements et abonnements
- **Mux** - Streaming vidéo optimisé
- **UploadThing** - Gestion des fichiers

### Base de données
- **PostgreSQL** - Base de données relationnelle
- **Prisma Client** - ORM moderne et type-safe

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- PostgreSQL
- Compte Stripe
- Compte Mux (optionnel)

### 1. Clonage du projet
```bash
git clone https://github.com/Dey223/Form-consult.git
cd Form-consult
```

### 2. Installation des dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Créez un fichier `.env.local` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/formconsult"

# NextAuth
NEXTAUTH_SECRET="votre-secret-super-securise"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASS="votre-mot-de-passe"

# Mux (optionnel)
MUX_TOKEN_ID="votre-mux-token-id"
MUX_TOKEN_SECRET="votre-mux-token-secret"

# UploadThing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="votre-app-id"
```

### 4. Configuration de la base de données
```bash
# Génération du client Prisma
npx prisma generate

# Application des migrations
npx prisma db push

# Peuplement initial (optionnel)
npx prisma db seed
```

### 5. Démarrage en développement
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
Form-consult/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── api/               # Routes API
│   │   ├── auth/              # Pages d'authentification
│   │   ├── dashboard/         # Tableaux de bord
│   │   └── formations/        # Pages formations
│   ├── components/            # Composants React
│   │   ├── dashboard/         # Composants des dashboards
│   │   ├── ui/               # Composants UI réutilisables
│   │   └── providers/        # Providers React
│   ├── lib/                  # Utilitaires et configurations
│   │   ├── auth.ts           # Configuration NextAuth
│   │   ├── prisma.ts         # Client Prisma
│   │   └── stripe.ts         # Configuration Stripe
│   └── types/                # Types TypeScript
├── prisma/                   # Schéma et migrations
├── public/                   # Fichiers statiques
└── scripts/                  # Scripts utilitaires
```

## 🎭 Rôles et permissions

### 👤 Rôles disponibles
- **SUPER_ADMIN** : Gestion complète de la plateforme
- **ADMIN_ENTREPRISE** : Gestion de l'entreprise et employés
- **FORMATEUR** : Création et gestion des formations
- **CONSULTANT** : Gestion des sessions de consulting
- **EMPLOYE** : Accès aux formations et consultations

### 🔐 Système de permissions
- Authentification par email/mot de passe
- Gestion des rôles avec middleware
- Protection des routes sensibles
- Tokens de réinitialisation de mot de passe

## 📈 Plans d'abonnement

| Plan | Prix | Utilisateurs | Fonctionnalités |
|------|------|-------------|-----------------|
| **Essentiel** | 4 999 MAD | Jusqu'à 10 | Formations de base, Support email |
| **Pro** | 9 999 MAD | Jusqu'à 50 | + Consulting (50h/mois), Analytics |
| **Entreprise** | 19 999 MAD | Illimités | + Consulting illimité, Support 24/7 |

## 🧪 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Linting
npm run lint

# Configuration Prisma
npm run db:generate
npm run db:push
npm run db:seed
```


- **DigitalOcean** : App Platform





**Développeur** : Dey223  
**Email** : boulouoloyahoo.fr@gmail.com  
**Repository** : [https://github.com/Dey223/Form-consult](https://github.com/Dey223/Form-consult)

---

⭐ **N'hésitez pas à donner une étoile au projet si vous le trouvez utile !** 