/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trash, MessageCircle, Pencil } from "lucide-react";

interface Memory {
  id: string;
  date: string;
  caption: string;
  description?: string;
  image_url?: string;
}

interface TimelineProps {
  memories: Memory[];
  onImageClick: (image: string) => void;
  onDelete: (id: string, imageUrl?: string) => void;
  onEdit: (memory: Memory) => void;
}

export default function Timeline({
  memories,
  onImageClick,
  onDelete,
  onEdit,
}: TimelineProps) {
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    imageUrl?: string;
  } | null>(null);
  function handleDeleteClick(id: string, imageUrl?: string) {
    setConfirmDelete({ id, imageUrl });
  }
  if (memories.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-pink-900/80"
        >
          <h3 className="text-2xl font-semibold mb-2">Nem tem nada ainda :(</h3>
          <p className="text-lg">Adicione a nossa primeira memória ✨</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="relative">
        {/* Linha central (desktop) */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-pink-300 via-rose-200 to-purple-300 h-full rounded-full" />
        {/* Linha lateral (mobile) */}
        <div className="md:hidden absolute left-4 top-0 w-0.5 bg-gradient-to-b from-rose-200 via-pink-200 to-purple-200 h-full" />

        <div className="space-y-16 relative z-10">
          {memories.map((memory, index) => {
            const formattedDate = new Date(memory.date).toLocaleDateString(
              "pt-BR",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            );

            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-start md:items-center flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Ponto na linha (desktop) */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-pink-300 to-rose-200 rounded-full border-4 border-white shadow-lg z-20" />
                {/* Ponto na linha (mobile) */}
                <div className="md:hidden absolute left-4 -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-pink-300 to-rose-200 rounded-full border-2 border-white shadow-md z-20" />

                {/* Card */}
                <div
                  className={`w-full md:w-5/12 pl-10 ${
                    index % 2 === 0 ? "md:pr-8 md:pl-0" : "md:pl-8 md:pr-0"
                  } mt-8 md:mt-0`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300"
                  >
                    {/* Imagem */}
                    {memory.image_url && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="cursor-pointer"
                        onClick={() => onImageClick(memory.image_url!)}
                      >
                        <img
                          src={memory.image_url}
                          alt={memory.caption}
                          className="w-full h-56 object-cover"
                        />
                      </motion.div>
                    )}

                    {/* Conteúdo */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-rose-900/50 text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        {formattedDate}
                      </div>

                      <h3 className="text-2xl font-[Dancing Script] text-rose-950 mb-3">
                        {memory.caption}
                      </h3>

                      {memory.description && (
                        <div className="flex items-start gap-2 text-rose-500/20 mb-4">
                          <MessageCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed">
                            {memory.description}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => onEdit(memory)}
                          className="p-2 rounded-full text-pink-700 hover:text-pink-900 hover:bg-pink-100 transition"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(memory.id, memory.image_url)
                          }
                          className="p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-red-100 transition"
                          title="Excluir"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/30 p-6 w-full max-w-sm mx-4">
            <h4 className="text-xl font-bold text-rose-900 mb-2 text-center">
              Confirmar Exclusão
            </h4>
            <p className="text-sm text-rose-800/80 mb-6 text-center">
              Tem certeza que deseja excluir esta memória?
              <br />
              <span className="font-medium">
                Esta ação não pode ser desfeita.
              </span>
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2 rounded-full bg-white/30 text-rose-900 font-semibold border border-black/40 hover:bg-white/40 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete.id, confirmDelete.imageUrl);
                  setConfirmDelete(null);
                }}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-lg hover:opacity-90 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
