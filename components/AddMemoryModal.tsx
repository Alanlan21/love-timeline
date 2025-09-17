"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Upload, Calendar, Type, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastProvider";

interface Memory {
  id: string;
  date: string;
  caption: string;
  description?: string;
  image_url?: string;
}

interface NewMemory {
  date: string;
  caption: string;
  description?: string;
  image_url?: string;
}

interface AddMemoryModalProps {
  onClose: () => void;
  onAdd: (memory: NewMemory) => void;
  onUpdate?: (memory: Memory) => void;
  mode: "add" | "edit";
  initialData?: Memory;
}

export default function AddMemoryModal({
  onClose,
  onAdd,
  onUpdate,
  mode,
  initialData,
}: AddMemoryModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    caption: "",
    description: "",
    imageFile: null as File | null,
    imageUrl: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Pré-preencher no modo edição
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        date: initialData.date,
        caption: initialData.caption,
        description: initialData.description || "",
        imageFile: null,
        imageUrl: initialData.image_url || "",
      });
      setPreview(initialData.image_url || null);
    }
  }, [mode, initialData]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 2000) {
        showToast("Arquivo muito grande! Máximo 10MB.", "error");
        return;
      }
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.date || !formData.caption) {
      showToast("Preencha a data e a legenda!", "error");
      return;
    }

    setIsLoading(true);
    let imageUrl = formData.imageUrl;

    // Upload da imagem (se houver)
    if (formData.imageFile) {
      const fileExt = formData.imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, formData.imageFile, { upsert: true });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        showToast("Erro ao enviar imagem 😢", "error");
        setIsLoading(false);
        return;
      }

      const { data } = supabase.storage.from("memories").getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const newMemory = {
      date: formData.date,
      caption: formData.caption,
      description: formData.description,
      image_url: imageUrl,
    };

    if (mode === "add") {
      // Para modo add, apenas chama a função onAdd
      // A inserção será feita pela função addMemory na página principal
      onAdd(newMemory);
    } else if (mode === "edit" && onUpdate && initialData) {
      const { data, error } = await supabase
        .from("memories")
        .update(newMemory)
        .eq("id", initialData.id) // usa o id original
        .select();

      if (error) {
        console.error("Erro ao atualizar memória:", error);
        showToast("Erro ao atualizar memória 😢", "error");
      } else if (data) {
        onUpdate(data[0]);
        showToast("Memória atualizada com sucesso ✏️", "success");

        // Se a imagem foi trocada, tenta apagar a antiga do storage
        const oldUrl = initialData.image_url;
        const changedImage =
          formData.imageFile && oldUrl && oldUrl !== imageUrl;
        if (changedImage) {
          const getStoragePathFromPublicUrl = (
            url: string
          ): { bucket: string; key: string } | null => {
            try {
              const parsed = new URL(url);
              const marker = "/storage/v1/object/public/";
              const idx = parsed.pathname.indexOf(marker);
              if (idx === -1) return null;
              const pathAfter = parsed.pathname.substring(idx + marker.length); // bucket/key
              const [bucket, ...rest] = pathAfter.split("/");
              const key = rest.join("/");
              if (!bucket || !key) return null;
              return { bucket, key };
            } catch {
              return null;
            }
          };

          const parsed = getStoragePathFromPublicUrl(oldUrl);
          const bucket = parsed?.bucket ?? "memories";
          const key = parsed?.key ?? oldUrl.split("/").pop()!;
          if (key) {
            const { error: removeError } = await supabase.storage
              .from(bucket)
              .remove([key]);
            if (removeError) {
              console.error(
                "Falha ao remover imagem antiga do storage:",
                removeError
              );
            }
          }
        }
      }
    }

    setIsLoading(false);
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-pink-700/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-[cursive]">
            {mode === "add" ? "Nova Memória" : "Editar Memória"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de imagem */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Foto da memória
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="block w-full h-32 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:border-white/50"
              >
                <div className="flex items-center justify-center w-full h-full">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-white/60">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Clique para adicionar uma foto</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data da memória *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          {/* Legenda */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Legenda
            </label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, caption: e.target.value }))
              }
              placeholder="Conta mais..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder=""
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-60"
            >
              {isLoading
                ? "Salvando..."
                : mode === "add"
                ? "Salvar Memória"
                : "Atualizar"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
