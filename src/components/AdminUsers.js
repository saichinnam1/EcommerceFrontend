import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/api'; // Import the API function

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers(); // Use the API service
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users. Ensure you are logged in as an admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 border-r text-left">User ID</th>
              <th className="py-2 px-4 border-r text-left">Name</th>
              <th className="py-2 px-4 border-r text-left">Email</th>
              <th className="py-2 px-4 border-r text-left">Orders</th>
              <th className="py-2 px-4 text-left">Shipping Address</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userId} className="border-b">
                <td className="py-2 px-4 border-r">{user.userId}</td>
                <td className="py-2 px-4 border-r">{user.name}</td>
                <td className="py-2 px-4 border-r">{user.email}</td>
                <td className="py-2 px-4 border-r">{user.order?.join(', ') || 'No orders'}</td>
                <td className="py-2 px-4">{user.shippingAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;