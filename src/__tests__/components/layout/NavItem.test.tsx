import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavItem from '@/components/layout/NavItem';

describe('NavItem', () => {
  describe('Basic Rendering', () => {
    it('should render with href and children', () => {
      render(
        <NavItem href="/test">
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Test Link');
    });

    it('should render with complex children elements', () => {
      render(
        <NavItem href="/complex">
          <span>Complex</span>
          <strong>Content</strong>
        </NavItem>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/complex');
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render with empty children', () => {
      render(
        <NavItem href="/empty">
          {''}
        </NavItem>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/empty');
      expect(link).toHaveTextContent('');
    });
  });

  describe('Href Attribute', () => {
    it('should handle different href formats', () => {
      const testCases = [
        '/simple',
        '/nested/path',
        '/path/with-dashes',
        '/path_with_underscores',
        '/path123',
        '/',
        '/users',
        '/profile'
      ];

      testCases.forEach((href, index) => {
        const { unmount } = render(
          <NavItem href={href}>
            Link {index}
          </NavItem>
        );

        const link = screen.getByRole('link', { name: `Link ${index}` });
        expect(link).toHaveAttribute('href', href);
        
        unmount();
      });
    });

    it('should handle external URLs', () => {
      render(
        <NavItem href="https://example.com">
          External Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'External Link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should handle relative URLs', () => {
      render(
        <NavItem href="../relative">
          Relative Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Relative Link' });
      expect(link).toHaveAttribute('href', '../relative');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply default CSS classes', () => {
      render(
        <NavItem href="/test">
          Default Classes
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Default Classes' });
      expect(link).toHaveClass('text-sm');
      expect(link).toHaveClass('font-medium');
      expect(link).toHaveClass('text-gray-700');
      expect(link).toHaveClass('hover:text-[#ff914d]');
      expect(link).toHaveClass('transition-colors');
    });

    it('should apply custom className when provided', () => {
      render(
        <NavItem href="/test" className="custom-class">
          Custom Class
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Custom Class' });
      expect(link).toHaveClass('custom-class');
      expect(link).toHaveClass('text-sm');
      expect(link).toHaveClass('font-medium');
    });

    it('should handle multiple custom classes', () => {
      render(
        <NavItem href="/test" className="class1 class2 class3">
          Multiple Classes
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Multiple Classes' });
      expect(link).toHaveClass('class1');
      expect(link).toHaveClass('class2');
      expect(link).toHaveClass('class3');
    });

    it('should handle empty className prop', () => {
      render(
        <NavItem href="/test" className="">
          Empty Class
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Empty Class' });
      expect(link).toHaveClass('text-sm');
      expect(link).toHaveClass('font-medium');
      expect(link).not.toHaveClass('undefined');
    });

    it('should handle undefined className prop', () => {
      render(
        <NavItem href="/test" className={undefined}>
          Undefined Class
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Undefined Class' });
      expect(link).toHaveClass('text-sm');
      expect(link).toHaveClass('font-medium');
    });
  });

  describe('Children Content', () => {
    it('should render string children correctly', () => {
      render(
        <NavItem href="/test">
          Simple String
        </NavItem>
      );

      expect(screen.getByText('Simple String')).toBeInTheDocument();
    });

    it('should render React element children', () => {
      render(
        <NavItem href="/test">
          <span data-testid="child-element">React Element</span>
        </NavItem>
      );

      expect(screen.getByTestId('child-element')).toBeInTheDocument();
      expect(screen.getByText('React Element')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <NavItem href="/test">
          <span>First</span>
          <span>Second</span>
          Third
        </NavItem>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should render children with special characters', () => {
      render(
        <NavItem href="/test">
          Special & Characters! @#$%
        </NavItem>
      );

      expect(screen.getByText('Special & Characters! @#$%')).toBeInTheDocument();
    });

    it('should render children with numbers', () => {
      render(
        <NavItem href="/test">
          {123}
        </NavItem>
      );

      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      render(
        <NavItem href="/test">
          {null}
        </NavItem>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible as a link', () => {
      render(
        <NavItem href="/accessible">
          Accessible Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Accessible Link' });
      expect(link).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <NavItem href="/keyboard">
          Keyboard Nav
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Keyboard Nav' });
      expect(link).toBeInTheDocument();
      
      // Links are naturally focusable
      link.focus();
      expect(link).toHaveFocus();
    });

    it('should work with screen readers', () => {
      render(
        <NavItem href="/screen-reader">
          Screen Reader Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Screen Reader Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAccessibleName('Screen Reader Link');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long href', () => {
      const longHref = '/very/long/path/that/goes/on/and/on/and/continues/for/a/while';
      render(
        <NavItem href={longHref}>
          Long Href
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Long Href' });
      expect(link).toHaveAttribute('href', longHref);
    });

    it('should handle very long children text', () => {
      const longText = 'This is a very long text that might be used as navigation item content and should be handled properly by the component';
      
      render(
        <NavItem href="/long-text">
          {longText}
        </NavItem>
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle href with query parameters', () => {
      render(
        <NavItem href="/search?q=test&category=all">
          Search Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Search Link' });
      expect(link).toHaveAttribute('href', '/search?q=test&category=all');
    });

    it('should handle href with hash', () => {
      render(
        <NavItem href="/page#section">
          Hash Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Hash Link' });
      expect(link).toHaveAttribute('href', '/page#section');
    });
  });

  describe('Component Props Interface', () => {
    it('should accept all required props', () => {
      render(
        <NavItem href="/required">
          Required Props
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Required Props' });
      expect(link).toBeInTheDocument();
    });

    it('should work without optional className prop', () => {
      render(
        <NavItem href="/optional">
          No Optional Props
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'No Optional Props' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass('text-sm');
    });

    it('should handle all props together', () => {
      render(
        <NavItem href="/all-props" className="extra-class">
          <span>All Props</span>
        </NavItem>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/all-props');
      expect(link).toHaveClass('extra-class');
      expect(screen.getByText('All Props')).toBeInTheDocument();
    });
  });

  describe('HTML Structure', () => {
    it('should render as an anchor element', () => {
      render(
        <NavItem href="/anchor">
          Anchor Element
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Anchor Element' });
      expect(link.tagName).toBe('A');
    });

    it('should have proper HTML structure', () => {
      const { container } = render(
        <NavItem href="/structure">
          Structure Test
        </NavItem>
      );

      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor).toHaveAttribute('href', '/structure');
      expect(anchor).toHaveTextContent('Structure Test');
    });
  });
});