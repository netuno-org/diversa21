import { useEffect, useState } from "react";
import dayjs from "dayjs";

import './index.less'

function formatRelativeTime(sentAt) {
  if (!sentAt) {
    return '';
  }

  const date = dayjs(sentAt);
  if (!date.isValid()) {
    return '';
  }

  const minutes = dayjs().diff(date, "minute");
  if (minutes < 1) {
    return "Há alguns segundos";
  }
  if (minutes < 60) {
    return `Há ${minutes} min`;
  }

  const hours = dayjs().diff(date, "hour");
  if (hours < 24) {
    return `Há ${hours} h`;
  }

  const days = dayjs().diff(date, "day");
  if (days < 7) {
    return `Há ${days} d`;
  }

  return date.format("DD/MM");
}

function TimeAgo({ sentAt, className = '' }) {
  const [timeRefresh, setTimeRefresh] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRefresh((n) => n + 1);
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const timeLabel = formatRelativeTime(sentAt);
  const classes = ['time-ago', className].join(' ');

  return (
    <span className={classes}>
      {timeLabel}
    </span>
  );
}

export default TimeAgo;
