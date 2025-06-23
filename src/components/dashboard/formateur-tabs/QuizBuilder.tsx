"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Move, Clock, Trophy, Eye, Save } from "lucide-react";

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "open_ended" | "image_choice" | "code" | "matching";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  timeLimit?: number;
  imageUrl?: string;
}

export interface Quiz {
  id?: string;
  title: string;
  description: string;
  timeLimit?: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  passingScore: number;
  maxAttempts: number;
  questions: QuizQuestion[];
}

interface QuizBuilderProps {
  initialQuiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

const QUESTION_TYPES = [
  { 
    type: "multiple_choice", 
    label: "Choix Multiple", 
    icon: "🔘", 
    description: "Question avec plusieurs options, une seule bonne réponse" 
  },
  { 
    type: "true_false", 
    label: "Vrai/Faux", 
    icon: "✅", 
    description: "Question binaire simple" 
  },
  { 
    type: "open_ended", 
    label: "Question Ouverte", 
    icon: "✍️", 
    description: "Réponse libre en texte" 
  },
  { 
    type: "image_choice", 
    label: "Choix avec Images", 
    icon: "🖼️", 
    description: "Options visuelles avec images" 
  },
  { 
    type: "code", 
    label: "Code/Programmation", 
    icon: "💻", 
    description: "Question de code avec syntaxe highlighting" 
  },
  { 
    type: "matching", 
    label: "Correspondance", 
    icon: "🔗", 
    description: "Associer éléments entre eux" 
  },
] as const;

export default function QuizBuilder({ initialQuiz, onSave, onCancel }: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz || {
    title: "",
    description: "",
    timeLimit: 30,
    shuffleQuestions: false,
    showResults: true,
    passingScore: 70,
    maxAttempts: 3,
    questions: []
  });

  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = (type: QuizQuestion["type"]) => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      type,
      question: "",
      points: 1,
      correctAnswer: type === "true_false" ? "true" : "",
      ...(type === "multiple_choice" && { options: ["", "", "", ""] }),
      ...(type === "image_choice" && { options: ["", "", "", ""] }),
      ...(type === "matching" && { options: ["", ""] }),
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (id: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    }
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...quiz.questions];
    const [removed] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, removed);
    
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const getTotalPoints = () => {
    return quiz.questions.reduce((sum, q) => sum + q.points, 0);
  };

  const getEstimatedTime = () => {
    const baseTime = quiz.questions.length * 2;
    const complexityBonus = quiz.questions.reduce((sum, q) => {
      const bonus = q.type === "code" ? 3 : q.type === "open_ended" ? 2 : 0;
      return sum + bonus;
    }, 0);
    return baseTime + complexityBonus;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">✨ Quiz Builder</h2>
              <p className="text-purple-100">Créez des quiz interactifs extraordinaires</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="opacity-90">{quiz.questions.length} questions</p>
                <p className="opacity-90">{getTotalPoints()} points • ~{getEstimatedTime()} min</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center px-4 py-2 bg-blue-500 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={() => onSave(quiz)}
                  className="flex items-center px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex w-full pt-24">
          
          {/* Left Sidebar - Quiz Settings */}
          <div className="w-80 bg-gray-50 p-6 overflow-y-auto border-r">
            <div className="space-y-6">
              
              {/* Quiz Info */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-800">📋 Informations du Quiz</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre du quiz
                    </label>
                    <input
                      type="text"
                      value={quiz.title}
                      onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: Quiz JavaScript Avancé"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={quiz.description}
                      onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Testez vos connaissances..."
                    />
                  </div>
                </div>
              </div>

              {/* Quiz Settings */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-800">⚙️ Paramètres</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Temps limite (min)
                      </label>
                      <input
                        type="number"
                        value={quiz.timeLimit || ""}
                        onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || undefined }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        min="1"
                        max="180"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Score minimum (%)
                      </label>
                      <input
                        type="number"
                        value={quiz.passingScore}
                        onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tentatives max
                    </label>
                    <input
                      type="number"
                      value={quiz.maxAttempts}
                      onChange={(e) => setQuiz(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quiz.shuffleQuestions}
                        onChange={(e) => setQuiz(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Mélanger les questions</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quiz.showResults}
                        onChange={(e) => setQuiz(prev => ({ ...prev, showResults: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Afficher les résultats</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Add Question Types */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-800">➕ Ajouter une Question</h3>
                
                <div className="space-y-2">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => addQuestion(type.type)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{type.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-800 group-hover:text-purple-700">
                            {type.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-semibold mb-3 text-gray-800">📊 Statistiques</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-semibold">{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points totaux:</span>
                    <span className="font-semibold">{getTotalPoints()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temps estimé:</span>
                    <span className="font-semibold">~{getEstimatedTime()} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulté:</span>
                    <span className="font-semibold">
                      {quiz.questions.length < 5 ? "Facile" : 
                       quiz.questions.length < 15 ? "Moyen" : "Difficile"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Questions List */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  📝 Questions ({quiz.questions.length})
                </h3>
              </div>

              {quiz.questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🤔</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune question pour le moment
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Commencez par ajouter votre première question depuis la sidebar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div 
                      key={question.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedQuestion === question.id
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedQuestion(question.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">
                                {QUESTION_TYPES.find(t => t.type === question.type)?.icon}
                              </span>
                              <span className="text-sm font-medium text-gray-600">
                                {QUESTION_TYPES.find(t => t.type === question.type)?.label}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {question.points} pt{question.points > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-gray-900 mb-2">
                              {question.question || <span className="text-gray-400 italic">Question sans titre...</span>}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(question.id);
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Question Editor */}
          {selectedQuestion && (
            <div className="w-96 bg-gray-50 p-6 overflow-y-auto border-l">
              <QuestionEditor
                question={quiz.questions.find(q => q.id === selectedQuestion)!}
                onUpdate={(updates) => updateQuestion(selectedQuestion, updates)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Éditeur détaillé pour une question
function QuestionEditor({ 
  question, 
  onUpdate 
}: {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-800">
          ✏️ Édition de la Question
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <textarea
              value={question.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Saisissez votre question..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps (sec)
              </label>
              <input
                type="number"
                value={question.timeLimit || ""}
                onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="10"
                max="300"
                placeholder="Auto"
              />
            </div>
          </div>

          {/* Éditeur spécifique par type */}
          {question.type === "multiple_choice" && (
            <MultipleChoiceEditor question={question} onUpdate={onUpdate} />
          )}
          
          {question.type === "true_false" && (
            <TrueFalseEditor question={question} onUpdate={onUpdate} />
          )}
          
          {question.type === "open_ended" && (
            <OpenEndedEditor question={question} onUpdate={onUpdate} />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explication (optionnel)
            </label>
            <textarea
              value={question.explanation || ""}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Explication de la réponse..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Éditeurs spécialisés pour chaque type de question
function MultipleChoiceEditor({ 
  question, 
  onUpdate 
}: {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
}) {
  const options = question.options || ["", "", "", ""];
  
  const updateOptions = (newOptions: string[]) => {
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    updateOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      updateOptions(options.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Options de réponse
      </label>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              name="correct-answer"
              checked={question.correctAnswer === option}
              onChange={() => onUpdate({ correctAnswer: option })}
              className="text-green-600 focus:ring-green-500"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                updateOptions(newOptions);
                if (question.correctAnswer === option) {
                  onUpdate({ correctAnswer: e.target.value });
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder={`Option ${index + 1}...`}
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        
        {options.length < 6 && (
          <button
            onClick={addOption}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
          >
            + Ajouter une option
          </button>
        )}
      </div>
    </div>
  );
}

function TrueFalseEditor({ 
  question, 
  onUpdate 
}: {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Bonne réponse
      </label>
      
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="true-false"
            checked={question.correctAnswer === "true"}
            onChange={() => onUpdate({ correctAnswer: "true" })}
            className="text-green-600 focus:ring-green-500"
          />
          <span className="ml-2 text-green-600 font-medium">✅ Vrai</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="radio"
            name="true-false"
            checked={question.correctAnswer === "false"}
            onChange={() => onUpdate({ correctAnswer: "false" })}
            className="text-red-600 focus:ring-red-500"
          />
          <span className="ml-2 text-red-600 font-medium">❌ Faux</span>
        </label>
      </div>
    </div>
  );
}

function OpenEndedEditor({ 
  question, 
  onUpdate 
}: {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Mots-clés de réponse attendus (séparés par des virgules)
      </label>
      <input
        type="text"
        value={question.correctAnswer as string}
        onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        placeholder="Ex: JavaScript, React, component..."
      />
      <p className="text-xs text-gray-500 mt-1">
        Les réponses contenant ces mots-clés seront considérées comme correctes
      </p>
    </div>
  );
} 