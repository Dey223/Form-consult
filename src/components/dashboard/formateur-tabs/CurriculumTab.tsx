"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, 
         PlayCircle, FileText, Clock, Users, MoreHorizontal } from "lucide-react";
import CreateSectionModal from "./CreateSectionModal";
import CreateLessonModal from "./CreateLessonModal";
import AlertDialog from "@/components/ui/AlertDialog";
import Link from "next/link";

interface Formation {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isPublished: boolean;
  isFree: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: "VIDEO" | "TEXT" | "QUIZ" | "DOCUMENT";
  duration: number | null;
  orderIndex: number;
  isPublished: boolean;
  isFree: boolean;
  videoUrl: string | null;
  muxData?: {
    playbackId: string;
  } | null;
}

interface CurriculumTabProps {
  formation: Formation;
  isReadOnly?: boolean;
}

export default function CurriculumTab({ formation, isReadOnly = false }: CurriculumTabProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [showEditSection, setShowEditSection] = useState(false);
  const [showEditLesson, setShowEditLesson] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // États pour les dialogues de suppression
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'section' | 'lesson';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'section',
    id: '',
    title: ''
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0 min";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getTotalDuration = () => {
    return formation.sections.reduce((total, section) => {
      return total + section.lessons.reduce((sectionTotal, lesson) => {
        return sectionTotal + (lesson.duration || 0);
      }, 0);
    }, 0);
  };

  const getTotalLessons = () => {
    return formation.sections.reduce((total, section) => total + section.lessons.length, 0);
  };

  const getPublishedCount = () => {
    const publishedSections = formation.sections.filter(s => s.isPublished).length;
    const publishedLessons = formation.sections.reduce((total, section) => {
      return total + section.lessons.filter(l => l.isPublished).length;
    }, 0);
    return { sections: publishedSections, lessons: publishedLessons };
  };

  const handleCreateLesson = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowCreateLesson(true);
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setSelectedSectionId(section.id);
    setShowEditSection(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedLessonId(lesson.id);
    setShowEditLesson(true);
  };

  const handleDeleteSection = (section: Section) => {
    setDeleteDialog({
      isOpen: true,
      type: 'section',
      id: section.id,
      title: section.title
    });
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setDeleteDialog({
      isOpen: true,
      type: 'lesson',
      id: lesson.id,
      title: lesson.title
    });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const endpoint = deleteDialog.type === 'section' 
        ? `/api/sections/${deleteDialog.id}`
        : `/api/lessons/${deleteDialog.id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDeleteDialog({ isOpen: false, type: 'section', id: '', title: '' });
        window.location.reload();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (type: 'section' | 'lesson', id: string, isPublished: boolean) => {
    try {
      const endpoint = type === 'section' 
        ? `/api/sections/${id}/publish`
        : `/api/lessons/${id}/publish`;
      
      const method = isPublished ? 'DELETE' : 'POST';
      
      const response = await fetch(endpoint, { method });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  const published = getPublishedCount();

  return (
    <div className="m-6">
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Contenu du cours
            </h2>
            <p className="text-gray-600">
              Organisez votre formation en sections et leçons
            </p>
          </div>
          {!isReadOnly && (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard/formateur/formations/create"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle formation
              </Link>
              <button
                onClick={() => setShowCreateSection(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une section
              </button>
            </div>
          )}
        </div>

        {/* Statistiques du curriculum */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Sections</p>
                <p className="text-lg font-bold text-blue-700">
                  {published.sections}/{formation.sections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Leçons</p>
                <p className="text-lg font-bold text-green-700">
                  {published.lessons}/{getTotalLessons()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Durée</p>
                <p className="text-lg font-bold text-purple-700">
                  {formatDuration(getTotalDuration())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">Gratuit</p>
                <p className="text-lg font-bold text-orange-700">
                  {formation.sections.filter(s => s.isFree).length} sections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des sections */}
      <div className="space-y-4">
        {formation.sections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune section créée
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par créer votre première section de cours
            </p>
            {!isReadOnly && (
              <button
                onClick={() => setShowCreateSection(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première section
              </button>
            )}
          </div>
        ) : (
          formation.sections
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((section, sectionIndex) => (
              <div
                key={section.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* En-tête de section */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Section {sectionIndex + 1}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center space-x-2 flex-1 text-left"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {section.lessons.length} leçon(s) • {formatDuration(
                              section.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)
                            )}
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        section.isFree 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.isFree ? 'Gratuit' : 'Payant'}
                      </span>
                      
                      {!isReadOnly && (
                        <>
                          <button
                            onClick={() => handleTogglePublish('section', section.id, section.isPublished)}
                            className={`p-2 rounded-lg transition-colors ${
                              section.isPublished
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={section.isPublished ? 'Dépublier' : 'Publier'}
                          >
                            {section.isPublished ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button 
                            onClick={() => handleEditSection(section)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifier la section"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteSection(section)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer la section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenu de la section (leçons) */}
                {expandedSections.has(section.id) && (
                  <div className="p-4">
                    {section.lessons.length === 0 ? (
                      <div className="text-center py-8">
                        <PlayCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-3">Aucune leçon dans cette section</p>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleCreateLesson(section.id)}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Ajouter une leçon
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {section.lessons
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <MoreHorizontal className="w-3 h-3 text-gray-400 cursor-move" />
                                <div className="flex items-center space-x-2">
                                  {lesson.type === "VIDEO" && <PlayCircle className="w-4 h-4 text-blue-500" />}
                                 
                                  {lesson.type === "QUIZ" && <div className="w-4 h-4 bg-purple-500 rounded-full" />}
                                  
                                  
                                  <span className="text-xs font-medium text-gray-500">
                                    {lessonIndex + 1}.
                                  </span>
                                  
                                  <div>
                                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                    <p className="text-sm text-gray-500">
                                      {lesson.type} • {formatDuration(lesson.duration)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  lesson.isFree 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {lesson.isFree ? 'Gratuit' : 'Payant'}
                                </span>
                                
                                <button 
                                  onClick={() => router.push(`/dashboard/formateur/formations/${formation.id}/lessons/${lesson.id}`)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="Voir la leçon"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                
                                {!isReadOnly && (
                                  <>
                                    <button
                                      onClick={() => handleTogglePublish('lesson', lesson.id, lesson.isPublished)}
                                      className={`p-1.5 rounded transition-colors ${
                                        lesson.isPublished
                                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                      title={lesson.isPublished ? 'Dépublier' : 'Publier'}
                                    >
                                      {lesson.isPublished ? (
                                        <Eye className="w-3 h-3" />
                                      ) : (
                                        <EyeOff className="w-3 h-3" />
                                      )}
                                    </button>
                                    
                                    <button 
                                      onClick={() => handleEditLesson(lesson)}
                                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                      title="Modifier la leçon"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    
                                    <button 
                                      onClick={() => handleDeleteLesson(lesson)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Supprimer la leçon"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        
                        {!isReadOnly && (
                          <button
                            onClick={() => handleCreateLesson(section.id)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                          >
                            <Plus className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-sm">Ajouter une leçon</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {/* Modals */}
      <CreateSectionModal
        isOpen={showCreateSection}
        onClose={() => setShowCreateSection(false)}
        formationId={formation.id}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      <CreateLessonModal
        isOpen={showCreateLesson}
        onClose={() => setShowCreateLesson(false)}
        sectionId={selectedSectionId}
        onSuccess={() => {
          window.location.reload();
        }}
              />

      {/* Modal d'édition de section */}
      {selectedSection && (
        <CreateSectionModal
          isOpen={showEditSection}
          onClose={() => {
            setShowEditSection(false);
            setSelectedSection(null);
          }}
          formationId={formation.id}
          editData={selectedSection}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Modal d'édition de leçon */}
      {selectedLesson && (
        <CreateLessonModal
          isOpen={showEditLesson}
          onClose={() => {
            setShowEditLesson(false);
            setSelectedLesson(null);
          }}
          sectionId={selectedSectionId}
          editData={selectedLesson}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

        {/* Dialogue de confirmation de suppression */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: 'section', id: '', title: '' })}
        onConfirm={confirmDelete}
        title={`Supprimer ${deleteDialog.type === 'section' ? 'la section' : 'la leçon'}`}
        description={
          deleteDialog.type === 'section'
            ? `Êtes-vous sûr de vouloir supprimer la section "${deleteDialog.title}" ? Cette action supprimera également toutes les leçons qu'elle contient et ne peut pas être annulée.`
            : `Êtes-vous sûr de vouloir supprimer la leçon "${deleteDialog.title}" ? Cette action ne peut pas être annulée.`
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
} 














































