import React from 'react';
import CategoryCard from './CategoryCard';

const categories = [
  { name: 'Shirt', image: 'images/shirt.jpg' },
  { name: 'Pants', image: 'images/pant.png' },
  { name: 'Jackets', image: 'images/jacket.jpg' },
  { name: 'Suit', image: 'images/suit.png' },
  { name: 'Tailoring', image: 'images/tailoring.jpg' },
];

const CategoryScroller = () => (
  <section className="py-12 bg-neutral-default">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-primary mb-6">Featured Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map(cat => (
          <CategoryCard key={cat.name} {...cat} />
        ))}
      </div>
    </div>
  </section>
);

export default CategoryScroller;
