// Centralized dayjs setup. Extends the UTC and timezone plugins once and
// re-exports the configured instance so components don't repeat the extends.
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
