
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import AdminDatabaseUpdate from '@/components/AdminDatabaseUpdate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('database');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Edge Functions</AlertTitle>
          <AlertDescription>
            This admin panel uses Supabase Edge Functions to update your database. If you encounter connection errors, 
            verify that your Edge Functions are properly deployed and accessible.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="database" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="database" className="space-y-6">
            <AdminDatabaseUpdate />
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Technical information about the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Platform:</h3>
                    <p className="text-sm text-gray-500">Web Application</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Framework:</h3>
                    <p className="text-sm text-gray-500">React + Vite</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Database:</h3>
                    <p className="text-sm text-gray-500">Supabase</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">UI Library:</h3>
                    <p className="text-sm text-gray-500">Shadcn UI + Tailwind CSS</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Edge Functions:</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <p className="font-mono text-xs">update-database</p>
                      <p className="text-xs text-gray-500 mt-1">Updates database from Google Sheets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
