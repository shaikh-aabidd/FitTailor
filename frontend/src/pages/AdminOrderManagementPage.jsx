// src/pages/AdminOrderManagementPage.jsx
import React, { useState } from 'react'
import { 
  useGetAllOrdersQuery, 
  useUpdateOrderStatusMutation, 
  useDeleteOrderMutation 
} from '../features/api/order.api'
import Loader from '../components/Loader'
import { toast } from 'react-toastify'

const STATUSES = [
  'placed', 
  'confirmed', 
  'in_progress', 
  'shipped', 
  'delivered', 
  'cancelled'
]

export default function AdminOrderManagementPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [statusFilter, setStatusFilter] = useState('')
  
  const { data: ordersResp, isLoading, error } = useGetAllOrdersQuery({
    page, limit, status: statusFilter
  })
  const [updateStatus] = useUpdateOrderStatusMutation()
  const [deleteOrder] = useDeleteOrderMutation()

  if (isLoading) return <Loader fullScreen />
  if (error) return <p className="p-6 text-red-600">Error loading orders</p>

  const { docs: orders, totalPages } = ordersResp.data;

  const onStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus }).unwrap()
      toast.success('Order status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const onDelete = async (orderId) => {
    if (!window.confirm('Delete this order?')) return
    try {
      await deleteOrder(orderId).unwrap()
      toast.success('Order deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Orders Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="font-medium">
          Status:
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="ml-2 border p-2 rounded"
          >
            <option value="">All</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">User</th>
              <th className="p-3">Product</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o._id} className="border-t">
                <td className="p-3">{(page - 1) * limit + idx + 1}</td>
                <td className="p-3">
                  {o.user.name} <br/>
                  <span className="text-sm text-gray-500">{o.user.email}</span>
                </td>
                <td className="p-3">{o.product.name}</td>
                <td className="p-3">${o.totalAmount.toFixed(2)}</td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={e => onStatusChange(o._id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onDelete(o._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-600">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  )
}
