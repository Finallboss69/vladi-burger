'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, mockCategories } from '@/lib/mock-data';

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
      <section className="bg-gradient-to-b from-[#FF6B35]/10 to-transparent pb-6 pt-8 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] sm:text-4xl">
              Nuestro Menu
            </h1>
            <p className="mt-2 text-[var(--text-muted)]">
              Descubri todas nuestras hamburguesas, acompañamientos, bebidas y
              combos
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            className="mt-5 max-w-md sm:mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconLeft={<Search className="h-4 w-4" />}
            />
          </motion.div>

          {/* Category tabs */}
          <motion.div
            className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto pb-2 sm:mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5 ${
                    isActive
                      ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:pb-20">
        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-sm text-[var(--text-muted)]"
        >
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
        </motion.p>

        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <SlidersHorizontal className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="text-lg font-semibold text-[var(--text-primary)]">
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
              transition={{ duration: 0.3 }}
              className="grid gap-4 grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
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
