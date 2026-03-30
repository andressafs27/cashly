import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/templates/AppLayout'
import {
  Dashboard,
  Transactions,
  Categories,
  Reports,
  Goals,
  Settings,
} from '@/pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'categories', element: <Categories /> },
      { path: 'reports', element: <Reports /> },
      { path: 'goals', element: <Goals /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])