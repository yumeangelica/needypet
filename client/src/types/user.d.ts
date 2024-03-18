
type Token = string;

interface User {
  id: string;
  userName: string;
  email?: string;
  timezone?: string;
}

interface UserStoreState {
  token: Token;
  userName: User["userName"];
  id: User["id"];
}

export { Token, User, UserStoreState };