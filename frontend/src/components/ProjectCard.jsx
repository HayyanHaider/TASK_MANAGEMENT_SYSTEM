import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getProjectStatusById } from '../services/api';

export default function ProjectCard({ project }) {
  const nav = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusData = await getProjectStatusById(project.status_id);
        setStatus(statusData);
      } catch (error) {
        console.error('Error fetching project status:', error);
      }
    };
    fetchStatus();
  }, [project.status_id]);

  return (
    <Card key={project.project_id}>
      <CardHeader className="text-xl font-semibold">
        {project.name}
        {status && (
          <div className="text-sm font-normal text-gray-500">
            Status: {status.name} ({status.progress})
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <p>{project.description}</p>
        <div className="flex space-x-2 mt-2">
          <Button onClick={() => nav(`/client/projects/${project.project_id}/details`)}>Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
