"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, PlayCircle, FileText, Clock, DollarSign } from "lucide-react";
import CreateSectionModal from "./CreateSectionModal";

interface Formation {
  id: string;
  title: string;
  sections?: Section[];
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isPublished: boolean;
  isFree: boolean;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  duration: number;
  type: string;
  isPublished: boolean;
  isFree: boolean;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
}

interface SectionsTabProps {
  formation: Formation;
  stats: {
    totalLessons: number;
    publishedLessons: number;
    totalDuration: number;
    isComplete: boolean;
  };
}

export default function SectionsTab({ formation, stats }: SectionsTabProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCreateSection, setShowCreateSection] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "TEXT":
        return <FileText className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Sections & Leçons
            </h2>
            <p className="text-gray-600">
              Organisez votre contenu en sections et leçons
            </p>
          </div>
          <button
            onClick={() => setShowCreateSection(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une section
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <PlayCircle className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Leçons</p>
                <p className="text-lg font-semibold">{stats.totalLessons}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Publiées</p>
                <p className="text-lg font-semibold">{stats.publishedLessons}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Durée totale</p>
                <p className="text-lg font-semibold">{formatDuration(stats.totalDuration)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Sections</p>
                <p className="text-lg font-semibold">{formation.sections?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des sections */}
      <div className="space-y-4">
        {formation.sections && formation.sections.length > 0 ? (
          formation.sections
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((section, sectionIndex) => (
              <div
                key={section.id}
                className="bg-white border border-gray-200 rounded-lg"
              >
                {/* En-tête de section */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center space-x-3 text-left flex-1"
                    >
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                        {sectionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {section.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{section.lessons?.length || 0} leçons</span>
                          <span>
                            {formatDuration(
                              section.lessons?.reduce((acc, lesson) => acc + lesson.duration, 0) || 0
                            )}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        section.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {section.isPublished ? "Publiée" : "Brouillon"}
                    </span>
                    
                    {section.isFree && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Gratuit
                      </span>
                    )}

                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Leçons de la section */}
                {expandedSections.has(section.id) && (
                  <div className="p-4">
                    {section.lessons && section.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {section.lessons
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="flex items-center justify-center w-6 h-6 bg-white rounded text-xs font-medium">
                                  {lessonIndex + 1}
                                </div>
                                {getTypeIcon(lesson.type)}
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {lesson.title}
                                  </h4>
                                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                    <span>{formatDuration(lesson.duration)}</span>
                                    <span>{lesson.type}</span>
                                    {lesson.muxAssetId && (
                                      <span className="text-green-600">Vidéo prête</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {lesson.isPublished ? (
                                  <Eye className="w-4 h-4 text-green-600" title="Publiée" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400" title="Brouillon" />
                                )}
                                
                                {lesson.isFree && (
                                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                    Gratuit
                                  </span>
                                )}

                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>Aucune leçon dans cette section</p>
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Ajouter une leçon
                        </button>
                      </div>
                    )}

                    {/* Ajouter une leçon */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter une leçon
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune section créée
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par créer votre première section pour organiser votre contenu
            </p>
            <button
              onClick={() => setShowCreateSection(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première section
            </button>
          </div>
        )}
      </div>

      {/* Modal de création de section */}
      <CreateSectionModal
        isOpen={showCreateSection}
        onClose={() => setShowCreateSection(false)}
        formationId={formation.id}
        onSuccess={() => {
          // Recharger la page pour voir les changements
          window.location.reload();
        }}
      />
    </div>
  );
} 