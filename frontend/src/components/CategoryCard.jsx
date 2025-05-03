import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ name, image }) => (
  <Link to={`/products?category=${name.toLowerCase()}`} className="block rounded-xl overflow-hidden shadow hover:shadow-lg group">
    <img src={image} alt={name} className="w-full h-40 object-cover group-hover:scale-105 transition" />
    <div className="p-4 bg-white">
      <h3 className="text-lg font-semibold text-primary text-center">{name}</h3>
    </div>
  </Link>
);

export default CategoryCard;
