"use client";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save, PlayCircle, FileText, HelpCircle, File, BookOpen, Clock, Gift, Eye, Upload, Video, Brain, Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import VideoUpload from "@/components/dashboard/VideoUpload";
import QuizBuilder, { Quiz } from "./QuizBuilder";
import QuizPlayer from "./QuizPlayer";

const createLessonSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "DOCUMENT"]),
  duration: z.number().min(0),
  isPublished: z.boolean(),
  isFree: z.boolean(),
  videoUrl: z.string().optional(),
  muxAssetId: z.string().optional(),
  muxPlaybackId: z.string().optional(),
  quizData: z.any().optional(), // Données du quiz
});

type FormData = z.infer<typeof createLessonSchema>;

interface EditLesson {
  id: string;
  title: string;
  description: string | null;
  type: "VIDEO" | "TEXT" | "QUIZ" | "DOCUMENT";
  duration: number | null;
  isPublished: boolean;
  isFree: boolean;
  videoUrl?: string | null;
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  quizData?: any;
}

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  editData?: EditLesson;
  onSuccess?: () => void;
}

const lessonTypes = [
  { 
    value: "VIDEO", 
    label: "Vidéo", 
    icon: PlayCircle, 
    description: "Leçon vidéo avec contenu multimédia",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200"
  },
  { 
    value: "TEXT", 
    label: "Texte", 
    icon: FileText, 
    description: "Contenu textuel et images",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  { 
    value: "QUIZ", 
    label: "Quiz", 
    icon: HelpCircle, 
    description: "Questions interactives",
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200"
  },
  { 
    value: "DOCUMENT", 
    label: "Document", 
    icon: File, 
    description: "PDF ou autres documents",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200"
  },
];

export default function CreateLessonModal({
  isOpen,
  onClose,
  sectionId,
  editData,
  onSuccess,
}: CreateLessonModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<{
    url?: string;
    muxAssetId?: string;
    muxPlaybackId?: string;
  }>({});
  
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showPreviewQuiz, setShowPreviewQuiz] = useState(false);
  
  const isEditing = !!editData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      type: "VIDEO",
      duration: 0,
      isPublished: false,
      isFree: false,
      description: "",
    },
  });

  const selectedType = watch("type");
  const isPublished = watch("isPublished");
  const isFree = watch("isFree");

  // Charger les données d'édition
  useEffect(() => {
    if (isEditing && editData) {
      setValue("title", editData.title);
      setValue("description", editData.description || "");
      setValue("type", editData.type);
      setValue("duration", (editData.duration || 0) / 60); // Convertir secondes en minutes
      setValue("isPublished", editData.isPublished);
      setValue("isFree", editData.isFree);
      
      // Charger les données vidéo si disponibles
      if (editData.videoUrl || editData.muxPlaybackId) {
        setVideoData({
          url: editData.videoUrl || undefined,
          muxAssetId: editData.muxAssetId || undefined,
          muxPlaybackId: editData.muxPlaybackId || undefined,
        });
      }
      
      // Charger les données quiz si disponibles
      if (editData.quizData) {
        setQuizData(editData.quizData);
      }
    } else {
      reset({
        title: "",
        type: "VIDEO",
        duration: 0,
        isPublished: false,
        isFree: false,
        description: "",
      });
      setVideoData({});
    }
  }, [isEditing, editData, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    // Pour les leçons vidéo, vérifier qu'une vidéo a été uploadée (seulement pour la création)
    if (data.type === "VIDEO" && !videoData.url && !isEditing) {
      toast.error("Veuillez uploader une vidéo pour cette leçon");
      return;
    }

    // Pour les leçons quiz, vérifier qu'un quiz a été créé
    if (data.type === "QUIZ" && !quizData && !isEditing) {
      toast.error("Veuillez créer un quiz pour cette leçon");
      return;
    }

    setIsLoading(true);
    try {
      const lessonData = {
        ...data,
        duration: data.duration * 60, // Convertir minutes en secondes
        videoUrl: videoData.url,
        muxAssetId: videoData.muxAssetId,
        muxPlaybackId: videoData.muxPlaybackId,
        quizData: quizData, // Inclure les données du quiz
      };

      const url = isEditing 
        ? `/api/lessons/${editData!.id}`
        : `/api/sections/${sectionId}/lessons`;
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de ${isEditing ? 'la modification' : 'la création'}`);
      }

      reset();
      setVideoData({});
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(`Erreur lors de ${isEditing ? 'la modification' : 'la création'} de la leçon`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setVideoData({});
      onClose();
    }
  };

  const handleVideoChange = (url?: string) => {
    setVideoData(prev => ({ ...prev, url }));
    setValue("videoUrl", url || "");
  };

  const handleMuxDataChange = (muxData: { assetId: string; playbackId: string }) => {
    setVideoData(prev => ({
      ...prev,
      muxAssetId: muxData.assetId,
      muxPlaybackId: muxData.playbackId,
    }));
    setValue("muxAssetId", muxData.assetId);
    setValue("muxPlaybackId", muxData.playbackId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="flex items-center justify-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
              {isEditing ? "Modifier la leçon" : "Créer une nouvelle leçon"}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            🎓 Ajoutez du contenu captivant à votre formation
          </DialogDescription>
        </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Titre */}
        <div className="space-y-3">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText className="w-4 h-4 text-blue-500" />
              Titre de la leçon *
            </label>
          <div className="relative">
            <input
              {...register("title")}
              type="text"
              id="title"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Ex: Introduction aux hooks React"
            />
            {watch("title") && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                ✓
              </div>
            )}
          </div>
          {errors.title && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              ⚠️ {errors.title.message}
            </p>
            )}
          </div>

          {/* Type de leçon */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <PlayCircle className="w-4 h-4 text-purple-500" />
              Type de leçon *
            </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lessonTypes.map((type) => {
                const Icon = type.icon;
              const isSelected = selectedType === type.value;
                return (
                  <label
                    key={type.value}
                  className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isSelected
                      ? `${type.bgColor} border-current shadow-lg`
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                    }`}
                  >
                    <input
                      {...register("type")}
                      type="radio"
                      value={type.value}
                      className="sr-only"
                    />
                  <div className={`p-2 rounded-lg mr-3 ${
                    isSelected ? "bg-white shadow-sm" : "bg-gray-50"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isSelected ? type.color : "text-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${
                      isSelected ? type.color : "text-gray-900"
                      }`}>
                        {type.label}
                      </div>
                    <div className={`text-xs mt-1 ${
                      isSelected ? "text-gray-700" : "text-gray-500"
                      }`}>
                        {type.description}
                      </div>
                  </div>
                  {isSelected && (
                    <div className={`ml-2 ${type.color}`}>
                      ✓
                    </div>
                  )}
                  </label>
                );
              })}
            </div>
          </div>

        {/* Upload vidéo - Affiché seulement si le type est VIDEO */}
        {selectedType === "VIDEO" && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Video className="w-4 h-4 text-red-500" />
              Vidéo de la leçon *
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <VideoUpload
                value={videoData.url || ""}
                onChange={handleVideoChange}
                muxPlaybackId={videoData.muxPlaybackId}
                onMuxDataChange={handleMuxDataChange}
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              📹 La vidéo sera automatiquement optimisée pour le streaming
            </p>
          </div>
        )}

        {/* Quiz Builder - Affiché seulement si le type est QUIZ */}
        {selectedType === "QUIZ" && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Brain className="w-4 h-4 text-purple-500" />
              Configuration du Quiz
            </label>
            
            <div className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
              {!quizData ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎯 Créez un Quiz Extraordinaire !
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Engagez vos étudiants avec des questions interactives, des animations, 
                    et un système de gamification avancé.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl mb-1">🔘</div>
                      <div className="text-xs font-medium text-gray-700">QCM</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl mb-1">✅</div>
                      <div className="text-xs font-medium text-gray-700">Vrai/Faux</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl mb-1">💻</div>
                      <div className="text-xs font-medium text-gray-700">Code</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl mb-1">🖼️</div>
                      <div className="text-xs font-medium text-gray-700">Images</div>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowQuizBuilder(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Lancer le Quiz Builder ✨
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {quizData.title || "Quiz sans titre"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {quizData.description || "Aucune description"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuizBuilder(true)}
                        className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Modifier
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowPreviewQuiz(true)}
                        className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Tester
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {quizData.questions.length}
                      </div>
                      <div className="text-xs text-gray-600">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {quizData.questions.reduce((sum, q) => sum + q.points, 0)}
                      </div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {quizData.timeLimit || "∞"}
                      </div>
                      <div className="text-xs text-gray-600">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {quizData.passingScore}%
                      </div>
                      <div className="text-xs text-gray-600">Réussite</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {quizData.shuffleQuestions && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        🔀 Aléatoire
                      </span>
                    )}
                    {quizData.showResults && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        📊 Résultats visibles
                      </span>
                    )}
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      🎯 {quizData.maxAttempts} tentative{quizData.maxAttempts > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-1">
              🧠 Quiz interactif avec gamification et analytics détaillées
            </p>
          </div>
        )}

        {/* Description */}
        <div className="space-y-3">
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText className="w-4 h-4 text-green-500" />
            Description (optionnelle)
            </label>
            <textarea
              {...register("description")}
              id="description"
              rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
            placeholder="Décrivez le contenu de cette leçon et ce que vos étudiants vont apprendre..."
            />
          </div>

          {/* Durée (pour les vidéos) */}
          {selectedType === "VIDEO" && (
          <div className="space-y-3">
            <label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
                Durée (en minutes)
              </label>
            <div className="relative">
              <input
                {...register("duration", { valueAsNumber: true })}
                type="number"
                id="duration"
                min="0"
                step="0.5"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Ex: 15"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                min
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              💡 Durée approximative de la vidéo (sera mise à jour automatiquement après traitement)
            </p>
            </div>
          )}

          {/* Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Options de publication</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leçon gratuite */}
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              isFree 
                ? "border-green-300 bg-green-50" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}>
              <input
                {...register("isFree")}
                type="checkbox"
                id="isFree"
                className="sr-only"
              />
              <div className={`p-2 rounded-lg mr-3 ${
                isFree ? "bg-green-100" : "bg-gray-50"
              }`}>
                <Gift className={`w-5 h-5 ${
                  isFree ? "text-green-600" : "text-gray-400"
                }`} />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${
                  isFree ? "text-green-700" : "text-gray-900"
                }`}>
                  Leçon gratuite
                </div>
                <div className={`text-xs ${
                  isFree ? "text-green-600" : "text-gray-500"
                }`}>
                  Aperçu accessible à tous
                </div>
              </div>
              {isFree && <div className="text-green-600">✓</div>}
              </label>

            {/* Publier immédiatement */}
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              isPublished 
                ? "border-blue-300 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}>
              <input
                {...register("isPublished")}
                type="checkbox"
                id="isPublished"
                className="sr-only"
              />
              <div className={`p-2 rounded-lg mr-3 ${
                isPublished ? "bg-blue-100" : "bg-gray-50"
              }`}>
                <Eye className={`w-5 h-5 ${
                  isPublished ? "text-blue-600" : "text-gray-400"
                }`} />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${
                  isPublished ? "text-blue-700" : "text-gray-900"
                }`}>
                Publier immédiatement
                </div>
                <div className={`text-xs ${
                  isPublished ? "text-blue-600" : "text-gray-500"
                }`}>
                  {selectedType === "VIDEO" ? "Visible dès que la vidéo sera prête" : "Visible pour les étudiants"}
                </div>
              </div>
              {isPublished && <div className="text-blue-600">✓</div>}
              </label>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6">
              <button
                type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isEditing ? "Mise à jour..." : "Création en cours..."}
                  </>
                ) : (
                  <>
                  <Save className="w-5 h-5" />
                    {isEditing ? "Mettre à jour" : "Créer la leçon"}
                  </>
                )}
              </button>
          </DialogFooter>
          </form>
        </DialogContent>

        {/* Quiz Builder Modal */}
        {showQuizBuilder && (
          <QuizBuilder
            initialQuiz={quizData || undefined}
            onSave={(quiz) => {
              setQuizData(quiz);
              setShowQuizBuilder(false);
            }}
            onCancel={() => setShowQuizBuilder(false)}
          />
        )}

        {/* Quiz Preview Modal */}
        {showPreviewQuiz && quizData && (
          <QuizPlayer
            quiz={quizData}
            onComplete={(results) => {
              toast.success(`🎯 Aperçu terminé ! Score: ${results.percentage}% (${results.score}/${results.totalPoints} points)`);
              setShowPreviewQuiz(false);
            }}
            onClose={() => setShowPreviewQuiz(false)}
          />
        )}
      </Dialog>
  );
} 