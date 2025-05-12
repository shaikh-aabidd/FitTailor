import React, { useState, useMemo } from 'react';
import { useGetAllProductsQuery } from '../features/api/product.api';
import ProductCard from './ProductCard';
import Loader from './Loader';

const ProductListing = ({
  categories = ['Shirt', 'Pants', 'Unstiched', 'Suit'],
  fabrics = ['Cotton', 'Silk', 'Wool', 'Linen'],
}) => {
  const [selectedPrice, setSelectedPrice] = useState(5000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  const { data: products, isLoading, error } = useGetAllProductsQuery({ page: 1, limit: 12 });

  const handlePriceChange = (e) => setSelectedPrice(Number(e.target.value));
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategories((prev) => e.target.checked ? [...prev, category] : prev.filter((c) => c !== category));
  };
  const handleFabricChange = (e) => {
    const fabric = e.target.value;
    setSelectedFabrics((prev) => e.target.checked ? [...prev, fabric] : prev.filter((f) => f !== fabric));
  };

  const filteredProducts = useMemo(() => {
    const docs = products?.docs || [];
    return docs.filter((product) => {
      const matchesPrice = product.price <= selectedPrice;
      const prodCat = product.category?.toLowerCase() || '';
      const catsLower = selectedCategories.map((c) => c.toLowerCase());
      const matchesCategory = !selectedCategories.length || catsLower.includes(prodCat);
      const prodFab = product.fabricType?.toLowerCase() || '';
      const fabsLower = selectedFabrics.map((f) => f.toLowerCase());
      const matchesFabric = !selectedFabrics.length || fabsLower.includes(prodFab);
      return matchesPrice && matchesCategory && matchesFabric;
    });
  }, [products, selectedPrice, selectedCategories, selectedFabrics]);

  if (isLoading) return <div className="flex justify-center mt-8"><Loader /></div>;
  if (error) return <p className="text-center text-red-500 mt-8">{error.data?.message || 'Error loading products'}</p>;

  return (
    <div className="min-h-screen bg-neutral-default p-4">
      <div className="container mx-auto flex flex-col lg:flex-row gap-0">
        {/* Filters Sidebar hidden on mobile, reduced width */}
        <aside className="hidden lg:block lg:w-1/5 bg-mainBg p-4  sticky lg:top-0 lg:h-screen overflow-y-auto">
          <h2 className="text-xl font-bold text-primary mb-4">Filters</h2>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Price: Up to ${selectedPrice}</h3>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={selectedPrice}
              onChange={handlePriceChange}
              className="w-full"
            />
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={cat}
                    onChange={handleCategoryChange}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Fabric</h3>
            <div className="space-y-2">
              {fabrics.map((fab) => (
                <label key={fab} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={fab}
                    onChange={handleFabricChange}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-gray-700">{fab}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid using CSS Grid for even spacing and extra vertical space */}
        <main className="lg:w-4/5">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-8">
              {products?.docs?.length
                ? 'No products match your filters.'
                : 'No products available.'}
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;
