import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';

const renderApp = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

describe('App routes', () => {
  it('renders the home page at root', () => {
    renderApp('/');
    expect(screen.getByText('MERN Boilerplate')).toBeInTheDocument();
  });

  it('renders the not found page for unknown routes', () => {
    renderApp('/missing');
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});
