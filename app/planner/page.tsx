"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderPlus,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { supabase } from "@/lib/supabaseClient";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  created_at?: string;
}

interface PlannerItem {
  id: string;
  category_id: string;
  title: string;
  done: boolean;
  created_at?: string;
}

export default function PlannerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<
    Record<string, PlannerItem[]>
  >({});
  const [loading, setLoading] = useState(true);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    icon: string;
  }>({ name: "", icon: "" });

  const [newItemTitleByCategory, setNewItemTitleByCategory] = useState<
    Record<string, string>
  >({});
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    new Set()
  );

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const authStatus = localStorage.getItem("coupleAuth");
    if (authStatus !== "true") {
      router.replace("/");
    } else {
      initialize();
    }
  }, [router]);

  async function initialize() {
    try {
      setLoading(true);
      await fetchCategoriesAndItems();
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategoriesAndItems() {
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        showToast("Configuração do Supabase ausente", "error");
        return;
      }

      const { data: categoriesData, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (catErr) throw catErr;

      setCategories(categoriesData || []);

      if ((categoriesData || []).length === 0) {
        setItemsByCategory({});
        return;
      }

      const { data: itemsData, error: itemsErr } = await supabase
        .from("planner_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (itemsErr) throw itemsErr;

      const grouped: Record<string, PlannerItem[]> = {};
      (itemsData || []).forEach((item) => {
        if (!grouped[item.category_id]) grouped[item.category_id] = [];
        grouped[item.category_id].push(item as PlannerItem);
      });
      setItemsByCategory(grouped);
    } catch (err) {
      console.error("Erro ao carregar planner:", err);
      showToast("Erro ao carregar dados do planner", "error");
    }
  }

  function openCreateCategory() {
    setEditingCategory(null);
    setCategoryForm({ name: "", icon: "" });
    setShowCategoryModal(true);
  }

  function openEditCategory(category: Category) {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, icon: category.icon || "" });
    setShowCategoryModal(true);
  }

  async function submitCategory(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: categoryForm.name.trim(),
      icon: categoryForm.icon.trim() || null,
    } as const;
    if (!payload.name) {
      showToast("Informe o nome da categoria", "warning");
      return;
    }

    try {
      if (editingCategory) {
        const { data, error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id)
          .select();
        if (error) throw error;
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? (data![0] as Category) : c
          )
        );
        showToast("Categoria atualizada", "success");
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert([payload])
          .select();
        if (error) throw error;
        const created = data![0] as Category;
        setCategories((prev) => [...prev, created]);
        showToast("Categoria criada", "success");
      }
      setShowCategoryModal(false);
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
      showToast("Erro ao salvar categoria", "error");
    }
  }

  async function deleteCategory(categoryId: string) {
    try {
      // Opcional: remover itens primeiro (se FK não for ON DELETE CASCADE)
      const items = itemsByCategory[categoryId] || [];
      if (items.length > 0) {
        const { error: delItemsErr } = await supabase
          .from("planner_items")
          .delete()
          .in(
            "id",
            items.map((i) => i.id)
          );
        if (delItemsErr) throw delItemsErr;
      }

      const { error: delCatErr } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);
      if (delCatErr) throw delCatErr;

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setItemsByCategory((prev) => {
        const clone = { ...prev };
        delete clone[categoryId];
        return clone;
      });
      showToast("Categoria excluída", "success");
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      showToast("Erro ao excluir categoria", "error");
    }
  }

  async function addItem(categoryId: string) {
    const title = (newItemTitleByCategory[categoryId] || "").trim();
    if (!title) {
      showToast("Digite o título do item", "warning");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("planner_items")
        .insert([{ category_id: categoryId, title, done: false }])
        .select();
      if (error) throw error;
      const created = data![0] as PlannerItem;
      setItemsByCategory((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), created],
      }));
      setNewItemTitleByCategory((prev) => ({ ...prev, [categoryId]: "" }));
      showToast("Item adicionado", "success");
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
      showToast("Erro ao adicionar item", "error");
    }
  }

  async function toggleItemDone(
    categoryId: string,
    itemId: string,
    done: boolean
  ) {
    try {
      // Otimista
      setItemsByCategory((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).map((it) =>
          it.id === itemId ? { ...it, done } : it
        ),
      }));

      const { error } = await supabase
        .from("planner_items")
        .update({ done })
        .eq("id", itemId);
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao atualizar item:", err);
      showToast("Erro ao atualizar item", "error");
      // Recarrega para garantir consistência
      fetchCategoriesAndItems();
    }
  }

  async function deleteItem(categoryId: string, itemId: string) {
    try {
      // Otimista
      setItemsByCategory((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).filter((it) => it.id !== itemId),
      }));

      const { error } = await supabase
        .from("planner_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
      showToast("Item excluído", "success");
    } catch (err) {
      console.error("Erro ao excluir item:", err);
      showToast("Erro ao excluir item", "error");
      fetchCategoriesAndItems();
    }
  }

  function isExpanded(categoryId: string) {
    return expandedCategoryIds.has(categoryId);
  }

  function toggleExpand(categoryId: string) {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-100 to-rose-200" />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-300 via-pink-100 to-rose-200">
      <header className="relative z-10 p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-purple-900 mb-2">
            Alan & Mari Planner
          </h1>
          <p className="text-purple-500/80 text-lg mb-6">
            Nossos planinhos especiais 📅
          </p>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateCategory}
              className="bg-gradient-to-r from-purple-300 to-pink-300 text-purple-900 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2"
            >
              <FolderPlus className="w-5 h-5" />
              Nova Categoria
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/timeline")}
              className="bg-white/30 text-purple-900 px-5 py-3 rounded-full font-semibold backdrop-blur-sm border border-white/40 hover:bg-white/40 transition-all"
            >
              Timeline
            </motion.button>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 pb-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="col-span-full text-center py-20 text-purple-800"
            >
              Nenhuma categoria ainda. Crie a primeira com &quot;Nova Categoria&quot; ✨
            </motion.div>
          ) : (
            categories.map((category, idx) => {
              const items = itemsByCategory[category.id] || [];
              const expanded = isExpanded(category.id);
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon || "📁"}</span>
                      <h3 className="text-xl font-semibold text-purple-900">
                        {category.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditCategory(category)}
                        className="p-2 rounded-full text-purple-700 hover:bg-white/40"
                        title="Editar categoria"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 rounded-full text-red-500 hover:bg-white/40"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="p-2 rounded-full text-purple-800 hover:bg-white/40"
                        title="Expandir/Recolher"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newItemTitleByCategory[category.id] || ""}
                        onChange={(e) =>
                          setNewItemTitleByCategory((prev) => ({
                            ...prev,
                            [category.id]: e.target.value,
                          }))
                        }
                        placeholder="Adicionar item..."
                        className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-purple-900 placeholder-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        onClick={() => addItem(category.id)}
                        className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold hover:opacity-90"
                        title="Adicionar item"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {items.length === 0 ? (
                            <li className="text-purple-800/70 text-sm">
                              Nenhum item ainda.
                            </li>
                          ) : (
                            items.map((item) => (
                              <li
                                key={item.id}
                                className={`flex items-center justify-between bg-white/10 border border-white/20 rounded-lg px-3 py-2 ${
                                  item.done ? "opacity-70" : ""
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      toggleItemDone(
                                        category.id,
                                        item.id,
                                        !item.done
                                      )
                                    }
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                      item.done
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "bg-white/10 border-white/30 text-transparent"
                                    }`}
                                    aria-label="Marcar como feito"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <span
                                    className={`text-purple-900 transition-all ${
                                      item.done ? "line-through" : ""
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    deleteItem(category.id, item.id)
                                  }
                                  className="p-1.5 rounded-full text-red-500 hover:bg-white/30"
                                  title="Excluir item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </li>
                            ))
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-purple-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-900">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 rounded-full text-purple-800 hover:bg-white/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitCategory} className="space-y-4">
                <div>
                  <label className="block text-purple-800 text-sm font-medium mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-900 placeholder-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder='Ex: "Filmes pra assistir"'
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-800 text-sm font-medium mb-2">
                    Ícone (opcional)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, icon: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-900 placeholder-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Ex: 🎬 🍽️ 🎉"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 bg-white/10 border border-white/20 text-purple-900 py-2 rounded-lg hover:bg-white/20"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600"
                  >
                    {editingCategory ? "Salvar" : "Criar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
