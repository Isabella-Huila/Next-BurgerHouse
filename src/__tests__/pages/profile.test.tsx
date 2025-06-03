import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfilePage from '@/app/profile/page';
import authSlice from '@/lib/redux/slices/authSlice';
import usersSlice from '@/lib/redux/slices/usersSlice';

jest.mock('@/components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

jest.mock('@/components/auth/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile-component">Profile Component</div>;
  };
});

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      users: usersSlice
    },
    preloadedState: {
      auth: {
        user: { id: '1', email: 'test@test.com', fullName: 'Test User', isActive: true, roles: ['customer'] },
        token: 'mock-token',
        isLoading: false,
        error: null,
        isAuthenticated: true
      },
      users: {
        users: [],
        loading: { fetch: false, update: false, delete: false },
        error: null,
        pagination: { limit: 10, total: 0 },
        filters: {}
      }
    }
  });
};

describe('ProfilePage', () => {
  it('renders profile page with protected route', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('profile-component')).toBeInTheDocument();
  });
});
