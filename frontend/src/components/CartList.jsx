// components/Cart/CartList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCartItemsQuery,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
} from "../features/api/cart.api";

import { Button, Loader } from "../components";

const CartList = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // Fetch cart
  const { data: cartData, isLoading, isError } = useGetCartItemsQuery();

  // Update quantity
  const [updateCart] = useUpdateCartMutation();

  // Remove item
  const [
    removeFromCart,
    { isLoading: isRemoving, isSuccess: removeSuccess, isError: removeError },
  ] = useRemoveFromCartMutation();

  // Track which item is being removed
  const [removingId, setRemovingId] = useState(null);

  // Debug logs
  useEffect(() => {
    // if (removeSuccess) console.log("Remove succeeded");
    // if (removeError) console.error("Remove failed");
  }, [removeSuccess, removeError]);

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      console.log(`Updating ${productId} to qty ${newQty}`);
      await updateCart({ productId, quantity: newQty }).unwrap();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemoveItem = async (productId) => {
    console.log('Removing item', productId);
    setRemovingId(productId);
    try {
      const result = await removeFromCart(productId).unwrap();
      console.log("removed result : ",result)
      console.log('Removed:', productId);
      
    } catch (err) {
      console.error('Failed to remove item:', err);
      toast.error(err.data?.message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading)
    return <div className="text-center py-8"><Loader/></div>;
  if (isError)
    return (
      <div className="text-center py-8 text-red-500">
        Error loading cart items
      </div>
    );

  const items = cartData?.data || [];
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">Your cart is empty</p>
        <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  const cartTotal = items.reduce((sum, item) => {
    const product = item.product || item;
    return sum + (product.price * item.quantity);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="space-y-6">
        {items.map(
          (
            { _id, product, quantity } // Use cart item ID instead of product ID
          ) => (
            <div
              key={_id} // Use the cart item's unique _id instead of product._id
              className="bg-white rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 shadow w-full"
            >
              <img
                src={product.images[0] || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-md"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="text-gray-700">${product.price.toFixed(2)}</p>
                {product.stock <= 0 && (
                  <p className="text-red-500 text-sm mt-1">Out of Stock</p>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      handleQuantityChange(product._id, quantity - 1)
                    }
                    disabled={quantity <= 1}
                    className="px-3 py-1"
                  >
                    −
                  </Button>
                  <span className="text-gray-800">{quantity}</span>
                  <Button
                    onClick={() =>
                      handleQuantityChange(product._id, quantity + 1)
                    }
                    disabled={product.stock <= quantity}
                    className="px-3 py-1"
                  >
                    +
                  </Button>
                </div>

                <p className="text-gray-900 w-24 text-right">
                  ${(product.price * quantity).toFixed(2)}
                </p>

                <div className="ml-auto">
                  {/* Visible Remove Button */}
                  <Button
                    onClick={() => handleRemoveItem(product._id)}
                    disabled={isRemoving && removingId === product._id}
                    className={`
                    text-red-600 
                    hover:bg-red-50 
                    hover:text-red-800 
                    px-3 py-1 
                    rounded-md 
                    transition 
                    duration-200
                    ${
                      isRemoving && removingId === product._id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                  >
                    {isRemoving && removingId === product._id
                      ? "Removing…"
                      : "Remove"}
                  </Button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Total Amount</h2>
          <p className="text-2xl font-bold text-gray-900">
            ${cartTotal.toFixed(2)}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/products")} className={`bg-primary hover:bg-primary-light`}>
            Continue Shopping
          </Button>
          <Button onClick={() => navigate("/checkout")} disabled={!isAuthenticated}>
            Proceed to Checkout
          </Button>
        </div>

        {!isAuthenticated && (
          <p className="text-red-500 text-sm mt-4 text-right">
            Please login to proceed to checkout
          </p>
        )}
      </div>
    </div>
  );
};

export default CartList;
