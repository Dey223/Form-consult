"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Upload, File, Users, BookOpen } from "lucide-react";
import BasicInfoTab from "./BasicInfoTab";
import SectionsTab from "./SectionsTab";
import ResourcesTab from "./ResourcesTab";
import StudentsTab from "./StudentsTab";
import CurriculumTab from "./CurriculumTab";

interface Formation {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number | null;
  isActive: boolean;
  isPublished: boolean;
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
  orderIndex: number;
  duration: number;
  type: string;
  isPublished: boolean;
  isFree: boolean;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  videoUrl: string | null;
  muxData?: MuxData;
}

interface MuxData {
  id: string;
  assetId: string;
  playbackId: string | null;
}

interface UserFormation {
  id: string;
  progress: number;
  completedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Category {
  label: string;
  value: string;
  subCategories: { label: string; value: string }[];
}

interface Level {
  label: string;
  value: string;
}

interface EditFormationTabsProps {
  formation: Formation;
  sections: Section[];
  students: UserFormation[];
  activeTab: string;
  categories: Category[];
  levels: Level[];
  isReadOnly?: boolean;
}

export default function EditFormationTabs({ 
  formation, 
  sections,
  students,
  activeTab,
  categories,
  levels,
  isReadOnly = false
}: EditFormationTabsProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case "basics":
        return (
          <BasicInfoTab 
            formation={formation} 
            categories={categories}
            levels={levels}
            isReadOnly={isReadOnly}
          />
        );
      case "sections":
        return (
          <CurriculumTab 
            formation={{
              ...formation,
              sections: sections as any
            }}
            isReadOnly={isReadOnly}
          />
        );
      case "resources":
        return <ResourcesTab formation={formation} isReadOnly={isReadOnly} />;
      case "apprenants":
        return <StudentsTab formation={{...formation, userFormations: students}} isReadOnly={isReadOnly} />;
      default:
        return (
          <BasicInfoTab 
            formation={formation} 
            categories={categories}
            levels={levels}
            isReadOnly={isReadOnly}
          />
        );
    }
  };

  return <div>{renderTabContent()}</div>;
} 