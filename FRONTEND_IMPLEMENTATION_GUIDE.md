# FRONTEND IMPLEMENTATION - MATCHING SUPABASE BACKEND

**Date:** December 14, 2025  
**Backend Deployed:** ✅ Products, Services, Cleaning Plans, Bids line_items

---

## 🔧 BACKEND STRUCTURE (AS DEPLOYED)

### Table: `products`
```typescript
interface Product {
  id: number;              // BIGSERIAL
  user_id: string;         // UUID (auto-set by trigger)
  organization_id?: number;
  sku: string;             // UNIQUE
  name: string;
  description?: string;
  unit_price_cents: number; // CRITICAL: Prices in CENTS
  unit_of_measure: string;  // 'unit', 'case', 'gallon', 'box'
  inventory_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Table: `services`
```typescript
interface Service {
  id: number;              // BIGSERIAL
  user_id: string;         // UUID (auto-set by trigger)
  organization_id?: number;
  name: string;
  description?: string;
  rate_cents: number;      // CRITICAL: Rates in CENTS
  rate_type: string;       // 'flat_rate', 'hourly', 'per_sqft'
  time_estimate_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Table: `cleaning_plans`
```typescript
interface CleaningPlan {
  id: number;              // BIGSERIAL
  user_id: string;         // UUID (auto-set by trigger)
  organization_id?: number;
  name: string;
  description?: string;
  plan_type: string;       // 'standard', 'premium', 'custom'
  plan_details: PlanDetail[]; // JSONB array
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlanDetail {
  type: 'service' | 'product';
  ref_id: number;          // service.id or product.id
  name: string;
  qty: number;
  unit: string;            // 'unit', 'hour', 'sq_ft', 'case'
  unit_price_cents: number;
  total_cents: number;
}
```

### Table: `bids` (Updated)
```typescript
interface Bid {
  // ... existing columns ...
  line_items: LineItem[];  // NEW: JSONB array
}

interface LineItem {
  type: 'service' | 'product';
  ref_id: number;          // Links to service.id or product.id
  name: string;
  qty: number;
  unit: string;
  unit_price_cents: number;
  total_cents: number;
}
```

---

## 🎨 FRONTEND COMPONENTS TO BUILD

### 1. Product Catalog Manager
**File:** `src/components/catalog/ProductCatalog.tsx`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  unit_price_cents: number;
  unit_of_measure: string;
  inventory_count: number;
  is_active: boolean;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unit_price_dollars: '', // Display in dollars
    unit_of_measure: 'unit',
    inventory_count: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    setProducts(data || []);
  };

  const handleSave = async () => {
    // Convert dollars to cents
    const unit_price_cents = Math.round(parseFloat(formData.unit_price_dollars) * 100);
    
    const productData = {
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      unit_price_cents, // Save in cents
      unit_of_measure: formData.unit_of_measure,
      inventory_count: formData.inventory_count,
      is_active: true,
    };

    if (editingId) {
      // Update existing
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingId);
      
      if (error) {
        alert(`Error updating: ${error.message}`);
        return;
      }
    } else {
      // Insert new (user_id set by trigger)
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      
      if (error) {
        alert(`Error creating: ${error.message}`);
        return;
      }
    }

    // Reset form
    setFormData({
      sku: '',
      name: '',
      description: '',
      unit_price_dollars: '',
      unit_of_measure: 'unit',
      inventory_count: 0,
    });
    setEditingId(null);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      unit_price_dollars: (product.unit_price_cents / 100).toFixed(2), // Convert to dollars
      unit_of_measure: product.unit_of_measure,
      inventory_count: product.inventory_count,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this product?')) return;
    
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="TP-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Toilet Paper - 2ply"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_price_dollars}
                onChange={(e) => setFormData({ ...formData, unit_price_dollars: e.target.value })}
                placeholder="15.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
              >
                <option value="unit">Each</option>
                <option value="case">Case</option>
                <option value="box">Box</option>
                <option value="gallon">Gallon</option>
                <option value="bottle">Bottle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Count</label>
              <Input
                type="number"
                value={formData.inventory_count}
                onChange={(e) => setFormData({ ...formData, inventory_count: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="2-ply, 500 sheets per roll"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>
              {editingId ? 'Update' : 'Add'} Product
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => {
                setEditingId(null);
                setFormData({
                  sku: '',
                  name: '',
                  description: '',
                  unit_price_dollars: '',
                  unit_of_measure: 'unit',
                  inventory_count: 0,
                });
              }}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex-1">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    SKU: {product.sku} | ${(product.unit_price_cents / 100).toFixed(2)}/{product.unit_of_measure}
                    {product.description && ` | ${product.description}`}
                  </div>
                  <div className="text-xs text-gray-500">Stock: {product.inventory_count}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    Edit Price
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 2. Service Catalog Manager
**File:** `src/components/catalog/ServiceCatalog.tsx`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Service {
  id: number;
  name: string;
  description?: string;
  rate_cents: number;
  rate_type: string;
  time_estimate_minutes?: number;
  is_active: boolean;
}

export default function ServiceCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rate_dollars: '',
    rate_type: 'flat_rate',
    time_estimate_minutes: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    setServices(data || []);
  };

  const handleSave = async () => {
    const rate_cents = Math.round(parseFloat(formData.rate_dollars) * 100);
    
    const serviceData = {
      name: formData.name,
      description: formData.description,
      rate_cents,
      rate_type: formData.rate_type,
      time_estimate_minutes: formData.time_estimate_minutes ? parseInt(formData.time_estimate_minutes) : null,
      is_active: true,
    };

    if (editingId) {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingId);
      
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert([serviceData]);
      
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
    }

    setFormData({
      name: '',
      description: '',
      rate_dollars: '',
      rate_type: 'flat_rate',
      time_estimate_minutes: '',
    });
    setEditingId(null);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Service' : 'Add New Service'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vacuum Carpeted Areas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rate ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.rate_dollars}
                onChange={(e) => setFormData({ ...formData, rate_dollars: e.target.value })}
                placeholder="25.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rate Type</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.rate_type}
                onChange={(e) => setFormData({ ...formData, rate_type: e.target.value })}
              >
                <option value="flat_rate">Flat Rate</option>
                <option value="hourly">Per Hour</option>
                <option value="per_sqft">Per Sq Ft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Est. Time (minutes)</label>
              <Input
                type="number"
                value={formData.time_estimate_minutes}
                onChange={(e) => setFormData({ ...formData, time_estimate_minutes: e.target.value })}
                placeholder="30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Thorough vacuuming of all carpeted areas..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>
              {editingId ? 'Update' : 'Add'} Service
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '',
                  description: '',
                  rate_dollars: '',
                  rate_type: 'flat_rate',
                  time_estimate_minutes: '',
                });
              }}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Catalog ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex-1">
                  <div className="font-semibold">{service.name}</div>
                  <div className="text-sm text-gray-600">
                    ${(service.rate_cents / 100).toFixed(2)} 
                    {service.rate_type === 'hourly' && '/hour'}
                    {service.rate_type === 'per_sqft' && '/sq ft'}
                    {service.time_estimate_minutes && ` | ~${service.time_estimate_minutes} min`}
                  </div>
                  {service.description && (
                    <div className="text-xs text-gray-500">{service.description}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingId(service.id);
                    setFormData({
                      name: service.name,
                      description: service.description || '',
                      rate_dollars: (service.rate_cents / 100).toFixed(2),
                      rate_type: service.rate_type,
                      time_estimate_minutes: service.time_estimate_minutes?.toString() || '',
                    });
                  }}>
                    Edit Rate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 3. Updated BiddingCalculator - Save with line_items
**File:** `src/components/BiddingCalculator.tsx` (Update handleSaveBid function)

```typescript
// Add this to existing BiddingCalculator component
const [selectedLineItems, setSelectedLineItems] = useState<{
  services: Array<{ id: number; name: string; rate_cents: number; qty: number }>;
  products: Array<{ id: number; name: string; unit_price_cents: number; qty: number; unit: string }>;
}>({ services: [], products: [] });

const handleSaveBid = async () => {
  if (!selectedCustomer) {
    alert('Please select a customer first');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Please log in first');
    return;
  }

  // Build line_items array in correct format
  const line_items = [
    ...selectedLineItems.services.map(svc => ({
      type: 'service' as const,
      ref_id: svc.id,
      name: svc.name,
      qty: svc.qty,
      unit: 'service',
      unit_price_cents: svc.rate_cents,
      total_cents: svc.rate_cents * svc.qty,
    })),
    ...selectedLineItems.products.map(prod => ({
      type: 'product' as const,
      ref_id: prod.id,
      name: prod.name,
      qty: prod.qty,
      unit: prod.unit,
      unit_price_cents: prod.unit_price_cents,
      total_cents: prod.unit_price_cents * prod.qty,
    })),
  ];

  const total_cents = line_items.reduce((sum, item) => sum + item.total_cents, 0);

  const bidData = {
    customer_id: selectedCustomer.id,
    title: projectType || 'Untitled Bid',
    line_items, // NEW: Structured line items
    total_cents, // Total in cents
    status: 'draft',
  };

  const { data, error } = await supabase
    .from('bids')
    .insert([bidData])
    .select()
    .single();

  if (error) {
    alert(`Error saving bid: ${error.message}`);
    return;
  }

  alert(`✅ Bid saved! Total: $${(total_cents / 100).toFixed(2)}`);
};
```

---

## 📦 SEED DATA SCRIPT

To populate catalog with existing 64 services from CleaningServicesDropdown:

```typescript
// Run this once to migrate hardcoded services to database
const migrateServicesToDatabase = async () => {
  const hardcodedServices = [
    { name: 'Vacuum All Carpeted Areas', rate: 25, time: 30, desc: 'Thorough vacuuming...' },
    { name: 'Mop Hard Surface Floors', rate: 20, time: 25, desc: 'Sweep and mop...' },
    // ... all 64 services
  ];

  const serviceData = hardcodedServices.map(s => ({
    name: s.name,
    description: s.desc,
    rate_cents: s.rate * 100, // Convert to cents
    rate_type: 'flat_rate',
    time_estimate_minutes: s.time,
    is_active: true,
  }));

  const { error } = await supabase
    .from('services')
    .insert(serviceData);

  if (error) {
    console.error('Migration error:', error);
  } else {
    console.log('✅ Migrated 64 services to database');
  }
};
```

---

## ✅ COMPLETE SYSTEM FLOW

```
1. ADD PRODUCTS & SERVICES (One Time)
   → Go to Product Catalog
   → Add: Toilet Paper ($15.00) → Saves as 1500 cents
   → Add: Hand Soap ($8.50) → Saves as 850 cents
   
2. BUILD CLEANING PLAN
   → Select services from catalog
   → Add products/supplies
   → plan_details = [
       { type: 'service', ref_id: 1, qty: 1, unit_price_cents: 2500 },
       { type: 'product', ref_id: 1, qty: 1, unit_price_cents: 1500 }
     ]
   
3. CREATE BID
   → Select plan OR manually add items
   → line_items built from selections
   → total_cents calculated
   → Save bid
   
4. CONVERT TO INVOICE
   → Call convert_bid_to_invoice(bid_id)
   → Backend copies line_items to invoice
   
5. RECURRING BILLING
   → Invoice references plan
   → Auto-generates monthly with current prices from catalog
```

---

**Ready to implement? I'll create these 3 components now!**
