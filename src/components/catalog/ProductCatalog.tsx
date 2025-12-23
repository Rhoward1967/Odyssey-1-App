import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { Edit2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  unit_price_cents: number;
  unit_of_measure: string;
  inventory_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unit_price_dollars: '',
    unit_of_measure: 'unit',
    inventory_count: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      alert(`Failed to load products: ${error.message}`);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (!formData.unit_price_dollars || parseFloat(formData.unit_price_dollars) < 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsLoading(true);

    // Convert dollars to cents (CRITICAL for backend compatibility)
    const unit_price_cents = Math.round(parseFloat(formData.unit_price_dollars) * 100);
    
    const productData = {
      sku: formData.sku.trim() || null,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      unit_price_cents,
      unit_of_measure: formData.unit_of_measure,
      inventory_count: formData.inventory_count || 0,
      is_active: true,
    };

    try {
      if (editingId) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        
        if (error) throw error;
        alert('✅ Product updated successfully!');
      } else {
        // Insert new product (user_id set automatically by trigger)
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        alert('✅ Product added to catalog!');
      }

      // Reset form
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku || '',
      name: product.name,
      description: product.description || '',
      unit_price_dollars: (product.unit_price_cents / 100).toFixed(2),
      unit_of_measure: product.unit_of_measure,
      inventory_count: product.inventory_count,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deactivate "${name}" from catalog?`)) return;
    
    setIsLoading(true);
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('Product deactivated');
      fetchProducts();
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      unit_price_dollars: '',
      unit_of_measure: 'unit',
      inventory_count: 0,
    });
    setEditingId(null);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Product Catalog</h2>
        </div>
        <div className="text-sm text-gray-600">
          {products.length} product{products.length !== 1 ? 's' : ''} in catalog
        </div>
      </div>

      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Toilet Paper - 2ply"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU (Optional)</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="TP-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  value={formData.unit_price_dollars}
                  onChange={(e) => setFormData({ ...formData, unit_price_dollars: e.target.value })}
                  placeholder="15.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit of Measure</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
              >
                <option value="unit">Each</option>
                <option value="case">Case</option>
                <option value="box">Box</option>
                <option value="gallon">Gallon</option>
                <option value="bottle">Bottle</option>
                <option value="roll">Roll</option>
                <option value="bag">Bag</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Count</label>
              <Input
                type="number"
                min="0"
                value={formData.inventory_count}
                onChange={(e) => setFormData({ ...formData, inventory_count: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="2-ply, 500 sheets per roll, 12 rolls per case"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : editingId ? 'Update Product' : 'Add to Catalog'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catalog Items</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No products match your search' : 'No products in catalog yet. Add one above!'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{product.name}</span>
                      {product.sku && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">SKU: {product.sku}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium text-green-600">
                        ${(product.unit_price_cents / 100).toFixed(2)}
                      </span>
                      <span className="text-gray-400"> / {product.unit_of_measure}</span>
                      {product.description && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{product.description}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Stock: {product.inventory_count} {product.unit_of_measure}
                      {product.inventory_count === 0 && (
                        <span className="ml-2 text-orange-500 font-medium">⚠️ Out of Stock</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit Price
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
