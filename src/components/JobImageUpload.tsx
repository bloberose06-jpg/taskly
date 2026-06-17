"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { supabase } from "@/lib/supabase/client";

interface JobImageUploadProps {
  value: string[]; // URLs actuales de las imágenes
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function JobImageUpload({
  value = [],
  onChange,
  maxImages = 4,
}: JobImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Preview de imágenes ya subidas */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
            >
              <Image
                src={url}
                alt="Imagen del trabajo"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Eliminar imagen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone solo si no se alcanzó el límite */}
      {value.length < maxImages && (
        <UploadDropzone
          endpoint="jobImageUploader"
          headers={async () => {
            const { data } = await supabase.auth.getSession();
            return {
              authorization: `Bearer ${data.session?.access_token ?? ""}`,
            };
          }}
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            const newUrls = res.map((file) => file.ufsUrl);
            onChange([...value, ...newUrls]);
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            alert(`Error al subir: ${error.message}`);
          }}
          appearance={{
            container:
              "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors",
            label: "text-sm text-gray-600",
            allowedContent: "text-xs text-gray-400 mt-1",
            button:
              "mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ut-uploading:opacity-50",
          }}
          content={{
            label: isUploading
              ? "Subiendo..."
              : `Arrastrá fotos aquí o hacé clic para seleccionar`,
            allowedContent: `Imágenes hasta 8MB · Máximo ${maxImages - value.length} más`,
          }}
        />
      )}

      {value.length >= maxImages && (
        <p className="text-center text-xs text-gray-400">
          Límite de {maxImages} imágenes alcanzado.
        </p>
      )}
    </div>
  );
}
