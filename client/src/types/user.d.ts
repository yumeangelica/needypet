type Token = string;

interface User {
  id: string;
  userName: string;
  email?: string;
  timezone?: string;
  emailConfirmed: boolean;
}

interface UserStoreState {
  token: Token | null;
  userName: User['userName'] | null;
  id: User['id'] | null;
  timezone: string;
  emailConfirmed: User['emailConfirmed'] | null;
  email?: User['email'] | null;
}

interface loginData {
  isSuccess: boolean;
  message: string;
}

export { loginData, Token, User, UserStoreState };
