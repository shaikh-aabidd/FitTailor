import React from 'react';
import { useGetAllOrdersQuery } from '../features/api/order.api';
import Loader from '../components/Loader';

export default function OrderTrackingPage() {
  const { data: ordersResp, isLoading, isError, error } = useGetAllOrdersQuery();

  if (isLoading) return <Loader fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error?.data?.message || 'Failed to load orders.'}</p>
      </div>
    );
  }

  const orders = ordersResp?.data || [];
console.log(orders)
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.doc?.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.docs?.map((order) => (
            <li
              key={order._id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Order ID: {order._id}</span>
                <span className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                  <p><strong>Payment:</strong> {order.paymentId ? 'Paid' : 'Pending'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Items:</p>
                  <ul className="space-y-1">
                  {Array.isArray(order.product) && order.product.length ? (
              order.items.map(item => (
                <li key={item.product._id} className="flex justify-between">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))
            ) : (
              <li className="flex justify-between">
                <span>
                  {order.product.name} x {order.quantity}
                </span>
                <span>
                  ${(order.product.price * order.quantity).toFixed(2)}
                </span>
              </li>
            )}
          </ul>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.href = `/order/${order._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}