import { useEffect } from 'react';
import useHabitStore from '../store/habitStore';

const useHabits = (params) => {
  const { habits, loading, error, fetchHabits } = useHabitStore();

  useEffect(() => {
    fetchHabits(params);
  }, []);

  return { habits, loading, error, refetch: () => fetchHabits(params) };
};

export default useHabits;
