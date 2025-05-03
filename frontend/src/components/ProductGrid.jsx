import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products }) => (
  <section className="py-12">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Top Picks</h2>
        <a href="/products" className="text-secondary hover:underline">View All</a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  </section>
);

export default ProductGrid;