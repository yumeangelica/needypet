import { User } from './user';
// Definition of the Pet, Need and CareRecord interfaces

type User = User;

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
  id?: string;
  name: string;
  species?: string;
  breed?: string;
  description?: string;
  birthday?: Date;
  owner?: User;
  careTakers?: User[];
  needs?: Need[];
}

interface PetState {
  pets: Pet[];
}

interface NewPetObject {
  name: string;
  breed: string;
  species: string;
  description: string;
  birthday: Date | null;
}

export { Pet, Need, CareRecord, PetState, QuantityRecord, DurationRecord, NewPetObject };
