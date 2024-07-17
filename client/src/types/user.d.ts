
type Token = string;

interface User {
  id: string;
  userName: string;
  email?: string;
  timezone?: string;
  emailConfirmed: boolean;
}

interface UserStoreState {
  token: Token;
  userName: User['userName'];
  id: User['id'];
  timezone: User['timezone'];
  emailConfirmed: User['emailConfirmed'];
}

export { Token, User, UserStoreState };