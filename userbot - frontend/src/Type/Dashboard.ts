export interface UserDataProps {
  id: string;
  first_name: string;
  last_name?: string;
  balance: string;
  photo_url?: string;
}

export interface User {
  id: number | string;
  phone: string;
  status: boolean;
  firstName: string;
  lastName: string;
}

export interface UsersDataProps {
  success: boolean;
  users: User[];
}
