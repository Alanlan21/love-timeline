"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FloatingHearts from "@/components/FloatingHearts";
import Timeline from "@/components/Timeline";
import AddMemoryModal from "@/components/AddMemoryModal";
import Lightbox from "@/components/Lightbox";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface Memory {
  id: string;
  date: string;
  caption: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

interface NewMemory {
  date: string;
  caption: string;
  description?: string;
  image_url?: string;
}

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);

      // Verificar se as variáveis de ambiente estão configuradas
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.error("Variáveis de ambiente do Supabase não configuradas");
        showToast(
          "Erro de configuração: variáveis do Supabase não encontradas",
          "error"
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Erro ao buscar memórias:", error);
        showToast(`Erro ao carregar memórias: ${error.message}`, "error");
      } else {
        setMemories(data || []);
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar memórias:", err);
      showToast("Erro inesperado ao carregar memórias", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const authStatus = localStorage.getItem("coupleAuth");
    if (authStatus !== "true") {
      router.replace("/");
    } else {
      fetchMemories();
    }
  }, [router, fetchMemories]);

  async function addMemory(memory: NewMemory) {
    try {
      console.log("🔍 Iniciando adição de memória:", memory);

      // Verificar se as variáveis de ambiente estão configuradas
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.error("Variáveis de ambiente do Supabase não configuradas");
        showToast(
          "Erro de configuração: variáveis do Supabase não encontradas",
          "error"
        );
        return;
      }

      console.log("✅ Variáveis de ambiente OK");
      console.log("🔗 URL Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);

      const { data, error } = await supabase
        .from("memories")
        .insert([memory])
        .select();

      console.log("📊 Resposta do Supabase:", { data, error });

      if (error) {
        console.error("❌ Erro ao adicionar memória:", error);
        console.error("❌ Detalhes do erro:", JSON.stringify(error, null, 2));
        showToast(
          `Erro ao adicionar memória: ${error.message || "Erro desconhecido"}`,
          "error"
        );
        return;
      }

      if (data && data.length > 0) {
        console.log("✅ Memória adicionada com sucesso:", data[0]);
        setMemories((prev) =>
          [...prev, ...data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
        showToast("Memória adicionada com sucesso 💖", "success");
        setShowAddModal(false); // Fecha o modal automaticamente
      } else {
        console.error("❌ Nenhum dado retornado do Supabase");
        showToast("Erro: nenhum dado retornado", "error");
      }
    } catch (err) {
      console.error("❌ Erro inesperado ao adicionar memória:", err);
      console.error(
        "❌ Stack trace:",
        err instanceof Error ? err.stack : "N/A"
      );
      showToast("Erro inesperado ao adicionar memória", "error");
    }
  }

  function handleLogout() {
    localStorage.removeItem("coupleAuth");
    router.replace("/");
  }

  async function deleteMemory(id: string, imageUrl?: string) {
    try {
      // Remove da interface imediatamente para feedback visual
      setMemories((prev) => prev.filter((m) => m.id !== id));

      // Se tiver imagem, remove do storage primeiro (tenta ao máximo evitar órfãos)
      if (imageUrl) {
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

        const parsed = getStoragePathFromPublicUrl(imageUrl);
        // Fallback: se não conseguir extrair, tenta usar apenas o último segmento como chave na bucket padrão
        const bucket = parsed?.bucket ?? "memories";
        const key = parsed?.key ?? imageUrl.split("/").pop()!;

        if (key) {
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([key]);
          if (storageError) {
            console.error("Erro ao remover do storage:", storageError);
            // Não interrompe o fluxo; segue para remover do banco para não quebrar UX
          }
        }
      }

      // Exclui do banco
      const { error: dbError } = await supabase
        .from("memories")
        .delete()
        .eq("id", id);
      if (dbError) throw dbError;

      showToast("Memória excluída com sucesso 🗑️", "success");
    } catch (err) {
      console.error("Erro ao excluir memória:", err);
      showToast("Erro ao excluir memória 😢", "error");
      // Se deu erro, recarrega as memórias para restaurar o estado
      fetchMemories();
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-300 via-rose-100 to-purple-200">
      <FloatingHearts />

      <header className="relative z-10 p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-rose-900 mb-2 font-[cursive]">
            Alan & Mari Timeline
          </h1>
          <p className="text-pink-500/20 text-lg mb-6">Nossos momentinhos ✨</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-pink-300 to-rose-300 text-pink-900 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-pink-500/30 transition-all duration-300 flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Adicionar Memória
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/planner")}
              className="bg-white/20 text-pink-900 px-6 py-3 rounded-full font-semibold backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              Planner
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-white/20 text-pink-900 px-6 py-3 rounded-full font-semibold backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              Sair
            </motion.button>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 pb-20">
        {loading ? (
          <div className="text-center text-white/70 py-20">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Carregando memórias...
            </div>
          </div>
        ) : (
          <Timeline
            memories={memories}
            onImageClick={setSelectedImage}
            onDelete={deleteMemory}
            onEdit={(m) => setEditingMemory(m)}
          />
        )}
      </main>

      <AnimatePresence>
        {showAddModal && (
          <AddMemoryModal
            mode="add"
            onClose={() => setShowAddModal(false)}
            onAdd={(memory: NewMemory) => addMemory(memory)}
          />
        )}

        {editingMemory && (
          <AddMemoryModal
            mode="edit"
            initialData={editingMemory}
            onClose={() => setEditingMemory(null)}
            onAdd={() => {}}
            onUpdate={(updated: Memory) => {
              setMemories((prev) =>
                prev.map((m) => (m.id === updated.id ? updated : m))
              );
              setEditingMemory(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <Lightbox
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
