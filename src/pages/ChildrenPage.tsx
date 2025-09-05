import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Play, Users, Calendar } from 'lucide-react';
import { Layout } from '../components/Layout';
import { StorageService } from '../services/storage';
import { Child, AgeGroup } from '../types';
import { /* AGE_GROUPS */ } from '../utils/constants';

export const ChildrenPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    ageGroup: '' as AgeGroup
  });

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = () => {
    const allChildren = StorageService.getChildren();
    setChildren(allChildren);
  };

  const determineAgeGroup = (age: number): AgeGroup => {
    if (age >= 3 && age <= 5) return "3-5";
    if (age >= 6 && age <= 8) return "6-8";
    if (age >= 9 && age <= 12) return "9-12";
    return "6-8"; // default
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const age = parseInt(formData.age);
    const ageGroup = determineAgeGroup(age);
    
    if (editingChild) {
      // Update existing child
      StorageService.updateChild(editingChild.id, {
        name: formData.name,
        age,
        ageGroup
      });
    } else {
      // Add new child
      const newChild: Child = {
        id: Date.now().toString(),
        name: formData.name,
        age,
        ageGroup,
        createdAt: new Date().toISOString()
      };
      StorageService.addChild(newChild);
    }
    
    resetForm();
    loadChildren();
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      age: child.age.toString(),
      ageGroup: child.ageGroup
    });
    setShowAddForm(true);
  };

  const handleDelete = (childId: string) => {
    if (window.confirm('Are you sure you want to delete this child? All associated assessment data will be lost.')) {
      StorageService.deleteChild(childId);
      loadChildren();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', age: '', ageGroup: '' as AgeGroup });
    setEditingChild(null);
    setShowAddForm(false);
  };

  const getSessionCount = (childId: string) => {
    return StorageService.getSessionsForChild(childId).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-clinical-800">Children Management</h1>
            <p className="text-clinical-600 mt-1">
              Add and manage children for assessments
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Child</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card">
            <h2 className="text-lg font-semibold text-clinical-800 mb-4">
              {editingChild ? 'Edit Child' : 'Add New Child'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-clinical-700 mb-2">
                    Child's Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter child's name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-clinical-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="12"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="input-field"
                    placeholder="Age (3-12)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-clinical-700 mb-2">
                    Age Group (Auto-determined)
                  </label>
                  <input
                    type="text"
                    value={formData.age ? determineAgeGroup(parseInt(formData.age)) : ''}
                    readOnly
                    className="input-field bg-clinical-50"
                    placeholder="Will be set automatically"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary">
                  {editingChild ? 'Update Child' : 'Add Child'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Children List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-clinical-800 mb-4">
            All Children ({children.length})
          </h2>
          
          {children.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-clinical-300" size={64} />
              <h3 className="text-lg font-medium text-clinical-600 mt-4">No children added yet</h3>
              <p className="text-clinical-500 mt-2">
                Add your first child to start conducting digital addiction assessments
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary mt-4"
              >
                Add First Child
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-clinical-200">
                <thead className="bg-clinical-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Age Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-clinical-200">
                  {children.map((child) => (
                    <tr key={child.id} className="hover:bg-clinical-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-clinical-900">
                            {child.name}
                          </div>
                          <div className="text-sm text-clinical-500">
                            Age {child.age}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                          {child.ageGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="text-clinical-400" size={16} />
                          <span className="ml-2 text-sm text-clinical-900">
                            {getSessionCount(child.id)} sessions
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-clinical-500">
                        {formatDate(child.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/assess/${child.id}`}
                            className="text-green-600 hover:text-green-500"
                            title="Start Assessment"
                          >
                            <Play size={18} />
                          </Link>
                          <button
                            onClick={() => handleEdit(child)}
                            className="text-primary-600 hover:text-primary-500"
                            title="Edit Child"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(child.id)}
                            className="text-red-600 hover:text-red-500"
                            title="Delete Child"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
