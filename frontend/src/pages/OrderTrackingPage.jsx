import React, { useState } from 'react';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../features/api/order.api';
import Loader from '../components/Loader';
import {toast} from "react-toastify"

export default function OrderTrackingPage() {
  // const { data: ordersResp, isLoading, isError, error } = useGetAllOrdersQuery();

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [statusFilter, setStatusFilter] = useState('')
  
  const { data: ordersResp, isLoading, error } = useGetAllOrdersQuery({
    page, limit, status: statusFilter
  })

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();


  if (isLoading) return <Loader fullScreen />;
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error?.data?.message || 'Failed to load orders.'}</p>
      </div>
    );
  }

  const { docs: orders, totalPages } = ordersResp.data || [];
  console.log("Orders",orders)

  const handleCancelOrder = async (orderId) => {
    try {
      await updateOrderStatus({orderId, status: "cancelled" });
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders?.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders?.map((order) => (
            <li
              key={order._id}
              className={`border rounded-lg p-4 shadow-sm
                ${order.status === 'cancelled' ? 'bg-gray-50 text-gray-300' :' bg-white'}`
              }
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Order ID: {order._id}</span>
                <span className={`text-sm
                  ${order.status === 'cancelled' ? ' text-gray-300' :' text-gray-600 '}`
                }>
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
                          ${(order.totalAmount * order.quantity).toFixed(2)}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => window.location.href = `/order/${order._id}`}
                  className={`text-blue-600 hover:underline  
                    ${order.status === 'cancelled' ? 'text-gray-300' :' text-teal-800'}`}
                >
                  View Details
                </button>
                {order.status !== "cancelled" && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={isUpdating || order.status === "delivered"}
                    className={`text-red-600 hover:underline ${
                      isUpdating || order.status === "delivered" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${page === i+1 ? 'bg-gray-200' : ''}`}
            >
              {i + 1}
            </button>
          ))} 
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}