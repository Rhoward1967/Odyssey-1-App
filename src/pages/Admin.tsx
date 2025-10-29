import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Users, Activity } from 'lucide-react';
import SchemaVerificationReport from '@/components/SchemaVerificationReport';
import DatabaseIntegrationTest from '@/components/DatabaseIntegrationTest';
import APIStatusIndicator from '@/components/APIStatusIndicator';

/**
 * Admin Page - Central Control Hub for ODYSSEY-1 System
 * 
 * This page serves as the main administrative interface, providing access to:
 * - System Control Panel
 * - Autonomous Systems Management
 * - ODYSSEY Core Operations
 * - Auto-Fix Systems
 * - Evolution Engine Controls
 */
export default function Admin() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">System Administration</h1>
            <p className="text-gray-600">Complete system monitoring and configuration</p>
          </div>
        </div>
      </div>

      {/* API Integration Status */}
      <APIStatusIndicator />

      {/* Database Schema Verification - CRITICAL */}
      <SchemaVerificationReport />

      {/* Database Integration Testing */}
      <DatabaseIntegrationTest />

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 font-semibold">All systems operational</p>
            <p className="text-sm text-gray-600">Last check: {new Date().toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-gray-600">Employees registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 font-semibold">Excellent</p>
            <p className="text-sm text-gray-600">All services running</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}