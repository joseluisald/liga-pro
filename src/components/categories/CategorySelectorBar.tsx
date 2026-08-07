import React, { useState } from 'react';
import { Layers, Plus, Tag, Check, X, FolderPlus } from 'lucide-react';
import { Category, DEFAULT_CATEGORIES } from '../../types';

interface CategorySelectorBarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: (cat: Partial<Category>) => void;
  userRole?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const CategorySelectorBar: React.FC<CategorySelectorBarProps> = ({
  categories = DEFAULT_CATEGORIES,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  userRole = 'ADMIN',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/\s+/g, '-');
    onCreateCategory({
      id: slug,
      name: newCatName.trim(),
      description: newCatDesc.trim(),
    });

    onSelectCategory(slug);
    setNewCatName('');
    setNewCatDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Category Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex-shrink-0">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Categorias:</span>
          </div>

          <button
            onClick={() => onSelectCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
              selectedCategoryId === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Todas as Categorias</span>
          </button>

          {activeCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Tag className="w-3 h-3 opacity-70" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Add Category Button */}
        {userRole === 'ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Nova Categoria</span>
          </button>
        )}
      </div>

      {/* Modal Nova Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-500" />
                Cadastrar Categoria
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Sub-17, Master 40+, Série B"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Ex: Atletas nascidos entre 2007 e 2009"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
