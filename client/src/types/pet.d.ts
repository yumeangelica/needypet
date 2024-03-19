
import { User } from './user';
// Definition of the Pet, Need and CareRecord interfaces

type UserID = User; // type alias for the User type

type Quantity = {
  value: number;
  unit: 'ml' | 'g';
};

type Duration = {
  value: number;
  unit: 'minutes';
};

type Frequency = {
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
  quantity?: Quantity;
  duration?: Duration;
}

interface Need {
  id?: string;
  dateFor: string;
  category: string;
  description: string;
  quantity?: Quantity;
  duration?: Duration;
  completed?: boolean;
  careRecords?: CareRecord[];
  archived?: boolean;
  isActive?: boolean;
  frequency?: Frequency;
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