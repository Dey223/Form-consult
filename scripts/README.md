# Scripts de Gestion des Utilisateurs

Ce dossier contient des scripts utilitaires pour gérer les utilisateurs de la plateforme FormConsult.

## 📚 Script de Création de Formateurs

Le script `create-formateur.js` permet de créer facilement des comptes formateurs dans la base de données.

### 🚀 Utilisation

#### 1. Créer un formateur par défaut
```bash
node scripts/create-formateur.js default
```
Crée un formateur avec les informations prédéfinies :
- **Nom :** Dr. Marie Dubois
- **Email :** marie.dubois@formconsult.com
- **Mot de passe :** formateur123

#### 2. Créer un formateur personnalisé
```bash
node scripts/create-formateur.js custom "<nom>" "<email>" "<password>" [companyId]
```

**Exemples :**
```bash
# Formateur indépendant
node scripts/create-formateur.js custom "Alice Dupont" "alice@example.com" "password123"

# Formateur associé à une entreprise
node scripts/create-formateur.js custom "Bob Martin" "bob@example.com" "password123" "company-id-here"
```

#### 3. Créer plusieurs formateurs d'exemple
```bash
node scripts/create-formateur.js samples
```
Crée 4 formateurs d'exemple avec des profils variés.

#### 4. Lister les entreprises disponibles
```bash
node scripts/create-formateur.js list-companies
```
Affiche toutes les entreprises avec leurs IDs pour associer des formateurs.

### 📋 Fonctionnalités

✅ **Validation des emails** - Vérifie que l'email n'existe pas déjà  
✅ **Hashage sécurisé** - Les mots de passe sont hashés avec bcrypt  
✅ **Vérification automatique** - Les comptes sont marqués comme vérifiés  
✅ **Association d'entreprise** - Possibilité d'associer à une entreprise  
✅ **Logs détaillés** - Affichage complet des informations créées  

### 🔐 Informations de Connexion

Après création, le script affiche :
- ID unique du formateur
- Nom et email
- Rôle assigné
- Entreprise associée (si applicable)
- Date de création
- **Informations de connexion** (email/mot de passe)

### ⚠️ Sécurité

- Les mots de passe sont hashés avec bcrypt (12 rounds)
- Vérification d'unicité des emails
- Gestion des erreurs et validation des données
- Déconnexion automatique de Prisma

### 🛠️ Développement

Le script exporte également des fonctions réutilisables :
```javascript
const { 
  createFormateur, 
  createCustomFormateur, 
  listCompanies, 
  createSampleFormateurs 
} = require('./scripts/create-formateur.js')
```

### 📝 Exemples d'Utilisation

```bash
# Créer un formateur par défaut
node scripts/create-formateur.js default

# Créer un formateur personnalisé
node scripts/create-formateur.js custom "Sophie Leclerc" "sophie@formconsult.com" "sophie123"

# Voir les entreprises disponibles
node scripts/create-formateur.js list-companies

# Créer un formateur pour une entreprise spécifique
node scripts/create-formateur.js custom "Pierre Durand" "pierre@formconsult.com" "pierre123" "cmbxxw1ki000uuc80yt2mgwzr"

# Créer plusieurs formateurs d'exemple
node scripts/create-formateur.js samples
```

### 🐛 Dépannage

**Erreur "Email déjà existant"**
- Vérifiez que l'email n'est pas déjà utilisé
- Utilisez un email unique

**Erreur de connexion à la base**
- Vérifiez que la base de données est accessible
- Vérifiez les variables d'environnement (.env)

**Erreur Prisma**
- Exécutez `npx prisma generate` si nécessaire
- Vérifiez que le schéma Prisma est à jour

---

## 👥 Script de Listage des Utilisateurs

Le script `list-users.js` permet de visualiser tous les utilisateurs de la plateforme avec leurs informations détaillées.

### 🚀 Utilisation

#### 1. Lister tous les utilisateurs
```bash
node scripts/list-users.js all
```
Affiche tous les utilisateurs groupés par rôle avec statistiques globales.

#### 2. Lister par rôle spécifique
```bash
node scripts/list-users.js role <ROLE>
```

**Rôles disponibles :**
- `SUPER_ADMIN`
- `ADMIN_ENTREPRISE` 
- `EMPLOYE`
- `CONSULTANT`
- `FORMATEUR`

**Exemple :**
```bash
node scripts/list-users.js role FORMATEUR
```

#### 3. Lister par entreprise
```bash
node scripts/list-users.js company <companyId>
```

**Exemple :**
```bash
node scripts/list-users.js company cmbxxw1ki000uuc80yt2mgwzr
```

### 📊 Informations Affichées

Pour chaque utilisateur :
- ✅ **Nom et email**
- 🆔 **ID unique**
- 🏢 **Entreprise associée**
- ✅ **Statut de vérification**
- 📅 **Date de création**
- 📊 **Statistiques spécifiques au rôle**

**Statistiques par rôle :**
- **FORMATEUR :** Formations créées
- **EMPLOYE :** Formations suivies  
- **CONSULTANT :** Consultations données
- **Tous :** Rendez-vous pris

### 📈 Statistiques Globales

Le script affiche également :
- Nombre total d'utilisateurs
- Répartition par rôle
- Groupement organisé par rôle 