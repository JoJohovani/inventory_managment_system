import React, { useState, useEffect } from 'react';
import { Package, Tag, DollarSign, Hash, Upload, Image } from 'lucide-react';
import Button from '../ui/button';
import Input from '../ui/input';


const NewProductModal = ({ isOpen, onClose, onSuccess }) => {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [categories, setCategories] = useState([]);
     const [formData, setFormData] = useState({
          name: '',
          description: '',
          category_id: '',
          price: '',
          quantity: '',
          image_url: '',
          qr_code: ''
     });

     useEffect(() => {
          fetchCategories();
     }, []);

     const fetchCategories = async () => {
          try {
               setLoading(true);
               const response = await fetch('http://localhost:5000/api/categories');

               if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
               }

               const data = await response.json();
               setCategories(data);
               setError(null);
          } catch (error) {
               console.error('Fetch error:', error);
               setError(error.message);
          } finally {
               setLoading(false);
          }
     };

     const handleImageUpload = async (file) => {
          try {
               // Create FormData object
               const formData = new FormData();
               formData.append('image', file);

               // Upload to your own API endpoint
               const response = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: formData
               });

               if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Image upload failed');
               }

               const { imageUrl } = await response.json();
               setFormData(prev => ({ ...prev, image_url: imageUrl }));

          } catch (err) {
               setError('Error uploading image: ' + err.message);
          }
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);

          try {
               const response = await fetch('http://localhost:5000/api/products', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         ...formData,
                         price: parseFloat(formData.price),
                         quantity: parseInt(formData.quantity),
                         category_id: parseInt(formData.category_id)
                    }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to create product');
               }

               onSuccess();
               onClose();
          } catch (err) {
               setError(err.message);
          } finally {
               setLoading(false);
          }
     };

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="p-6 border-b border-gray-200">
                         <h2 className="text-xl font-semibold">Add New Product</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                         <Input
                              label="Product Name"
                              icon={<Package size={18} />}
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                         />

                         <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                   Description
                              </label>
                              <textarea
                                   value={formData.description}
                                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                   className="w-full rounded-md border border-gray-300 shadow-sm p-2 min-h-[100px]"
                              />
                         </div>

                         <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                   Category
                              </label>
                              <select
                                   value={formData.category_id}
                                   onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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

                         <div className="grid grid-cols-2 gap-4">
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
                                   label="Quantity"
                                   type="number"
                                   icon={<Hash size={18} />}
                                   value={formData.quantity}
                                   onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                   required
                              />
                         </div>

                         <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                   Product Image
                              </label>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                   <div className="space-y-1 text-center">
                                        {formData.image_url ? (
                                             <div className="relative">
                                                  <img
                                                       src={formData.image_url}
                                                       alt="Product"
                                                       className="mx-auto h-32 w-32 object-cover rounded-md"
                                                  />
                                                  <button
                                                       type="button"
                                                       onClick={() => setFormData({ ...formData, image_url: '' })}
                                                       className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-600 rounded-full p-1"
                                                  >
                                                       ×
                                                  </button>
                                             </div>
                                        ) : (
                                             <div className="flex flex-col items-center">
                                                  <Image size={24} className="text-gray-400" />
                                                  <div className="flex text-sm text-gray-600">
                                                       <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                            <span>Upload a file</span>
                                                            <input
                                                                 type="file"
                                                                 className="sr-only"
                                                                 accept="image/*"
                                                                 onChange={(e) => {
                                                                      const file = e.target.files?.[0];
                                                                      if (file) handleImageUpload(file);
                                                                 }}
                                                            />
                                                       </label>
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {error && (
                              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                                   {error}
                              </div>
                         )}

                         <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={onClose}>
                                   Cancel
                              </Button>
                              <Button
                                   variant="primary"
                                   type="submit"
                                   isLoading={loading}
                              >
                                   Create Product
                              </Button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default NewProductModal;
