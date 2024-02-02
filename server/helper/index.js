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

module.exports = {
  dailyTaskCompleter,
};
