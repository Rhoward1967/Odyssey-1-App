import ProductCatalog from '@/components/catalog/ProductCatalog';
import ServiceCatalog from '@/components/catalog/ServiceCatalog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, ListChecks, Package } from 'lucide-react';
import { useState } from 'react';

export default function CatalogManager() {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-b shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ListChecks className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Catalog Manager</h1>
            </div>
            <p className="text-gray-600">
              Manage your products (supplies) and services. Update prices anytime, and changes apply to future invoices automatically.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <div className="px-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products (Supplies)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="services" className="mt-0">
            <ServiceCatalog />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ProductCatalog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
