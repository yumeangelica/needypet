
type Token = string;

interface User {
  id: string;
  userName: string;
  email?: string;
  timezone?: string;
}

interface UserStoreState {
  token: Token;
  userName: User['userName'];
  id: User['id'];
  timezone: User['timezone'];
}

export { Token, User, UserStoreState };