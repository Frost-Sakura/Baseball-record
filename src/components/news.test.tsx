import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { News } from './news';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { newsService } from '../services/news';

// Mock newsService
vi.mock('../services/news', () => ({
  newsService: {
    getLocalNews: vi.fn(),
    getLastUpdateTime: vi.fn(),
    refreshNews: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('News Component', () => {
  it('renders the header and title', () => {
    vi.mocked(newsService.getLocalNews).mockResolvedValue([]);
    vi.mocked(newsService.getLastUpdateTime).mockResolvedValue(null);

    renderWithClient(<News />);
    
    expect(screen.getByText('棒球新聞')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders categories', () => {
    renderWithClient(<News />);
    
    expect(screen.getByText('全部新聞')).toBeInTheDocument();
    expect(screen.getByText('MLB')).toBeInTheDocument();
    expect(screen.getByText('CPBL')).toBeInTheDocument();
    expect(screen.getByText('NPB')).toBeInTheDocument();
  });
});
