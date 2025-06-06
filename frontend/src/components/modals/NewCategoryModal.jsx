import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../ui/button';
import Input from '../ui/input';

const NewCategoryModal = ({ isOpen, onClose, onSuccess }) => {
     const [formData, setFormData] = useState({
          name: '',
          description: ''
     });

     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);

          try {
               const response = await fetch('http://localhost:5000/api/categories', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
               });

               if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create category');
               }

               toast.success('Category created successfully');
               setFormData({ name: '', description: '' });
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
               <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                    <div className="p-6 border-b border-gray-200">
                         <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                         <Input
                              label="Category Name"
                              name="name"
                              icon={<Tag size={18} />}
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Enter category name"
                              required
                         />

                         <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                   Description (optional)
                              </label>
                              <textarea
                                   name="description"
                                   id="description"
                                   value={formData.description}
                                   onChange={handleChange}
                                   className="w-full rounded-md border border-gray-300 p-2 shadow-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                   placeholder="Enter category description"
                              />
                         </div>

                         {error && (
                              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                   {error}
                              </div>
                         )}

                         <div className="flex justify-end gap-2">
                              <Button
                                   type="button"
                                   variant="outline"
                                   onClick={() => {
                                        onClose();
                                        setError(null);
                                        setFormData({ name: '', description: '' });
                                   }}
                                   disabled={loading}
                              >
                                   Cancel
                              </Button>
                              <Button
                                   type="submit"
                                   variant="primary"
                                   isLoading={loading}
                                   disabled={loading}
                              >
                                   Create Category
                              </Button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default NewCategoryModal;