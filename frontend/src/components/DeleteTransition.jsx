import React from 'react';
import { CSSTransition } from 'react-transition-group';
import '../styles/DeleteTransitions.css';

const DeleteTransition = ({ 
  children, 
  show, 
  type = 'item', // 'item', 'list-item', 'card', 'project', 'task', 'subtask'
  onExited,
  duration = 600
}) => {
  const nodeRef = React.useRef(null);

  return (
    <CSSTransition
      in={show}
      nodeRef={nodeRef}
      timeout={duration}
      classNames={`delete-${type}`}
      unmountOnExit
      onExited={onExited}
    >
      <div ref={nodeRef}>
        {children}
      </div>
    </CSSTransition>
  );
};

export default DeleteTransition;

// Usage example:
/*
import DeleteTransition from './DeleteTransition';

// In your component:
const [showItem, setShowItem] = useState(true);

const handleDelete = () => {
  setShowItem(false);
  // The item will animate out, then onExited will be called
  // where you can perform the actual deletion from your data
};

return (
  <DeleteTransition 
    show={showItem} 
    type="task"
    onExited={() => {
      // Actually remove the item from your data
      deleteTaskFromDatabase(taskId);
    }}
  >
    <div className="task-item">
      Task content here...
    </div>
  </DeleteTransition>
);
*/ 