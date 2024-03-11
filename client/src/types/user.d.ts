
type Token = string;

interface User {
  id: string;
  userName: string;
}

interface UserState {
  token: Token;
  userName: User["userName"];
  id: User["id"];
}

export { Token, User, UserState };