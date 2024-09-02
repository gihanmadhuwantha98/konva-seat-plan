import React, { useState, useEffect } from 'react';

const GroupNameEditor = ({ groupId, updateGroupLabels }) => {
  const [label, setLabel] = useState('');
  const [position, setPosition] = useState('both'); 
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    handleUpdateLabel();
  }, [isActive, position, label]);

  const handleUpdateLabel = () => {
    if (!isActive) {
      // If not active, clear both labels
      updateGroupLabels(groupId, 'left', '');
      updateGroupLabels(groupId, 'right', '');
    } else if (position === 'left') {
      updateGroupLabels(groupId, 'left', label);
      updateGroupLabels(groupId, 'right', '');
    } else if (position === 'right') {
      updateGroupLabels(groupId, 'right', label);
      updateGroupLabels(groupId, 'left', '');
    } else if (position === 'both') {
      updateGroupLabels(groupId, 'left', label);
      updateGroupLabels(groupId, 'right', label);
    }
  };

  return (
    <div>
      <label  style={{ marginRight: '20px' }}>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>
      <label style={{ marginRight: '20px' }}>
        Position:
        <select value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="both">Both</option>
        </select>
      </label>
      <input
        type="text"
        placeholder="Group Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="form-element"
      />
    </div>
  );
};

export default GroupNameEditor;
