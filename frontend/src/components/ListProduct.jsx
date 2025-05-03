import React from 'react';
import { useGetAllProductsQuery } from '../features/api/product.api';
import { Loader,ProductCard } from "./index.js";
import { Link } from 'react-router-dom';

const ListProduct = () => {
  const { data: products, isLoading, error } = useGetAllProductsQuery({
    category: 'shirt',
    page: 1,
    limit: 12
  });

  if (isLoading) return <Loader />;
  if (error) return <div>Error: {error.data?.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products?.data?.docs?.map(product => (
        <Link key={product._id} to={`/product/${product._id}`} className="block">
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  );
};

export default ListProduct;
