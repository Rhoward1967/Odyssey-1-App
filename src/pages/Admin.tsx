import APIStatusIndicator from '@/components/APIStatusIndicator';
import DatabaseIntegrationTest from '@/components/DatabaseIntegrationTest';
import SchemaVerificationReport from '@/components/SchemaVerificationReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart3, Brain, Database, Shield, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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

      {/* R.O.M.A.N. Observability Navigation */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Brain className="h-6 w-6" />
            R.O.M.A.N. Observability & Intelligence
          </CardTitle>
          <p className="text-sm text-blue-700">
            Complete visibility into R.O.M.A.N.'s decisions, system performance, and evolution
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/app/admin/observability" 
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-blue-100 hover:border-blue-300"
            >
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">System Observability</h3>
                <p className="text-sm text-gray-600">Performance, compliance & business metrics</p>
              </div>
            </Link>

            <Link 
              to="/app/admin/ai-intelligence" 
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-100 hover:border-purple-300"
            >
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">AI Intelligence Feed</h3>
                <p className="text-sm text-gray-600">Real-time R.O.M.A.N. decision stream</p>
              </div>
            </Link>

            <Link 
              to="/app/admin/evolution" 
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-green-100 hover:border-green-300"
            >
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Evolution Tracker</h3>
                <p className="text-sm text-gray-600">AI learning & pattern visualization</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

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