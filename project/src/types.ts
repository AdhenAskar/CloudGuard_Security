export type Role = 'admin' | 'user';

export type Theme = 'light' | 'dark';

export type User = {
  name: string;
  email: string;
  role: Role;
  title: string;
  initials: string;
};
