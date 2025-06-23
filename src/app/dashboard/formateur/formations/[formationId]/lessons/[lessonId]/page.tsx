"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Clock, BookOpen, CheckCircle, Eye, EyeOff } from "lucide-react";
import MuxVideoPlayer from "@/components/video/MuxPlayer";
import QuizPlayer from "@/components/dashboard/formateur-tabs/QuizPlayer";
import toast from "react-hot-toast";
interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: "VIDEO" |  "QUIZ" ;
  duration: number | null;
  orderIndex: number;
  isPublished: boolean;
  isFree: boolean;
  videoUrl: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  content: string | null; // Pour les données quiz
  section: {
    id: string;
    title: string;
    formation: {
      id: string;
      title: string;
      author: {
        id: string;
        name: string;
      };
    };
  };
}

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuizPlayer, setShowQuizPlayer] = useState(false);

  const formationId = params.formationId as string;
  const lessonId = params.lessonId as string;

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`);
      
      if (!response.ok) {
        throw new Error("Leçon non trouvée");
      }

      const data = await response.json();
      setLesson(data);
    } catch (error) {
      toast.error("Impossible de charger la leçon");
      
      setError("Impossible de charger la leçon");
    } finally {

      setLoading(false);

    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0 min";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProgress = (watchedSeconds: number) => {
    // TODO: Sauvegarder le progrès dans la base de données
    toast.success(`Progrès: ${watchedSeconds} secondes`);
  };

  const handleComplete = () => {
    // TODO: Marquer la leçon comme terminée
    toast.success("Leçon terminée");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la leçon...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-600">{error || "Leçon non trouvée"}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(`/dashboard/formateur/formations/${formationId}/curriculum`)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Retour au curriculum
                </button>
                
                <div className="h-6 w-px bg-gray-300" />
                
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {lesson.title}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {lesson.section.formation.title} • {lesson.section.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.isFree 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {lesson.isFree ? 'Gratuit' : 'Payant'}
                </span>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lesson.isPublished ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Publié
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Brouillon
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lecteur vidéo principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {lesson.type === "VIDEO" && lesson.muxPlaybackId ? (
                <div className="aspect-video">
                  <MuxVideoPlayer
                    playbackId={lesson.muxPlaybackId}
                    lessonId={lesson.id}
                    videoUrl={lesson.videoUrl || undefined}
                    onProgress={(seconds) => console.log(`Progrès: ${seconds}s`)}
                    onComplete={() => console.log("Leçon terminée")}
                    className="w-full h-full"
                  />
                </div>
              ) : lesson.type === "VIDEO" && !lesson.muxPlaybackId ? (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Vidéo en cours de traitement...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Cela peut prendre quelques minutes
                    </p>
                  </div>
                </div>
              ) : lesson.type === "QUIZ" && lesson.content ? (
                <div className="aspect-video bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz interactif</h3>
                    <p className="text-gray-600 mb-4">Testez vos connaissances avec ce quiz</p>
                    <button
                      onClick={() => setShowQuizPlayer(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                    >
                      🚀 Commencer le Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                   
                      {lesson.type === "QUIZ" && "Quiz en cours de préparation..."}
                   
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar avec informations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-6">
                {/* Informations de la leçon */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Informations
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Durée: {formatDuration(lesson.duration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Type: {lesson.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Leçon #{lesson.orderIndex}
                      </span>
                    </div>
                    
                    {/* Informations vidéo */}
                    {lesson.type === "VIDEO" && lesson.muxPlaybackId && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-800 mb-2">🎥 Vidéo prête</p>
                        <div className="text-xs text-blue-600">
                          <p>✅ Streaming optimisé activé</p>
                          <p>📱 Compatible tous appareils</p>
                          <p>⚡ Qualité adaptative</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {lesson.description && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                )}

                {/* Formation info */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">
                    Formation
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {lesson.section.formation.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Par {lesson.section.formation.author.name}
                  </p>
                </div>

                {/* Actions rapides */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Actions rapides
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push(`/dashboard/formateur/formations/${formationId}/curriculum`)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      📚 Voir le curriculum
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/formateur/formations/${formationId}/edit`)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      ✏️ Modifier la formation
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/formateur/formations`)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      📋 Mes formations
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Player Modal */}
      {showQuizPlayer && lesson.type === "QUIZ" && lesson.content && (
        <QuizPlayer
          quiz={JSON.parse(lesson.content)}
          onComplete={(results) => {
            console.log("Quiz terminé:", results);
            setShowQuizPlayer(false);
            // TODO: Sauvegarder les résultats
          }}
          onClose={() => setShowQuizPlayer(false)}
        />
      )}
    </div>
  );
} 