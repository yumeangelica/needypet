
import { User } from './user';
// Definition of the Pet, Need and CareRecord interfaces

type UserID = User; // Type alias for the User type

type Quantity = {
  value: number;
  unit: 'ml' | 'g';
};

type Duration = {
  value: number;
  unit: 'minutes';
};

interface DurationRecord {
  note: string;
  duration: {
    value: number;
    unit: string;
  };
}

interface QuantityRecord {
  note: string;
  quantity: {
    value: number;
    unit: string;
  };
}

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


interface Need {
  id?: string;
  dateFor: string;
  category: string;
  description: string;
  quantity?: Quantity;
  duration?: Duration;
  completed?: boolean;
  careRecords?: DurationRecord[] | QuantityRecord[];
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

export { Pet, Need, CareRecord, PetState, QuantityRecord, DurationRecord };