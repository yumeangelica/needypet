
import { User } from './user';
// Definition of the Pet, Need and CareRecord interfaces

type UserID = User; // type alias for the User type

type quantity = {
  value: number;
  unit: 'ml' | 'g';
};

type duration = {
  value: number;
  unit: 'minute' | 'minutes';
};

type frequency = {
  times: number;
  periodicity: {
    unit: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    customIntervalDays: number;
    startDate: Date;
    endDate: Date;
    nextReminder: Date;
    active: boolean;
  };
};

interface CareRecord {
  date: Date;
  careTaker: UserID;
  note?: string;
  quantity?: quantity;
  duration?: duration;
}

interface Need {
  dateFor: Date;
  category: string;
  description?: string;
  quantity?: quantity;
  duration?: duration;
  completed: boolean;
  careRecords?: CareRecord[];
  archived: boolean;
  isActive: boolean;
  frequency?: frequency;
}

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  description?: string;
  birthday?: Date;
  owner: UserID;
  careTakers: UserID[];
  needs: Need[];
}

interface PetState {
  pets: Pet[];
}

export { Pet, Need, CareRecord, PetState };