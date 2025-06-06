import React, { useState, useEffect } from 'react';
import { Package, Tag, DollarSign, Hash, Upload, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../ui/button';
import Input from '../ui/input';

const NewProductModal = ({ isOpen, onClose, onSuccess, editingProduct }) => {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [categories, setCategories] = useState([]);
     const [formData, setFormData] = useState({
          name: '',
          description: '',
          categoryId: '',
          price: '',
          cost: '',
          quantity: '',
          minStock: '',
          maxStock: '',
          sku: '',
          barcode: ''
     });

     useEffect(() => {
          if (isOpen) {
               fetchCategories();
               if (editingProduct) {
                    setFormData({
                         name: editingProduct.name || '',
                         description: editingProduct.description || '',
                         categoryId: editingProduct.categoryId || '',
                         price: editingProduct.price || '',
                         cost: editingProduct.cost || '',
                         quantity: editingProduct.quantity || '',
                         minStock: editingProduct.minStock || '',
                         maxStock: editingProduct.maxStock || '',
                         sku: editingProduct.sku || '',
                         barcode: editingProduct.barcode || ''
                    });
               } else {
                    setFormData({
                         name: '',
                         description: '',
                         categoryId: '',
                         price: '',
                         cost: '',
                         quantity: '',
                         minStock: '',
                         maxStock: '',
                         sku: '',
                         barcode: ''
                    });
               }
          }
     }, [isOpen, editingProduct]);

     const fetchCategories = async () => {
          try {
               const response = await fetch('http://localhost:5000/api/categories');
               if (!response.ok) {
                    throw new Error('Failed to fetch categories');
               }
               const result = await response.json();
               setCategories(result.data || result);
          } catch (error) {
               console.error('Fetch error:', error);
               toast.error('Failed to load categories');
          }
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);

          try {
               const url = editingProduct 
                    ? `http://localhost:5000/api/products/${editingProduct.id}`
                    : 'http://localhost:5000/api/products';
               
               const method = editingProduct ? 'PUT' : 'POST';

               const response = await fetch(url, {
                    method,
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         ...formData,
                         price: parseFloat(formData.price),
                         cost: formData.cost ? parseFloat(formData.cost) : null,
                         quantity: parseInt(formData.quantity),
                         minStock: formData.minStock ? parseInt(formData.minStock) : null,
                         maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
                         categoryId: parseInt(formData.categoryId)
                    }),
               });

               if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to save product');
               }

               toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
               onSuccess();
               onClose();
          } catch (err) {
               setError(err.message);
               toast.error(err.message);
          } finally {
               setLoading(false);
          }
     };

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                         <h2 className="text-xl font-semibold">
                              {editingProduct ? 'Edit Product' : 'Add New Product'}
                         </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                   label="Product Name"
                                   icon={<Package size={18} />}
                                   value={formData.name}
                                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                   required
                              />

                              <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                   </label>
                                   <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                        required
                                   >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                             <option key={category.id} value={category.id}>
                                                  {category.name}
                                             </option>
                                        ))}
                                   </select>
                              </div>
                         </div>

                         <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                   Description
                              </label>
                              <textarea
                                   value={formData.description}
                                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                   className="w-full rounded-md border border-gray-300 shadow-sm p-2 min-h-[100px]"
                                   placeholder="Enter product description"
                              />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                   label="Price"
                                   type="number"
                                   step="0.01"
                                   icon={<DollarSign size={18} />}
                                   value={formData.price}
                                   onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                   required
                              />

                              <Input
                                   label="Cost (Optional)"
                                   type="number"
                                   step="0.01"
                                   icon={<DollarSign size={18} />}
                                   value={formData.cost}
                                   onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                              />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Input
                                   label="Quantity"
                                   type="number"
                                   icon={<Hash size={18} />}
                                   value={formData.quantity}
                                   onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                   required
                              />

                              <Input
                                   label="Min Stock"
                                   type="number"
                                   icon={<Hash size={18} />}
                                   value={formData.minStock}
                                   onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                              />

                              <Input
                                   label="Max Stock"
                                   type="number"
                                   icon={<Hash size={18} />}
                                   value={formData.maxStock}
                                   onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                              />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                   label="SKU (Optional)"
                                   icon={<Tag size={18} />}
                                   value={formData.sku}
                                   onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                   placeholder="Product SKU"
                              />

                              <Input
                                   label="Barcode (Optional)"
                                   icon={<Hash size={18} />}
                                   value={formData.barcode}
                                   onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                   placeholder="Product barcode"
                              />
                         </div>

                         {error && (
                              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                                   {error}
                              </div>
                         )}

                         <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={onClose} disabled={loading}>
                                   Cancel
                              </Button>
                              <Button
                                   variant="primary"
                                   type="submit"
                                   isLoading={loading}
                                   disabled={loading}
                              >
                                   {editingProduct ? 'Update Product' : 'Create Product'}
                              </Button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default NewProductModal;