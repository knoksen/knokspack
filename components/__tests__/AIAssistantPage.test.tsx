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

    // Select Image content type using the radio button
    const imageRadio = screen.getByRole('radio', { name: /image/i });
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
    // Create a mock stream that simulates the AI response
    const mockContent = 'AI generated text here';
    
    // Setup the mock to return content chunk by chunk
    (generateContentStream as jest.Mock).mockImplementation(() => ({
      [Symbol.asyncIterator]: async function* () {
        yield { text: mockContent };
      }
    }));

    // Mock clipboard API
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, {
      clipboard: mockClipboard
    });

    renderWithContext(<AIAssistantPage />);

    // Generate some content first
    const promptInput = screen.getByRole('textbox', { name: /what do you want to create/i });
    await userEvent.type(promptInput, 'test prompt');
    const generateButton = screen.getByRole('button', { name: /generate content/i });
    fireEvent.click(generateButton);

    // Wait for content to be generated and copy button to appear
    const copyButton = await screen.findByRole('button', { name: /copy/i });
    
    // Click copy button
    await userEvent.click(copyButton);

    // Verify copy functionality
    expect(await screen.findByText(/copied!/i)).toBeInTheDocument();
    expect(mockClipboard.writeText).toHaveBeenCalledWith('AI generated text here');
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

  it('requires authentication for generation', async () => {
    const mockOpenAuthModal = jest.fn();
    const unauthenticatedContext = {
      user: null,
      isAuthenticated: false,
      openAuthModal: mockOpenAuthModal
    };

    render(
      <UserContext.Provider value={unauthenticatedContext}>
        <AIAssistantPage />
      </UserContext.Provider>
    );

    // Type in the prompt
    const promptInput = screen.getByRole('textbox', { name: /what do you want to create/i });
    await userEvent.type(promptInput, 'test prompt');

    // Try to generate content
    const generateButton = screen.getByRole('button', { name: /generate content/i });
    fireEvent.click(generateButton);

    expect(mockOpenAuthModal).toHaveBeenCalledWith('login');
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it('handles subscription limitations', () => {
    const limitedContext = {
      user: { subscriptionPlan: 'Free' },
      isAuthenticated: true,
      openAuthModal: jest.fn()
    };

    render(
      <UserContext.Provider value={limitedContext}>
        <AIAssistantPage />
      </UserContext.Provider>
    );

    // Try to use a premium feature
    const premiumFeatures = screen.getAllByRole('radio', { name: /(press release|job description|image|plugin readme|wp readme)/i });

    // Verify all premium features are disabled
    premiumFeatures.forEach(button => {
      expect(button).toBeDisabled();
      const label = button.closest('label');
      expect(label).toHaveClass('cursor-not-allowed');
      expect(label).toHaveClass('text-gray-400');
    });
  });
});

<?php
// The plugin should be installed in wp-content/plugins/knokspack/
// Main file: wp-site-suite.php
// Verify plugin is showing up in WordPress admin
