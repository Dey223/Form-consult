import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TestPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "FORMATEUR") {
    redirect("/dashboard");
  }

  // Test de récupération des données
  const formations = await prisma.formation.findMany({
    where: {
      authorId: session.user.id,
    },
    take: 5,
  });

  // Simuler des catégories et niveaux pour le test
  const categories = [
    { id: '1', name: 'Développement Web', description: 'Créer des sites web' },
    { id: '2', name: 'Design & UX', description: 'Design d\'interface' },
  ];

  const levels = [
    { id: '1', name: 'Débutant' },
    { id: '2', name: 'Intermédiaire' },
    { id: '3', name: 'Avancé' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Page de Test - Formation System</h1>
      
      <div className="space-y-6">
        {/* Test utilisateur connecté */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Utilisateur connecté</h2>
          <div className="space-y-2">
            <p><strong>Nom:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Rôle:</strong> {session.user.role}</p>
            <p><strong>ID:</strong> {session.user.id}</p>
          </div>
        </div>

        {/* Test formations */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Formations ({formations.length})</h2>
          {formations.length > 0 ? (
            <div className="space-y-3">
              {formations.map((formation) => (
                <div key={formation.id} className="border rounded p-3">
                  <h3 className="font-medium">{formation.title}</h3>
                  <p className="text-sm text-gray-600">{formation.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    <span>Prix: {formation.price}€</span>
                    <span>Statut: {formation.isActive ? 'Active' : 'Inactive'}</span>
                    <span>Niveau: {formation.level}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune formation trouvée</p>
          )}
        </div>

        {/* Test catégories */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Catégories ({categories.length})</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="border rounded p-3">
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune catégorie trouvée</p>
          )}
        </div>

        {/* Test niveaux */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Niveaux ({levels.length})</h2>
          {levels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <div key={level.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {level.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun niveau trouvé</p>
          )}
        </div>

        {/* Actions de test */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Actions de Test</h2>
          <div className="space-y-4">
            <div>
              <a 
                href="/dashboard/formateur/formations/create"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer une formation
              </a>
            </div>
            <div>
              <a 
                href="/dashboard/formateur/formations"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Voir mes formations
              </a>
            </div>
            {formations.length > 0 && (
              <div>
                <a 
                  href={`/dashboard/formateur/formations/${formations[0].id}/edit`}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Éditer la première formation
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Base de données Info */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Informations de la base de données</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Base de données:</strong> {process.env.DATABASE_URL ? 'Configurée' : 'Non configurée'}</p>
            <p><strong>Date/Heure:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 