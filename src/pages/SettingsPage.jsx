import { useState, useEffect } from 'react';
import { User, Tag, Database, Info, LogOut, Trash2, Download, FileJson, Loader2, ChevronRight, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import Modal from '../components/common/Modal';

import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/auth';
import { useCategories } from '../hooks/useCategories';
import { deleteCategory } from '../services/categoryService';
import { getAllRecordsByDateRange } from '../services/dailyRecordService';
import { exportToExcel, exportAllData } from '../services/exportService';

const SettingsPage = () => {
  const { user } = useAuth();
  const { categories, refreshCategories } = useCategories(user?.uid);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await deleteCategory(user.uid, catId);
      await refreshCategories();
      toast.success('Category deleted');
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const records = await getAllRecordsByDateRange(user.uid, '2020-01-01', '2030-12-31');
      exportToExcel(records, 'all-time', 'all-time');
      toast.success('Excel exported!');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = async () => {
    setExportingJson(true);
    try {
      const records = await getAllRecordsByDateRange(user.uid, '2020-01-01', '2030-12-31');
      exportAllData(records);
      toast.success('Backup created!');
    } catch (err) {
      toast.error('Backup failed');
    } finally {
      setExportingJson(false);
    }
  };

  const SettingItem = ({ icon: Icon, label, description, onClick, danger, rightContent }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 text-left transition-colors rounded-xl ${
        danger ? 'hover:bg-danger/5' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        danger ? 'bg-danger/10' : 'bg-primary/5'
      }`}>
        <Icon className={`w-5 h-5 ${danger ? 'text-danger' : 'text-primary'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-danger' : 'text-text-primary'}`}>{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {rightContent || <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />}
    </button>
  );

  return (
    <>
      <Header title="Settings" />

      <div className="p-4 space-y-4">
        {/* Profile */}
        <div className="card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-light p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{user?.displayName || 'Restaurant Owner'}</h3>
                <p className="text-white/60 text-xs">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="card p-0">
          <SettingItem
            icon={Tag}
            label="Manage Categories"
            description={`${categories.length} categories saved`}
            onClick={() => setShowCategoriesModal(true)}
          />
        </div>

        {/* Data Management */}
        <div className="card p-0 divide-y divide-border">
          <SettingItem
            icon={Download}
            label="Export to Excel"
            description="Download all data as .xlsx file"
            onClick={handleExportExcel}
            rightContent={exporting ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : undefined}
          />
          <SettingItem
            icon={FileJson}
            label="Export All Data (JSON)"
            description="Complete backup of all records"
            onClick={handleExportJson}
            rightContent={exportingJson ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : undefined}
          />
        </div>

        {/* App Info */}
        <div className="card p-0">
          <SettingItem
            icon={Info}
            label="About RestauTrack"
            description="Version 1.0.0"
            onClick={() => toast('RestauTrack v1.0.0 — Your Smart Money Manager', { icon: '🍽️' })}
          />
        </div>

        {/* Logout */}
        <div className="card p-0">
          <SettingItem
            icon={LogOut}
            label="Sign Out"
            description="You'll need to log in again"
            onClick={() => setShowLogoutModal(true)}
            danger
          />
        </div>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out?"
        actions={
          <>
            <button onClick={() => setShowLogoutModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleLogout} className="btn-danger flex-1">Sign Out</button>
          </>
        }
      >
        <p className="text-sm text-text-body">Are you sure you want to sign out? Your data is safely stored in the cloud.</p>
      </Modal>

      {/* Categories Modal */}
      <Modal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        title="Manage Categories"
      >
        {categories.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">No categories yet. Categories are added automatically when you type expense entries.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto -mx-4 px-4 space-y-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                  <p className="text-xs text-text-muted">Used {cat.usageCount || 0} times</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};

export default SettingsPage;
