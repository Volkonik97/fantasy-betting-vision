
import React from 'react';
import AdminDatabaseUpdate from '@/components/AdminDatabaseUpdate';

const AdminPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-8">
        <AdminDatabaseUpdate />
      </div>
    </div>
  );
};

export default AdminPage;
