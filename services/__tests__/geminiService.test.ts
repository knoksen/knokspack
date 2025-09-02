import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateImage, generateContentStream } from '../geminiService';

// Mock the GoogleGenerativeAI module
jest.mock('@google/generative-ai');

describe('geminiService', () => {
  let mockModel: {
    generateContent: jest.Mock;
    generateContentStream: jest.Mock;
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock model with proper implementation
    mockModel = {
      generateContent: jest.fn(),
      generateContentStream: jest.fn()
    };

    // Setup default mock implementations
    mockModel.generateContent.mockResolvedValue({
      response: {
        text: () => 'mocked content'
      }
    });

    mockModel.generateContentStream.mockResolvedValue({
      stream: () => Promise.resolve({
        text: 'mocked stream content'
      })
    });

    // Mock the getGenerativeModel method with proper configuration handling
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn(() => mockModel)
    }));
  });

  describe('generateImage', () => {
    it('should generate an image successfully', async () => {
      const mockImageData = 'data:image/jpeg;base64,mockImageData';
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => mockImageData
        }
      });

      const result = await generateImage('test prompt');
      
      expect(result).toBe(mockImageData);
      expect(mockModel.generateContent).toHaveBeenCalledWith('test prompt');
    });

    it('should handle blocked content error', async () => {
      const error = new Error('blocked content');
      error.message = 'Content was blocked';
      mockModel.generateContent.mockRejectedValue(error);

      await expect(generateImage('test prompt')).rejects.toThrow(
        'Failed to generate image because the prompt was blocked for safety reasons'
      );
    });

    it('should handle general errors', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('network error'));

      await expect(generateImage('test prompt')).rejects.toThrow(
        'Failed to generate image. Please check your prompt and network connection'
      );
    });
  });

  describe('generateContentStream', () => {
    const mockStream = {
      stream: jest.fn()
    };

    beforeEach(() => {
      mockModel.generateContentStream.mockResolvedValue(mockStream);
    });

    it('should generate content stream for blog post', async () => {
      mockModel.generateContentStream.mockResolvedValue({
        stream: () => ({
          text: 'blog post content'
        })
      });

      const result = await generateContentStream(
        'test blog',
        'Blog Post',
        'Professional',
        false
      );

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
      expect(mockModel.generateContentStream).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('test blog')])
      );
    });

    it('should handle plugin guideline Q&A', async () => {
      mockModel.generateContentStream.mockResolvedValue({
        stream: () => ({
          text: 'Q&A response'
        })
      });

      const result = await generateContentStream(
        'test question',
        'Plugin Guideline Q&A',
        'Professional',
        false
      );

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
      expect(mockModel.generateContentStream).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('expert assistant')])
      );
    });

    it('should handle wireframe generation', async () => {
      mockModel.generateContentStream.mockResolvedValue({
        stream: () => ({
          text: 'wireframe content'
        })
      });

      const result = await generateContentStream(
        'create a navbar',
        'Wireframe',
        'Professional',
        false
      );

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
      expect(mockModel.generateContentStream).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('expert frontend developer')])
      );
    });

    it('should include Google search tool when enabled', async () => {
      mockModel.generateContentStream.mockResolvedValue({
        stream: () => ({
          text: 'search-enabled content'
        })
      });

      const result = await generateContentStream(
        'test blog',
        'Blog Post',
        'Professional',
        true
      );

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
      expect(mockModel.generateContentStream).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('test blog')])
      );
    });

    it('should handle errors', async () => {
      mockModel.generateContentStream.mockRejectedValue(new Error('API error'));

      await expect(generateContentStream(
        'test',
        'Blog Post',
        'Professional',
        false
      )).rejects.toThrow('Failed to generate content. Please check your API key and network connection');
    });
  });
});
