"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users, Clock, DollarSign, TrendingUp, Eye, Star, Award } from "lucide-react";

interface DashboardStats {
  totalFormations: number;
  publishedFormations: number;
  totalStudents: number;
  totalRevenue: number;
  totalLessons: number;
  completionRate: number;
  averageRating: number;
  viewsThisMonth: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'completion' | 'review';
  studentName: string;
  formationTitle: string;
  timestamp: Date;
  rating?: number;
}

export default function FormateurDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFormations: 0,
    publishedFormations: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalLessons: 0,
    completionRate: 0,
    averageRating: 0,
    viewsThisMonth: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simuler des données en attendant l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalFormations: 8,
          publishedFormations: 6,
          totalStudents: 142,
          totalRevenue: 4250.00,
          totalLessons: 34,
          completionRate: 78,
          averageRating: 4.6,
          viewsThisMonth: 1230,
        });

        setRecentActivity([
          {
            id: '1',
            type: 'enrollment',
            studentName: 'Marie Dupont',
            formationTitle: 'React pour Débutants',
            timestamp: new Date('2024-01-15T10:30:00'),
          },
          {
            id: '2',
            type: 'completion',
            studentName: 'Jean Martin',
            formationTitle: 'Design System avec Figma',
            timestamp: new Date('2024-01-14T16:45:00'),
          },
          {
            id: '3',
            type: 'review',
            studentName: 'Sophie Laurent',
            formationTitle: 'SEO Avancé',
            timestamp: new Date('2024-01-14T14:20:00'),
            rating: 5,
          },
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Formations",
      value: `${stats.publishedFormations}/${stats.totalFormations}`,
      subtitle: "publiées",
      icon: BookOpen,
      color: "blue",
      trend: "+2 ce mois",
    },
    {
      title: "Étudiants",
      value: stats.totalStudents.toLocaleString(),
      subtitle: "inscrits",
      icon: Users,
      color: "green",
      trend: "+12 cette semaine",
    },
    {
      title: "Revenus",
      value: `€${stats.totalRevenue.toLocaleString()}`,
      subtitle: "ce mois",
      icon: DollarSign,
      color: "yellow",
      trend: "+15% vs mois dernier",
    },
    {
      title: "Taux de réussite",
      value: `${stats.completionRate}%`,
      subtitle: "moyen",
      icon: Award,
      color: "purple",
      trend: "+3% cette semaine",
    },
    {
      title: "Note moyenne",
      value: stats.averageRating.toFixed(1),
      subtitle: "sur 5",
      icon: Star,
      color: "orange",
      trend: "Excellent",
    },
    {
      title: "Vues",
      value: stats.viewsThisMonth.toLocaleString(),
      subtitle: "ce mois",
      icon: Eye,
      color: "indigo",
      trend: "+8% vs mois dernier",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return '🎓';
      case 'completion': return '🏆';
      case 'review': return '⭐';
      default: return '📝';
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'enrollment':
        return `s'est inscrit(e) à`;
      case 'completion':
        return `a terminé`;
      case 'review':
        return `a noté ${activity.rating}/5`;
      default:
        return 'a interagi avec';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg border ${getColorClasses(card.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{card.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">{activity.studentName}</span>
                  {' '}{getActivityText(activity)}{' '}
                  <span className="font-medium text-blue-600">{activity.formationTitle}</span>
                </p>
                <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique de progression (simulé) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression ce mois</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Nouvelles inscriptions</span>
              <span>78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Taux de completion</span>
              <span>82%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Satisfaction étudiants</span>
              <span>92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 