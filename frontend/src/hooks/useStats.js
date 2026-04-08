import { useState, useEffect } from 'react';
import { statsAPI } from '../services/api';

const useStats = (endpoint) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchers = {
    dashboard:       statsAPI.dashboard,
    weekly:          statsAPI.weekly,
    monthly:         statsAPI.monthly,
    categories:      statsAPI.categories,
    moodCorrelation: statsAPI.moodCorrelation,
    bestWorst:       statsAPI.bestWorst,
    heatmap:         statsAPI.heatmap,
  };

  useEffect(() => {
    const fn = fetchers[endpoint];
    if (!fn) return;
    setLoading(true);
    fn()
      .then(({ data: res }) => { setData(res.data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [endpoint]);

  return { data, loading, error };
};

export default useStats;
