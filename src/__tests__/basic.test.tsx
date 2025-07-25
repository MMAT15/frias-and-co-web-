import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  it('renders hero', () => {
    render(<Home />);
    expect(screen.getByText('Nueva temporada')).toBeInTheDocument();
  });
});
