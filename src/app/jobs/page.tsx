"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import JobImageUpload from "@/components/JobImageUpload";

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Debés iniciar sesión para publicar un trabajo.");

      const { error: insertError } = await supabase.from("jobs").insert({
        title,
        description,
        category,
        location,
        images: imageUrls, // Array de URLs de UploadThing
        user_id: user.id,
      });

      if (insertError) throw insertError;

      router.push("/jobs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al publicar el trabajo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Publicar trabajo</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ej: Plomero urgente zona norte"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Describí el trabajo en detalle..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Categoría y Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Plomería"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ubicación
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Buenos Aires"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Subida de imágenes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Fotos del trabajo{" "}
            <span className="font-normal text-gray-400">(opcional, hasta 4)</span>
          </label>
          <JobImageUpload
            value={imageUrls}
            onChange={setImageUrls}
            maxImages={4}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Publicando..." : "Publicar trabajo"}
        </button>
      </form>
    </div>
  );
}
