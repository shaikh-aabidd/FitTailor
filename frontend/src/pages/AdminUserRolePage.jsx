// src/pages/AdminUserRolePage.jsx
import React, { useState, useMemo } from 'react';
import { 
  useGetAllUsersQuery, 
  useUpdateUserRoleMutation 
} from '../features/api/user.api';
import { useCreateTailorMutation } from '../features/api/tailor.api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

export default function AdminUserRolePage() {
  const { data: usersResp, isLoading } = useGetAllUsersQuery();
  const [updateUserRole]   = useUpdateUserRoleMutation();
  const [createTailor]     = useCreateTailorMutation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!usersResp?.data) return [];
    const term = searchTerm.trim().toLowerCase();
    return usersResp.data.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }, [usersResp, searchTerm]);

  if (isLoading) return <Loader fullScreen />;

  const handleMakeTailor = async (user) => {
    // Ask admin for specializations
    const raw = window.prompt(
      `Enter specializations for ${user.name} (comma‑separated):`,
      'suits,dresses'
    );
    if (!raw) return;

    const specs = raw.split(',').map(s => s.trim()).filter(Boolean);
    try {
      await createTailor({ userId: user._id, specialization: specs }).unwrap();
      toast.success(`${user.name} is now a Tailor!`);
      // option: refetch users to pick up new role
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create tailor');
    }
  };

  const handleMakeCustomer = async (user) => {
    try {
      await updateUserRole({ userId: user._id, role: 'customer' }).unwrap();
      toast.success(`${user.name} is now a Customer`);
    } catch {
      toast.error('Role update failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage User Roles</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring focus:ring-indigo-200"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-gray-600">No users match your search.</p>
      ) : (
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className="border-b last:border-0">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3 space-x-2">
                  {/* Only show Make Tailor if not already a tailor */}
                  {user.role !== 'tailor' && (
                    <button
                      onClick={() => handleMakeTailor(user)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Make Tailor
                    </button>
                  )}
                  {/* Allow demoting to customer */}
                  {user.role !== 'customer' && (
                    <button
                      onClick={() => handleMakeCustomer(user)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Make Customer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
