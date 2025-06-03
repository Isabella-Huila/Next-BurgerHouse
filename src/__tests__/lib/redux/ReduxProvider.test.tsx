import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReduxProvider } from '@/lib/redux/providers/ReduxProvider';


jest.mock('redux-persist/es/integration/react', () => ({
  PersistGate: ({ children }: { children: React.ReactNode }) => <div data-testid="persist-gate">{children}</div>,
}));

jest.mock('@/lib/redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
  persistor: {
    persist: jest.fn(),
    purge: jest.fn(),
    flush: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

jest.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
}));

describe('ReduxProvider', () => {
  it('should render children within Provider and PersistGate', () => {
    const TestComponent = () => <div data-testid="test-child">Test Child</div>;

    render(
      <ReduxProvider>
        <TestComponent />
      </ReduxProvider>
    );

    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('persist-gate')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should render multiple children correctly', () => {
    render(
      <ReduxProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ReduxProvider>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should render without children', () => {
    render(<ReduxProvider>{undefined}</ReduxProvider>);

    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('persist-gate')).toBeInTheDocument();
  });

  it('should handle null children', () => {
    render(<ReduxProvider>{null}</ReduxProvider>);

    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('persist-gate')).toBeInTheDocument();
  });

  it('should handle complex nested children', () => {
    const NestedComponent = () => (
      <div data-testid="nested">
        <span data-testid="nested-child">Nested Child</span>
      </div>
    );

    render(
      <ReduxProvider>
        <div data-testid="wrapper">
          <NestedComponent />
          <p data-testid="paragraph">Some text</p>
        </div>
      </ReduxProvider>
    );

    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('nested')).toBeInTheDocument();
    expect(screen.getByTestId('nested-child')).toBeInTheDocument();
    expect(screen.getByTestId('paragraph')).toBeInTheDocument();
  });

  it('should maintain the correct component hierarchy', () => {
    const TestChild = () => <div data-testid="test-child">Test</div>;

    const { container } = render(
      <ReduxProvider>
        <TestChild />
      </ReduxProvider>
    );

    const provider = screen.getByTestId('redux-provider');
    const persistGate = screen.getByTestId('persist-gate');
    const testChild = screen.getByTestId('test-child');

    expect(provider).toContainElement(persistGate);
    expect(persistGate).toContainElement(testChild);
  });
});