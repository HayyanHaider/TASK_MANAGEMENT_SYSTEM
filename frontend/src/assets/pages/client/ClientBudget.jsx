// src/assets/pages/client/ClientBudget.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import ProgressBar from '../../../components/ProgressBar';

export default function ClientBudget() {
  const { projectId } = useParams();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(
      `http://localhost:3001/client/projects/${projectId}/budget`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(res => {
      setBudget(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Budget load error', err);
      setError('Failed to load budget');
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold">Budget Overview</h2>

      <Card className="max-w-md">
        <CardHeader className="text-xl font-semibold">
          Budget Details
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Allocated:</strong> ${budget.allocated_budget}</p>
          <p><strong>Spent:</strong>     ${budget.spent_budget}</p>
          <p><strong>Remaining:</strong> ${budget.remaining_budget}</p>
          <ProgressBar progress={calculateProgress(budget)} />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function
function calculateProgress(budget) {
  if (!budget || !budget.allocated_budget) return 0;
  const spent = parseFloat(budget.spent_budget || 0);
  const allocated = parseFloat(budget.allocated_budget);
  const progress = (spent / allocated) * 100;
  return Math.min(Math.max(progress, 0), 100); // clamp between 0-100
}
