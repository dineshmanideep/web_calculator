import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const useCalculatorHistory = (user, setInput, inputRef) => {
  const [history, setHistory] = useState([]);
  const [lastAnswer, setLastAnswer] = useState('');

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/history`, { withCredentials: true });
      const formattedHistory = data.history.map((item) => `${item.expr} = ${item.result}`);
      setHistory(formattedHistory);
      if (formattedHistory.length > 0) {
        const parts = formattedHistory[0].split('=');
        setLastAnswer(parts.length > 1 ? parts[1].trim() : '');
      }
    } catch (error) {
      toast.error('Failed to fetch history.');
      console.error('Fetch history error:', error);
    }
  };

  const pushHistory = async (expr, result) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/history`, { expr, result }, { withCredentials: true });
      // The backend returns the updated history array
      const formattedHistory = data.history.map((item) => `${item.expr} = ${item.result}`);
      setHistory(formattedHistory);
      setLastAnswer(String(result));
    } catch (error) {
      toast.error('Failed to save to history');
      console.error('History push error:', error);
    }
  };

  const clearHistory = async () => {
    if (history.length === 0) {
      toast.info('History is already empty');
      return;
    }
    try {
      await axios.delete(`${API_URL}/auth/history`, { withCredentials: true });
      setHistory([]);
      setLastAnswer('');
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history.');
      console.error('Clear history error:', error);
    }
  };

  const handleHistoryClick = (entry) => {
    try {
      const expr = entry.split('=')[0];
      setInput(expr.trim());
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
      toast.info('Expression loaded from history');
    } catch (error) {
      toast.error('Failed to load expression from history');
      console.error('History click error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    history,
    lastAnswer,
    setLastAnswer,
    fetchHistory,
    pushHistory,
    clearHistory,
    handleHistoryClick,
  };
};

export default useCalculatorHistory;
