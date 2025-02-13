import PersonalSpace from '../components/PersonalSpace/PersonalSpace';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Login from '../components/Login/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'personal-space',
        element: <PersonalSpace />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router; 