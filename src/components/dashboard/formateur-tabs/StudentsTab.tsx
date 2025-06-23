"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  BarChart3, 
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Send
} from "lucide-react";

interface Formation {
  id: string;
  title: string;
  userFormations?: UserFormation[];
}

interface UserFormation {
  id: string;
  progress: number;
  completedAt: Date | null;
  enrolledAt?: Date;
  lastAccessedAt?: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface StudentsTabProps {
  formation: Formation;
  isReadOnly?: boolean;
}

export default function StudentsTab({ formation, isReadOnly = false }: StudentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "progress" | "date" | "enrolled">("name");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in-progress" | "not-started">("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserFormation | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const students = formation.userFormations || [];
  
  // Filtrer et trier les étudiants
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = searchTerm === "" || 
        (student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "completed" && student.completedAt !== null) ||
        (filterStatus === "in-progress" && student.progress > 0 && student.completedAt === null) ||
        (filterStatus === "not-started" && student.progress === 0);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.user?.name || "").localeCompare(b.user?.name || "");
        case "progress":
          return b.progress - a.progress;
        case "date":
          if (!a.completedAt && !b.completedAt) return 0;
          if (!a.completedAt) return 1;
          if (!b.completedAt) return -1;
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case "enrolled":
          const aDate = a.enrolledAt || new Date(0);
          const bDate = b.enrolledAt || new Date(0);
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        default:
          return 0;
      }
    });

  const completedStudents = students.filter(s => s.completedAt !== null).length;
  const inProgressStudents = students.filter(s => s.progress > 0 && s.completedAt === null).length;
  const notStartedStudents = students.filter(s => s.progress === 0).length;
  const averageProgress = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
    : 0;

  const formatDate = (date: Date | null) => {
    if (!date) return "Non défini";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600 bg-green-100";
    if (progress >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusIcon = (student: UserFormation) => {
    if (student.completedAt) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (student.progress > 0) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleExportData = () => {
    const csvContent = [
      ["Nom", "Email", "Progression (%)", "Statut", "Date d'inscription", "Date de fin"],
      ...filteredStudents.map(student => [
        student.user?.name || "Non défini",
        student.user?.email || "",
        student.progress.toString(),
        student.completedAt ? "Terminé" : student.progress > 0 ? "En cours" : "Non commencé",
        formatDate(student.enrolledAt || null),
        formatDate(student.completedAt)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `etudiants_${formation.title.replace(/\s+/g, "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageContent.trim()) return;
    
    const recipients = selectedStudents.length > 0 
      ? selectedStudents 
      : filteredStudents.map(s => s.id);
    
    try {
      // Ici vous pouvez ajouter l'appel API pour envoyer le message
      console.log("Envoi du message:", {
        subject: messageSubject,
        content: messageContent,
        recipients
      });
      
      setShowMessageModal(false);
      setMessageSubject("");
      setMessageContent("");
      setSelectedStudents([]);
      
      // Afficher un message de succès
      alert("Message envoyé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      alert("Erreur lors de l'envoi du message");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Apprenants inscrits
            </h2>
            <p className="text-gray-600 mt-1">
              Suivez les progrès et gérez vos étudiants
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedStudents.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedStudents.length} sélectionné(s)
                </span>
                <button
                  onClick={() => setSelectedStudents([])}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isReadOnly && (
              <>
                <button 
                  onClick={handleExportData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </button>
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Envoyer un message
                </button>
              </>
            )}
          </div>
        </div>

        {/* Statistiques améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Apprenants</p>
                <p className="text-2xl font-bold text-blue-900">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Terminé</p>
                <p className="text-2xl font-bold text-green-900">{completedStudents}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">En cours</p>
                <p className="text-2xl font-bold text-yellow-900">{inProgressStudents}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Non commencé</p>
                <p className="text-2xl font-bold text-gray-900">{notStartedStudents}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Progression Moy.</p>
                <p className="text-2xl font-bold text-purple-900">{averageProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche améliorés */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Terminé</option>
                  <option value="in-progress">En cours</option>
                  <option value="not-started">Non commencé</option>
                </select>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Trier par nom</option>
                <option value="progress">Trier par progression</option>
                <option value="date">Trier par date de fin</option>
                <option value="enrolled">Trier par inscription</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des étudiants améliorée */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {filteredStudents.length > 0 ? (
          <div className="overflow-hidden">
            {/* En-tête du tableau */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-4">Étudiant</div>
                <div className="col-span-2">Progression</div>
                <div className="col-span-2">Statut</div>
                <div className="col-span-2">Dernière activité</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Lignes des étudiants */}
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    selectedStudents.includes(student.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    {/* Informations étudiant */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {student.user?.name?.[0]?.toUpperCase() || student.user?.email?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.user?.name || "Nom non défini"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.user?.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Inscrit le {formatDate(student.enrolledAt || null)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progression */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {student.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(student)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProgressColor(student.progress)}`}
                        >
                          {student.completedAt ? "Terminé" : student.progress > 0 ? "En cours" : "Non commencé"}
                        </span>
                      </div>
                    </div>

                    {/* Dernière activité */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(student.lastAccessedAt || student.completedAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedStudents([student.id]);
                            setShowMessageModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                          title="Contacter"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun étudiant inscrit
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Les étudiants qui s'inscriront à cette formation apparaîtront ici. 
              Vous pourrez suivre leur progression et les contacter.
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche ou filtres
            </p>
          </div>
        )}
      </div>

      {/* Modal de détails de l'étudiant */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Détails de l'étudiant
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedStudent.user?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedStudent.user?.name || "Nom non défini"}
                  </h4>
                  <p className="text-gray-600">{selectedStudent.user?.email}</p>
                </div>
              </div>

              {/* Progression détaillée */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Progression</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progression globale</span>
                    <span className="font-semibold text-gray-900">{selectedStudent.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      style={{ width: `${selectedStudent.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Informations temporelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Date d'inscription</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {formatDate(selectedStudent.enrolledAt || null)}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Dernière activité</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {formatDate(selectedStudent.lastAccessedAt || selectedStudent.completedAt)}
                  </p>
                </div>
              </div>

              {selectedStudent.completedAt && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Formation terminée</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Terminée le {formatDate(selectedStudent.completedAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setSelectedStudents([selectedStudent.id]);
                  setShowDetailsModal(false);
                  setShowMessageModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Contacter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de message */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Envoyer un message
                </h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedStudents.length > 0 
                  ? `Message à ${selectedStudents.length} étudiant(s) sélectionné(s)`
                  : `Message à tous les étudiants (${filteredStudents.length})`
                }
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Sujet du message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Votre message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageSubject.trim() || !messageContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}