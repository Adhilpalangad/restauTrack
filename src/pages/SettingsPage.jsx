import { useState } from 'react';
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
import { useHotel } from '../context/HotelContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
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
      const records = await getAllRecordsByDateRange(user.uid, selectedHotel, '2020-01-01', '2030-12-31');
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
      const records = await getAllRecordsByDateRange(user.uid, selectedHotel, '2020-01-01', '2030-12-31');
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
      className="w-full flex items-center gap-3 p-4 text-left transition-all rounded-xl"
      style={{ color: 'inherit' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? 'rgba(244,63,94,0.05)' : 'var(--btn-ghost-bg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: danger ? 'rgba(244,63,94,0.10)' : 'rgba(99,102,241,0.08)',
        }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: danger ? '#F43F5E' : '#6366F1' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: danger ? '#F43F5E' : 'var(--text)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      {rightContent || <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
    </button>
  );

  return (
    <>
      <Header title="Settings" />

      <div className="p-4 space-y-4">
        {/* Profile */}
        <div className="glass-card overflow-hidden p-0">
          <div
            className="p-4"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.20)' }}
              >
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{user?.displayName || 'Restaurant Owner'}</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="glass-card p-0">
          <SettingItem
            icon={Tag}
            label="Manage Categories"
            description={`${categories.length} categories saved`}
            onClick={() => setShowCategoriesModal(true)}
          />
        </div>

        {/* Data Management */}
        <div className="glass-card p-0">
          <div style={{ borderBottom: '1px solid var(--divider)' }}>
            <SettingItem
              icon={Download}
              label="Export to Excel"
              description="Download all data as .xlsx file"
              onClick={handleExportExcel}
              rightContent={exporting ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6366F1' }} /> : undefined}
            />
          </div>
          <SettingItem
            icon={FileJson}
            label="Export All Data (JSON)"
            description="Complete backup of all records"
            onClick={handleExportJson}
            rightContent={exportingJson ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6366F1' }} /> : undefined}
          />
        </div>

        {/* App Info */}
        <div className="glass-card p-0">
          <SettingItem
            icon={Info}
            label="About RestauTrack"
            description="Version 1.0.0"
            onClick={() => toast('RestauTrack v1.0.0 — Your Smart Money Manager', { icon: '🍽️' })}
          />
        </div>

        {/* Logout */}
        <div className="glass-card p-0">
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
        <p className="text-sm">Are you sure you want to sign out? Your data is safely stored in the cloud.</p>
      </Modal>

      {/* Categories Modal */}
      <Modal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        title="Manage Categories"
      >
        {categories.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No categories yet. Categories are added automatically when you type expense entries.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto -mx-4 px-4 space-y-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg"
                style={{ borderBottom: '1px solid var(--divider)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{cat.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Used {cat.usageCount || 0} times</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F43F5E';
                    e.currentTarget.style.background = 'rgba(244,63,94,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }}
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
