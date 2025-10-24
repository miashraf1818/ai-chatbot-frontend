import React from 'react';
import moment from 'moment';

function TimeDisplay({ timestamp }) {
  const formatTime = (ts) => {
    if (!ts) return '';
    
    const now = moment();
    const time = moment(ts);
    const diffMinutes = now.diff(time, 'minutes');
    const diffHours = now.diff(time, 'hours');
    const diffDays = now.diff(time, 'days');

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.format('MMM D');
  };

  return (
    <span className="message-time" title={moment(timestamp).format('LLLL')}>
      {formatTime(timestamp)}
    </span>
  );
}

export default TimeDisplay;
