/**
 * @description Completes the daily task if the total quantity or duration is greater than or equal to the need quantity or duration
 * @param {*} need
 * @returns
 */
const dailyTaskCompleter = need => {
  if (!need.careRecords) {
    return false;
  }

  if (need.completed) {
    return;
  }

  const taskType = Object.prototype.hasOwnProperty.call(need, 'quantity') ? 'quantity' : 'duration'; // Check if need object has quantity or duration

  switch (taskType) {
  case 'quantity':
  {
    const totalQuantity = need.careRecords.reduce((total, record) => total + record.quantity.value, 0);
    if (totalQuantity >= need.quantity.value) {
      console.log('totalQuantity', totalQuantity);
      need.completed = true;
    }

    break;
  }

  case 'duration':
  {
    const totalDuration = need.careRecords.reduce((total, record) => total + record.duration.value, 0);
    if (totalDuration >= need.duration.value) {
      console.log('totalDuration', totalDuration);
      need.completed = true;
    }

    break;
  }

  default:
    break;
  }
};

/**
 * @description Checks if the given timezone is valid
 * @param {*} timezone
 * @returns
 */
const tzIdentifierChecker = timezone => { // Timezone is in format 'Europe/Helsinki'
  const momentTimezoneData = require('moment-timezone/data/meta/latest.json');

  const timezones = Object.keys(momentTimezoneData.zones);

  return timezones.includes(timezone); // Check if list of timezones includes the given timezone, return true or false
};

module.exports = {
  dailyTaskCompleter,
  tzIdentifierChecker,
};
