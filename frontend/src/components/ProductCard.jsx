import React from 'react';
import { Link } from 'react-router-dom';
import { useAddToCartMutation } from '../features/api/cart.api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ProductCard = ({ product }) => {
  // Grab the current cart (array of product objects) from your auth slice
  const rawCart = useSelector(s => s.auth.user?.cart || []);
  const cart = React.useMemo(() => rawCart || [], [rawCart]);
  console.log(cart)
  const isInCart = cart.some((item) => item.product._id === product._id);
  const [addToCart, { isLoading }] = useAddToCartMutation();


  const handleAddToCart = async () => {
    try {
      // pass in the object shape your mutation expects
      await addToCart(product._id).unwrap();
      toast.success('Product added to cart!');
    } catch {
      toast.error('Add to cart failed');
    }
  };

  return (
    <div className="group w-60 h-full bg-white p-3 flex flex-col gap-1 shadow hover:shadow-lg transition">
      
      {/* Clicking image/name/price takes you to the product detail page */}
      <Link
        to={`/product/${product._id}`}
        className="flex-grow flex flex-col"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-64 object-cover mb-2"
        />
        <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
        <span className="text-gray-700 mt-1">${product.price}</span>
      </Link>

      {/* Cart button */}
      {isInCart ? (
        <Link
          to="/cart"
          className="my-4 block text-center w-full py-2 bg-transparent border border-green-500 text-green-500 hover:bg-green-50 font-medium transition"
        >
          Go to Cart
        </Link>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`my-4 block text-center w-full py-2 bg-transparent border font-medium transition
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed text-gray-100'
              :  'border-primary text-primary-dark hover:bg-blue-50'}`}
        >
          {isLoading ? 'Adding…' : 'Add to cart'}
        </button>
      )}
    </div>
  );
};

export default ProductCard;
