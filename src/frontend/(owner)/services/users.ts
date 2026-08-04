const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface UserItem {
  name: string;
  email: string;
  dept: string;
  role: string;
  status: string;
  active: boolean;
}

export interface UsersData {
  users: UserItem[];
}

export async function fetchUsersData(): Promise<UsersData> {
  // TODO: Replace with real API call
  await delay(500);
  return {
    users: [],
  };
}
