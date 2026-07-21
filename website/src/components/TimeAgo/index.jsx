import { useEffect, useState } from "react";
import dayjs from "dayjs";

import Config from "../../common/Config.js";

import './index.less'

const formatRelativeTime = (moment)=> {
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
  const [timeLabel, setTimeLabel] = useState('');

  useEffect(() => {
    const onTick = () => {
      let moment = '';
      if (sentAt && sentAt !== '') {
        const serverTimezone = Config.timezone();
        if (serverTimezone.toUpperCase() === 'UTC') {
          moment = dayjs.utc(sentAt).tz(dayjs.tz.guess());
        } else {
          moment = dayjs.tz(sentAt, serverTimezone).tz(dayjs.tz.guess());
        }
      }
      setTimeLabel(formatRelativeTime(moment));
    };

    const intervalId = setInterval(onTick, 60000);

    onTick();

    return () => clearInterval(intervalId);
  }, [sentAt]);

  return (
    <span className={['time-ago', className].join(' ')}>
      {timeLabel}
    </span>
  );
}

export default TimeAgo;
