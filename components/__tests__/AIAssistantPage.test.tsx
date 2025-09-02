import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAssistantPage from '../AIAssistant/AIAssistantPage';
import { UserContext } from '../../contexts/UserContext';
import { generateContentStream, generateImage } from '../../services/geminiService';

// Mock the geminiService
jest.mock('../../services/geminiService', () => ({
  generateContentStream: jest.fn(),
  generateImage: jest.fn(),
}));

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  NavLink: jest.fn(({ children }) => <a>{children}</a>),
}));

describe('AIAssistantPage', () => {
  const mockUser = {
    subscriptionPlan: 'Pro',
  };

  const mockUserContext = {
    user: mockUser,
    isAuthenticated: true,
    openAuthModal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <UserContext.Provider value={mockUserContext}>
        {ui}
      </UserContext.Provider>
    );
  };

  it('renders the component correctly', () => {
    renderWithContext(<AIAssistantPage />);
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByLabelText(/what do you want to create/i)).toBeInTheDocument();
    expect(screen.getByText(/generated output/i)).toBeInTheDocument();
  });

  it('handles content generation', async () => {
    const mockStream = {
      text: 'Generated content'
    };
    (generateContentStream as jest.Mock).mockResolvedValue(mockStream);

    renderWithContext(<AIAssistantPage />);

    // Type in the prompt
    const promptInput = screen.getByLabelText(/what do you want to create/i);
    await userEvent.type(promptInput, 'test prompt');

    // Click generate button
    const generateButton = screen.getByText(/generate content/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateContentStream).toHaveBeenCalledWith(
        'test prompt',
        'Blog Post',
        'Professional',
        false
      );
    });
  });

  it('handles image generation', async () => {
    const mockImageUrl = 'data:image/jpeg;base64,mockImage';
    (generateImage as jest.Mock).mockResolvedValue(mockImageUrl);

    renderWithContext(<AIAssistantPage />);

    // Select Image content type
    const imageRadio = screen.getByLabelText(/image/i);
    fireEvent.click(imageRadio);

    // Type in the prompt
    const promptInput = screen.getByLabelText(/describe the image/i);
    await userEvent.type(promptInput, 'test image');

    // Click generate button
    const generateButton = screen.getByText(/generate image/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateImage).toHaveBeenCalledWith('test image');
      expect(screen.getByAltText('AI generated image')).toHaveAttribute('src', mockImageUrl);
    });
  });

  it('handles copy functionality', async () => {
    const mockStream = {
      text: 'Content to copy'
    };
    (generateContentStream as jest.Mock).mockResolvedValue(mockStream);

    // Mock clipboard API
    const mockClipboard = {
      writeText: jest.fn()
    };
    Object.assign(navigator, {
      clipboard: mockClipboard
    });

    renderWithContext(<AIAssistantPage />);

    // Generate some content first
    const promptInput = screen.getByLabelText(/what do you want to create/i);
    await userEvent.type(promptInput, 'test prompt');
    fireEvent.click(screen.getByText(/generate content/i));

    await waitFor(() => {
      expect(screen.getByText('Content to copy')).toBeInTheDocument();
    });

    // Click copy button
    const copyButton = screen.getByText(/copy/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Content to copy');
    });
  });

  it('handles error states', async () => {
    (generateContentStream as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithContext(<AIAssistantPage />);

    // Try to generate content
    const promptInput = screen.getByLabelText(/what do you want to create/i);
    await userEvent.type(promptInput, 'test prompt');
    fireEvent.click(screen.getByText(/generate content/i));

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it('requires authentication for generation', () => {
    const unauthenticatedContext = {
      ...mockUserContext,
      isAuthenticated: false,
    };

    render(
      <UserContext.Provider value={unauthenticatedContext}>
        <AIAssistantPage />
      </UserContext.Provider>
    );

    // Try to generate content
    fireEvent.click(screen.getByText(/generate content/i));

    expect(unauthenticatedContext.openAuthModal).toHaveBeenCalledWith('login');
  });

  it('handles subscription limitations', () => {
    const limitedContext = {
      ...mockUserContext,
      user: { subscriptionPlan: 'Free' },
    };

    render(
      <UserContext.Provider value={limitedContext}>
        <AIAssistantPage />
      </UserContext.Provider>
    );

    // Try to use a premium feature
    const imageRadio = screen.getByLabelText(/image/i);
    fireEvent.click(imageRadio);

    expect(screen.getByText(/requires an upgrade/i)).toBeInTheDocument();
  });
});
