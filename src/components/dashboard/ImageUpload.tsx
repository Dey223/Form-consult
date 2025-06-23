"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Trash2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url?: string) => void;
  endpoint: "formationImage" | "courseResources";
}

export default function ImageUpload({
  value,
  onChange,
  endpoint,
}: ImageUploadProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    onChange("");
    setIsDeleting(false);
  };

  if (value) {
    return (
      <div className="relative w-full h-60">
        <Image
          alt="Formation image"
          src={value}
          fill
          className="object-cover rounded-lg"
        />
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 disabled:opacity-50"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          if (res?.[0]) {
            onChange(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          alert(`Erreur d'upload: ${error.message}`);
        }}
        appearance={{
          button: "bg-blue-600 hover:bg-blue-700",
          allowedContent: "text-gray-600",
          label: "text-blue-600 hover:text-blue-700",
        }}
      />
    </div>
  );
} 