// src/pages/ProductDetails.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductByIdQuery, useGetAllProductsQuery } from '../features/api/product.api';
import ProductCard from './ProductCard';
import Loader from './Loader';

const ProductDetails = () => {
  const { id } = useParams();
  const { data: prodRes, isLoading: prodLoading, error: prodError } = useGetProductByIdQuery(id);
  const product = prodRes?.data;
  const [currentImage, setCurrentImage] = useState(0);

  const {
    data: featRes,
    isLoading: featLoading,
    error: featError
  } = useGetAllProductsQuery({
    category: product?.category || '',
    page: 1,
    limit: 4
  });

  const featured = featRes?.docs || [];

  if (prodLoading) return <p className="text-center py-8">Loading product…</p>;
  if (prodError)  return <p className="text-center py-8 text-red-500">Error loading product</p>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image Slider */}
        <div>
          <div className="relative">
            <img
              src={product.images[currentImage]}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((currentImage + product.images.length - 1) % product.images.length)
                  }
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full hover:bg-opacity-100"
                >
                  ‹
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((currentImage + 1) % product.images.length)
                  }
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full hover:bg-opacity-100"
                >
                  ›
                </button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex mt-4 space-x-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                    currentImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl text-primary font-semibold">${product.price}</p>
          <p className="text-gray-700">Category: {product.category}</p>
          <p className="text-gray-700">Fabric: {product.fabricType}</p>
          <p className="text-gray-700">
            Stock: {product.stock > 0 ? product.stock : <span className="text-red-500">Out of stock</span>}
          </p>
          <div>
            <h2 className="font-medium mb-1">Description</h2>
            <p className="text-gray-600">{product.description || 'No description provided.'}</p>
          </div>
          <div>
            <h2 className="font-medium mb-1">Design Options</h2>
            <ul className="list-disc list-inside text-gray-600">
              <li>Collar styles: {product.designOptions.collarStyles.length || 'N/A'}</li>
              <li>Sleeve types: {product.designOptions.sleeveTypes.length || 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
        {featLoading ? (
          <div className="text-center py-4"><Loader /></div>
        ) : featError ? (
          <p className="text-center py-4 text-red-500">Error loading featured products</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((fp) => (
                <ProductCard key={fp._id} product={fp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
