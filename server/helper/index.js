const Pet = require('../models/petModel');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

/**
 * @description Completes the daily task if the total quantity or duration is greater than or equal to the need quantity or duration
 * @param {*} need
 * @returns
 */
const dailyTaskCompleter = need => {
  if (!need.careRecords) { // If there are no care records, return false
    return false;
  }

  if (need.completed) { // If the need is already completed, return
    return;
  }

  const taskType = need.quantity.value ? 'quantity' : need.duration.value ? 'duration' : null; // Check if the need is quantity or duration

  switch (taskType) {
  case 'quantity':
  {
    const totalQuantity = need.careRecords.reduce((total, record) => total + record.quantity.value, 0); // Calculate the total quantity
    if (totalQuantity >= need.quantity.value) { // If the total quantity is greater than or equal to the need quantity, set the need as completed
      need.completed = true;
    }

    break;
  }

  case 'duration':
  {
    const totalDuration = need.careRecords.reduce((total, record) => total + record.duration.value, 0); // Calculate the total duration
    if (totalDuration >= need.duration.value) { // If the total duration is greater than or equal to the need duration, set the
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
 * @returns true or false
 */
const tzIdentifierChecker = timezone => { // Timezone is in format 'Europe/Helsinki'
  const timezones = Intl.supportedValuesOf('timeZone');
  return timezones.includes(timezone); // Check if the timezone is valid
};

/**
 * @description Checks the local date by timezone, returns the formatted date
 * @param {*} timezone
 * @returns formatted date in 'YYYY-MM-DD' format
  */
const checkLocalDateByTimezone = timezone => {
  console.log('check', Intl.supportedValuesOf('timeZone').includes(timezone));
  if (!Intl.supportedValuesOf('timeZone').includes(timezone)) {
    return new Error('Invalid timezone');
  }

  const newDate = dayjs().tz(timezone);
  const formattedDate = newDate.format('YYYY-MM-DD');
  return formattedDate;
};

/**
 * @description Algorithm for processing and archiving past day's pet needs for users in midnight timezones, while generating fresh, unfulfilled tasks for the new day
 * @param {*} _request
 * @param {*} _response
 * @param {*} next
 * @returns
  */
const updatePetNeedstoNextDays = async () => {
  const User = require('../models/userModel');

  try {
    const timezones = Intl.supportedValuesOf('timeZone');
    const midnightTimezones = timezones.filter(timezone => {
      const newDate = dayjs().tz(timezone);
      return newDate.hour() === 0 && newDate.minute() === 0;
    }, []);

    // Find all users by midnight timezones
    if (midnightTimezones.length === 0) {
      return;
    }

    const timezoneUsers = await User.aggregate([ // Find all users by midnight timezones from database
      {
        $match: {
          timezone: { $in: midnightTimezones },
        },
      },
      {
        $project: { // Exclude from result
          passwordHash: 0,
          __v: 0,
          email: 0,
          userName: 0,
        },
      },
    ]);

    if (timezoneUsers.length === 0) {
      return;
    }

    const newDate = dayjs().tz(timezoneUsers[0].timezone);

    const timezoneOffsetInMilliseconds = newDate.utcOffset() * 60 * 1000; // Get the timezone offset in milliseconds

    const utcDateObject = new Date(); // Get the UTC date object

    const localDateObject = new Date(utcDateObject.getTime() + timezoneOffsetInMilliseconds); // Get the local date object

    // Find all pets of the timezoneUsers with reduce make unique set list of all pets
    const allPetsSet = timezoneUsers.reduce((allPets, user) => {
      user.pets.forEach(petId => allPets.add(petId));
      return allPets;
    }, new Set());
    const uniquePetIdsList = [...allPetsSet];

    const allPets = await Pet.find({ _id: { $in: uniquePetIdsList } }); // Find all pets from list from database - midnight users

    if (allPets.length === 0) {
      return;
    }

    allPets.forEach(pet => {
      // Find all needs which are not archived by pet
      const notArchivedNeeds = pet.needs.reduce((acc, need) => {
        if (!need.archived && !need.isActive) { // If the need is not archived and not active, set it as archived and not active
          need.archived = true;
        } else if (!need.archived && need.isActive) {
          acc.push(need);
        }

        return acc;
      }, []);

      let needsUpdated = false; // Flag for checking if needs are updated

      notArchivedNeeds.forEach(need => {
        const needDate = dayjs(need.dateFor);
        if (needDate.isSameOrAfter(localDateObject, 'day')) {
          return;
        }

        needsUpdated = true;
        need.archived = true;
        need.isActive = false;

        const newNeedCopy = JSON.parse(JSON.stringify(need)); // Take deep copy of need

        const howManyDaysDifference = dayjs(localDateObject).diff(dayjs(newNeedCopy.dateFor), 'days');

        for (let i = 1; i <= howManyDaysDifference; i++) { // Loop through between the last need date and today
          let newNeed = {
            dateFor: dayjs(newNeedCopy.dateFor).add(i, 'days').toDate(),
            archived: i === howManyDaysDifference ? false : true, // If it's the last day, it's not archived
            isActive: i === howManyDaysDifference ? true : false, // If it's the last day, it's active
            category: newNeedCopy.category,
            completed: false,
            careRecords: [],
            description: newNeedCopy.description,
          };
          if (newNeedCopy.duration) {
            newNeed = { ...newNeed, duration: newNeedCopy.duration };
          } else if (newNeedCopy.quantity) {
            newNeed = { ...newNeed, quantity: newNeedCopy.quantity };
          }

          pet.needs.push(newNeed);
        }
      });
      if (needsUpdated) {
        pet.save();
        console.log(`${pet.name}'s needs updated`);
      }
    });
  } catch (error) {
    console.error('Error in updatePetNeedstoNextDays', error);
  }
};

module.exports = {
  dailyTaskCompleter,
  tzIdentifierChecker,
  updatePetNeedstoNextDays,
  checkLocalDateByTimezone,
};
