export const ROUTES = {
  root: '/',
  login: '/logowanie',
  clients: '/klienci',
  earnings: '/zarobki',
  clientNew: '/klienci/nowy',
  client: (id: string) => `/klienci/${id}`,
  clientEdit: (id: string) => `/klienci/${id}/edycja`,
  users: '/uzytkownicy',
} as const
