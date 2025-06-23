"use client";

import { useState, useEffect } from "react";
import { Clock, Trophy, Target, Zap, CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCcw, Star } from "lucide-react";
import { Quiz, QuizQuestion } from "./QuizBuilder";

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (results: QuizResults) => void;
  onClose: () => void;
}

interface QuizResults {
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  answers: Record<string, any>;
  passed: boolean;
}

export default function QuizPlayer({ quiz, onComplete, onClose }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [streak, setStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = quiz.shuffleQuestions 
    ? [...quiz.questions].sort(() => Math.random() - 0.5)
    : quiz.questions;

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswer = currentQuestion.id in answers;

  // Timer
  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const checkAnswer = (question: QuizQuestion, userAnswer: any): boolean => {
    switch (question.type) {
      case "multiple_choice":
      case "true_false":
        return question.correctAnswer === userAnswer;
      
      case "open_ended":
        const keywords = (question.correctAnswer as string).toLowerCase().split(',').map(k => k.trim());
        const userText = userAnswer.toLowerCase();
        return keywords.some(keyword => userText.includes(keyword));
      
      default:
        return false;
    }
  };

  const calculateResults = (): QuizResults => {
    let score = 0;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer && checkAnswer(question, userAnswer)) {
        score += question.points;
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const passed = percentage >= quiz.passingScore;

    return {
      score,
      totalPoints,
      percentage,
      timeSpent,
      answers,
      passed,
    };
  };

  const handleNext = () => {
    if (hasAnswer) {
      const isCorrect = checkAnswer(currentQuestion, answers[currentQuestion.id]);
      if (isCorrect) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }

      if (currentQuestion.explanation) {
        setShowExplanation(true);
        return;
      }
    }

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = () => {
    const quizResults = calculateResults();
    setResults(quizResults);
    setShowResult(true);
    if (quiz.showResults) {
      onComplete(quizResults);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-orange-600";
    return "text-red-600";
  };

  // Écran de résultats
  if (showResult && results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          
          {/* Header des résultats */}
          <div className={`p-8 text-center ${
            results.passed 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-red-500 to-pink-500'
          } text-white rounded-t-2xl`}>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {results.passed ? (
                <Trophy className="w-10 h-10" />
              ) : (
                <Target className="w-10 h-10" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {results.passed ? "🎉 Félicitations !" : "🎯 Bon effort !"}
            </h2>
            <p className="text-lg opacity-90">
              {results.passed ? "Vous avez réussi le quiz !" : "Continuez à vous entraîner !"}
            </p>
          </div>

          {/* Détails des résultats */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(results.percentage)} mb-1`}>
                  {results.percentage}%
                </div>
                <div className="text-sm text-gray-600">Score final</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {results.score}/{results.totalPoints}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatTime(results.timeSpent)}
                </div>
                <div className="text-sm text-blue-600">Temps</div>
              </div>
            </div>

            {/* Badges de performance */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {results.percentage === 100 && (
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  🏆 Score parfait !
                </div>
              )}
              {results.timeSpent < (quiz.timeLimit || Infinity) * 60 * 0.5 && (
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  ⚡ Rapide comme l'éclair !
                </div>
              )}
              {streak >= 3 && (
                <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  🔥 Série de {streak} !
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Fermer
              </button>
              
              {!results.passed && quiz.maxAttempts > 1 && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Réessayer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header avec progression */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <p className="text-purple-100 text-sm">
                Question {currentQuestionIndex + 1} sur {questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {timeLeft !== null && (
                <div className="flex items-center space-x-2 bg-blue-500 bg-opacity-20 rounded-lg px-3 py-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-semibold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              
              {streak > 0 && (
                <div className="flex items-center space-x-1 bg-yellow-400 bg-opacity-20 rounded-lg px-3 py-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="font-semibold text-yellow-300">{streak}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Contenu de la question */}
        <div className="flex-1 p-8 overflow-y-auto">
          {showExplanation && currentQuestion.explanation ? (
            <ExplanationScreen 
              question={currentQuestion}
              userAnswer={answers[currentQuestion.id]}
              isCorrect={checkAnswer(currentQuestion, answers[currentQuestion.id])}
              onContinue={() => {
                setShowExplanation(false);
                if (isLastQuestion) {
                  handleSubmitQuiz();
                } else {
                  setCurrentQuestionIndex(prev => prev + 1);
                }
              }}
            />
          ) : (
            <QuestionDisplay 
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
            />
          )}
        </div>

        {/* Footer avec navigation */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </button>
            
            <div className="flex items-center space-x-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-purple-600'
                      : index < currentQuestionIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={!hasAnswer && !showExplanation}
              className="flex items-center px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLastQuestion ? 'Terminer' : 'Suivant'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher une question
function QuestionDisplay({ 
  question, 
  answer, 
  onAnswer 
}: {
  question: QuizQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {question.question}
        </h3>
        {question.points > 1 && (
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 mr-1" />
            {question.points} points
          </div>
        )}
      </div>

      {question.type === "multiple_choice" && (
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                answer === option
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={answer === option}
                onChange={() => onAnswer(option)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                answer === option
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {answer === option && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="text-lg">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === "true_false" && (
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
            answer === "true"
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="answer"
              value="true"
              checked={answer === "true"}
              onChange={() => onAnswer("true")}
              className="sr-only"
            />
            <div className="text-center">
              <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                answer === "true" ? 'text-green-600' : 'text-gray-400'
              }`} />
              <span className="text-lg font-semibold">Vrai</span>
            </div>
          </label>
          
          <label className={`flex items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
            answer === "false"
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="answer"
              value="false"
              checked={answer === "false"}
              onChange={() => onAnswer("false")}
              className="sr-only"
            />
            <div className="text-center">
              <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                answer === "false" ? 'text-red-600' : 'text-gray-400'
              }`} />
              <span className="text-lg font-semibold">Faux</span>
            </div>
          </label>
        </div>
      )}

      {question.type === "open_ended" && (
        <div>
          <textarea
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
            rows={4}
            placeholder="Saisissez votre réponse..."
          />
        </div>
      )}
    </div>
  );
}

// Composant pour afficher l'explication
function ExplanationScreen({ 
  question, 
  userAnswer, 
  isCorrect, 
  onContinue 
}: {
  question: QuizQuestion;
  userAnswer: any;
  isCorrect: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isCorrect ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {isCorrect ? (
          <CheckCircle className="w-10 h-10 text-green-600" />
        ) : (
          <XCircle className="w-10 h-10 text-red-600" />
        )}
      </div>
      
      <div>
        <h3 className={`text-2xl font-bold mb-2 ${
          isCorrect ? 'text-green-600' : 'text-red-600'
        }`}>
          {isCorrect ? '🎉 Correct !' : '❌ Incorrect'}
        </h3>
        <p className="text-gray-600">
          Votre réponse : <span className="font-semibold">{userAnswer}</span>
        </p>
        {!isCorrect && (
          <p className="text-gray-600">
            Bonne réponse : <span className="font-semibold text-green-600">
              {question.correctAnswer}
            </span>
          </p>
        )}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-xl text-left">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Explication</h4>
        <p className="text-blue-800">{question.explanation}</p>
      </div>
      
      <button
        onClick={onContinue}
        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
      >
        Continuer
      </button>
    </div>
  );
}