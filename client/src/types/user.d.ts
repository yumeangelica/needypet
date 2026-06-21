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
  timezone: User['timezone'];
  emailConfirmed: User['emailConfirmed'] | null;
}

interface loginData {
  isSuccess: boolean;
  message: string;
}

export { loginData, Token, User, UserStoreState };
