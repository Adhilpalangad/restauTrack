import { useState, useEffect, useCallback } from 'react';
import { History, Loader2, FileSearch } from 'lucide-react';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import FilterBar from '../components/history/FilterBar';
import HistoryCard from '../components/history/HistoryCard';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';

import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { getRecordsByDateRange } from '../services/dailyRecordService';
import { getDateRange, getToday } from '../utils/dates';
import { HISTORY_PAGE_SIZE } from '../utils/constants';

const HistoryPage = () => {
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activePreset, setActivePreset] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchRecords = useCallback(async (start, end, append = false) => {
    if (!user) return;
    
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const result = await getRecordsByDateRange(
        user.uid, selectedHotel, start, end, HISTORY_PAGE_SIZE, append ? lastDoc : null
      );

      if (append) {
        setRecords((prev) => [...prev, ...result.records]);
      } else {
        setRecords(result.records);
      }
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, lastDoc]);

  // Initial load
  useEffect(() => {
    // Clear out to avoid cross-hotel data bleeding
    setRecords([]);
    setLastDoc(null);
    
    const range = getDateRange('thisMonth');
    setStartDate(range.start);
    setEndDate(range.end);
    fetchRecords(range.start, range.end);
  }, [user, selectedHotel]);

  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    if (preset !== 'custom') {
      const range = getDateRange(preset);
      setStartDate(range.start);
      setEndDate(range.end);
      setLastDoc(null);
      fetchRecords(range.start, range.end);
    }
  };

  const handleApplyCustom = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both dates');
      return;
    }
    setLastDoc(null);
    fetchRecords(startDate, endDate);
  };

  const handleLoadMore = () => {
    fetchRecords(startDate, endDate, true);
  };

  return (
    <>
      <Header title="History" />
      
      <div className="p-4 space-y-4">
        <FilterBar
          activePreset={activePreset}
          onPresetChange={handlePresetChange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApplyCustom={handleApplyCustom}
        />

        {/* Records */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" className="h-32" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No records found"
            description="No entries for this period. Start tracking today!"
          />
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <HistoryCard key={record.id} record={record} />
            ))}

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-ghost w-full flex items-center justify-center gap-2 border border-border"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryPage;
