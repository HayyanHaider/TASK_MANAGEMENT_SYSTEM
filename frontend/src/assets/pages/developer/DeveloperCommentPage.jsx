// src/assets/pages/developer/DeveloperCommentPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import DeveloperComments from './DeveloperComments';

export default function DeveloperCommentPage() {
  const { taskId } = useParams();
  return (
    <div className="p-8">
      <DeveloperComments taskId={taskId} />
    </div>
  );
}
