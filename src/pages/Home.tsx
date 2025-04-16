
import React from 'react';
import Navbar from '@/components/Navbar';

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold">Welcome to the Application</h1>
      </div>
    </div>
  );
};

export default Home;
