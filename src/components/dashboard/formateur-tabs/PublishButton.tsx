'use client'
import { useState } from 'react';
import { Award, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PublishButtonProps {
  formationId: string;
  isPublished: boolean;
  isComplete: boolean;
  onStatusChange?: (newStatus: boolean) => void;
}

export function PublishButton({ formationId, isPublished, isComplete, onStatusChange }: PublishButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isPublished);

  const handleTogglePublication = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/formations/${formationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut de publication');
      }

      const newStatus = !currentStatus;
      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);
      
      toast.success(
        newStatus 
          ? 'Formation publiée avec succès' 
          : 'Formation dépubliée avec succès'
      );
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut de publication');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || (!isComplete && !currentStatus);

  return (
    <button 
      onClick={handleTogglePublication}
      disabled={isDisabled}
      title={
        !isComplete && !currentStatus 
          ? "Complétez tous les champs requis pour publier la formation"
          : currentStatus 
            ? "Dépublier cette formation"
            : "Publier cette formation"
      }
      className={`px-6 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-lg ${
        currentStatus
          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          : isComplete 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
      } ${
        isDisabled 
          ? 'opacity-75 cursor-not-allowed' 
          : 'transform hover:scale-105'
      }`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Mise à jour...
        </div>
      ) : currentStatus ? (
        <>
          <EyeOff className="w-4 h-4 mr-2 inline" />
          Dépublier
        </>
      ) : (
        <>
          <Award className="w-4 h-4 mr-2 inline" />
          Publier
        </>
      )}
    </button>
  );
} 