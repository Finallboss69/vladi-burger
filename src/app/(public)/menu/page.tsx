'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Flame } from 'lucide-react';
import { Input } from '@/components/ui';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, mockCategories } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const allCategory = { id: 'all', name: 'Todos', slug: 'todos' };
const categories = [allCategory, ...mockCategories];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    let result = mockProducts.filter((p) => p.isActive);

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <section className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-[#FF6B35]" />
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
                  Menu
                </h1>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Search */}
            <div className="w-full max-w-xs">
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconLeft={<Search className="h-4 w-4" />}
              />
            </div>
          </motion.div>

          {/* Category tabs */}
          <motion.div
            className="scrollbar-hide mt-4 flex gap-1.5 overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'relative shrink-0 cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#FF6B35] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-20 text-center"
            >
              <SlidersHorizontal className="h-10 w-10 text-[var(--text-muted)]" />
              <p className="text-base font-semibold text-[var(--text-primary)]">
                No encontramos productos
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Proba con otra busqueda o selecciona otra categoria
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCategory + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Mobile bottom spacing */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
