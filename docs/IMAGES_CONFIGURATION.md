# Configuration des Images

## Problème résolu : UploadThing + Next.js Image

### Erreur initiale
```
Error: Invalid src prop (https://utfs.io/f/...) on `next/image`, 
hostname "utfs.io" is not configured under images in your `next.config.js`
```

### Solution implémentée

#### 1. Configuration Next.js (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing CDN
        port: "",
        pathname: "/f/**",
      },
      {
        protocol: "https", 
        hostname: "uploadthing.com", // UploadThing principal
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google Avatars
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub Avatars
        port: "",
        pathname: "/**",
      },
    ],
  },
};
```

#### 2. Usage correct du composant Image

```tsx
// ❌ Incorrect - balise img normale
<img src={imageUrl} alt="Formation" className="w-20 h-20" />

// ✅ Correct - composant Next.js Image
<div className="relative w-20 h-20">
  <Image
    src={imageUrl}
    alt="Formation"
    fill
    className="object-cover rounded-lg"
  />
</div>
```

### Domaines autorisés

- **utfs.io** : CDN principal d'UploadThing
- **uploadthing.com** : Domaine principal UploadThing
- **lh3.googleusercontent.com** : Avatars Google (OAuth)
- **avatars.githubusercontent.com** : Avatars GitHub (OAuth)

### Redémarrage requis

⚠️ **Important** : Après modification de `next.config.ts`, il faut redémarrer le serveur de développement :

```bash
npm run dev
```

### Débogage

Si les images ne s'affichent toujours pas :

1. Vérifiez que le serveur a été redémarré
2. Vérifiez l'URL de l'image dans la console réseau
3. Assurez-vous que le domaine est bien dans `remotePatterns`
4. Vérifiez que l'image existe sur UploadThing

### URLs d'exemple UploadThing

```
https://utfs.io/f/8cwasnA1JhZzctUaPTLFWEp4bt6iAaG0xq8mXyQuzrkB2h9d
```

Format : `https://utfs.io/f/[file-id]` 