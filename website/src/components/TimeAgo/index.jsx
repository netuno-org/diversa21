import { useEffect, useState } from "react";
import dayjs from "dayjs";

import Config from "../../common/Config.js";

import './index.less'

function formatRelativeTime(moment) {
  if (!moment) {
    return '';
  }

  if (!moment.isValid()) {
    return '';
  }

  const minutes = dayjs().diff(moment, "minute");
  if (minutes < 1) {
    return "Há alguns segundos";
  }
  if (minutes < 60) {
    return `Há ${minutes} min`;
  }

  const hours = dayjs().diff(moment, "hour");
  if (hours < 24) {
    return `Há ${hours} h`;
  }

  const days = dayjs().diff(moment, "day");
  if (days < 7) {
    return `Há ${days} d`;
  }

  return moment.format("DD/MM/YY");
}

function TimeAgo({ sentAt, className = '' }) {
  const [timeRefresh, setTimeRefresh] = useState(0);
  const [timeLabel, setTimeLabel] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRefresh((n) => n + 1);
    }, 60000);

    let moment = '';
    if (sentAt && sentAt !== '') {
      const serverTimezone = Config.timezone();
      moment = dayjs.tz(sentAt, serverTimezone).tz(dayjs.tz.guess());
    }
    setTimeLabel(formatRelativeTime(moment));

    return () => clearInterval(intervalId);
  }, []);

  const classes = ['time-ago', className].join(' ');

  return (
    <span className={classes}>
      {timeLabel}
    </span>
  );
}

export default TimeAgo;
