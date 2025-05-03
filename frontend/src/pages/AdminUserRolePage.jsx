import React, { useState, useMemo } from 'react';
import { useGetAllUsersQuery, useUpdateUserRoleMutation } from '../features/api/user.api';
import Loader from '../components/Loader';

export default function AdminUserRolePage() {
  const { data: usersResp, isLoading } = useGetAllUsersQuery();
  const [updateRole] = useUpdateUserRoleMutation();

  // New piece: searchTerm state
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized filtered list
  const filteredUsers = useMemo(() => {
    if (!usersResp?.data) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return usersResp.data;
    return usersResp.data.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }, [usersResp, searchTerm]);

  if (isLoading) return <Loader fullScreen />;

  const handleRoleChange = async (userId, role) => {
    await updateRole({ userId, role }).unwrap();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage User Roles</h1>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
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
                  {user.role !== 'tailor' && (
                    <button
                      onClick={() => handleRoleChange(user._id, 'tailor')}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Make Tailor
                    </button>
                  )}
                  {user.role !== 'customer' && (
                    <button
                      onClick={() => handleRoleChange(user._id, 'customer')}
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
