"use client";

import { useState } from "react";
import { Brain, Play, Settings, BarChart3, Users, Timer, CheckCircle } from "lucide-react";
import QuizBuilder, { Quiz } from "@/components/dashboard/formateur-tabs/QuizBuilder";
import QuizPlayer from "@/components/dashboard/formateur-tabs/QuizPlayer";
import { toast } from "react-hot-toast";
export default function TestQuizPage() {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);

  // Quiz d'exemple pour la démonstration
  const exampleQuiz: Quiz = {
    id: "demo-1",
    title: "🚀 Quiz JavaScript Moderne",
    description: "Testez vos connaissances en JavaScript ES6+ et React",
    timeLimit: 10,
    shuffleQuestions: true,
    showResults: true,
    passingScore: 70,
    maxAttempts: 2,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Quelle syntaxe permet de déstructurer un objet en JavaScript ?",
        options: [
          "const {name, age} = person",
          "const [name, age] = person",
          "const name, age = person",
          "const (name, age) = person"
        ],
        correctAnswer: "const {name, age} = person",
        explanation: "La déstructuration d'objet utilise les accolades {} pour extraire les propriétés.",
        points: 2,
        timeLimit: 30
      },
      {
        id: "q2",
        type: "true_false",
        question: "React est une librairie JavaScript pour construire des interfaces utilisateur.",
        correctAnswer: "true",
        explanation: "Exact ! React est bien une librairie (library) JavaScript développée par Facebook pour créer des UI.",
        points: 1
      },
      {
        id: "q3",
        type: "open_ended",
        question: "Citez deux avantages principaux des arrow functions en JavaScript.",
        correctAnswer: "syntaxe, this, concise, lexical",
        explanation: "Les arrow functions offrent une syntaxe plus concise et conservent le contexte lexical de 'this'.",
        points: 3
      }
    ]
  };

  const handleSaveQuiz = (quiz: Quiz) => {
    const newQuiz = { ...quiz, id: `quiz_${Date.now()}` };
    setSavedQuizzes(prev => [...prev, newQuiz]);
    setShowBuilder(false);
    alert("✅ Quiz sauvegardé avec succès !");
  };

  const handleTestQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setShowPlayer(true);
  };

  const handleQuizComplete = (results: any) => {
    toast.success(`🎯 Quiz terminé ! Score: ${results.percentage}% (${results.score}/${results.totalPoints} points)`);
    setShowPlayer(false);
    setCurrentQuiz(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Test de Quiz - Intégration Complète
          </h1>
          <p className="text-gray-600">
            Testez le système de quiz intégré dans les leçons
          </p>
        </div>

        {/* Integration Status */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">✅ Intégration Réussie</h3>
              <p className="text-green-600 text-sm">
                • Quiz intégré dans la création de leçons<br/>
                • Support API pour les données quiz<br/>
                • Prévisualisation fonctionnelle dans les leçons<br/>
                • Système de quiz complet opérationnel
              </p>
            </div>
          </div>
        </div>

        {/* Guide d'utilisation */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📚 Comment utiliser les Quiz dans vos Leçons</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">1️⃣ Création d'une Leçon Quiz</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Allez dans "Curriculum" de votre formation</li>
                <li>• Cliquez "Ajouter une leçon"</li>
                <li>• Sélectionnez le type "QUIZ"</li>
                <li>• Cliquez "Lancer le Quiz Builder ✨"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">2️⃣ Prévisualisation & Test</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Cliquez sur votre leçon quiz créée</li>
                <li>• Utilisez le bouton "Commencer le Quiz"</li>
                <li>• Testez l'expérience complète</li>
                <li>• Modifiez si nécessaire</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Créer un nouveau quiz */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Créer un Quiz
              </h3>
              <p className="text-gray-600 mb-6">
                Utilisez notre Quiz Builder avancé avec drag & drop
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                ✨ Lancer le Builder
              </button>
            </div>
          </div>

          {/* Tester le quiz d'exemple */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quiz de Démonstration
              </h3>
              <p className="text-gray-600 mb-6">
                Testez notre quiz exemple JavaScript/React
              </p>
              <button
                onClick={() => handleTestQuiz(exampleQuiz)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                🚀 Tester Maintenant
              </button>
            </div>
          </div>
        </div>

        {/* Quiz sauvegardés */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
              Vos Quiz Créés ({savedQuizzes.length})
            </h3>
          </div>

          {savedQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Aucun quiz créé pour le moment
              </h4>
              <p className="text-gray-500 mb-6">
                Commencez par créer votre premier quiz interactif !
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Créer mon premier quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedQuizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onTest={() => handleTestQuiz(quiz)}
                  onEdit={() => {
                    setCurrentQuiz(quiz);
                    setShowBuilder(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Quiz créés</p>
                <p className="text-2xl font-bold">{savedQuizzes.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Questions totales</p>
                <p className="text-2xl font-bold">
                  {savedQuizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)}
                </p>
              </div>
              <Settings className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Points totaux</p>
                <p className="text-2xl font-bold">
                  {savedQuizzes.reduce((sum, quiz) => 
                    sum + quiz.questions.reduce((qSum, q) => qSum + q.points, 0), 0
                  )}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Temps moyen</p>
                <p className="text-2xl font-bold">
                  {savedQuizzes.length > 0 
                    ? Math.round(savedQuizzes.reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0) / savedQuizzes.length)
                    : 0
                  } min
                </p>
              </div>
              <Timer className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Builder Modal */}
      {showBuilder && (
        <QuizBuilder
          initialQuiz={currentQuiz || undefined}
          onSave={handleSaveQuiz}
          onCancel={() => {
            setShowBuilder(false);
            setCurrentQuiz(null);
          }}
        />
      )}

      {/* Quiz Player Modal */}
      {showPlayer && currentQuiz && (
        <QuizPlayer
          quiz={currentQuiz}
          onComplete={handleQuizComplete}
          onClose={() => {
            setShowPlayer(false);
            setCurrentQuiz(null);
          }}
        />
      )}
    </div>
  );
}

// Composant pour afficher une carte de quiz
function QuizCard({ 
  quiz, 
  onTest, 
  onEdit 
}: { 
  quiz: Quiz; 
  onTest: () => void; 
  onEdit: () => void; 
}) {
  const getTotalPoints = () => quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const getEstimatedTime = () => {
    const baseTime = quiz.questions.length * 2;
    return baseTime + (quiz.timeLimit || 0);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {quiz.title}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {quiz.description}
          </p>
        </div>
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {quiz.questions.length}
          </div>
          <div className="text-xs text-gray-500">Questions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {getTotalPoints()}
          </div>
          <div className="text-xs text-gray-500">Points</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            ~{getEstimatedTime()}m
          </div>
          <div className="text-xs text-blue-500">Temps</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onTest}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          <Play className="w-4 h-4 mr-1" />
          Tester
        </button>
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          <Settings className="w-4 h-4 mr-1" />
          Modifier
        </button>
      </div>
    </div>
  );
} 