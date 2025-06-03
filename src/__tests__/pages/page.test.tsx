import React from 'react';
import { render } from '@testing-library/react';
import Home from '../../app/page';

jest.mock('../../components/home/WelcomePage', () => {
  return function MockWelcomePage() {
    return <div data-testid="welcome-page">Welcome Page Component</div>;
  };
});

describe('Home Page', () => {
  it('should render WelcomePage component', () => {
    const { getByTestId } = render(<Home />);
    
    expect(getByTestId('welcome-page')).toBeInTheDocument();
  });

  it('should return WelcomePage as the main component', () => {
    const result = Home();
    
    expect(result.type.name).toBe('MockWelcomePage');
  });
});
