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
    
    // Setup mock model
    mockModel = {
      generateContent: jest.fn(),
      generateContentStream: jest.fn()
    };
    
    // Mock the getGenerativeModel method
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => mockModel
    }));
  });

  describe('generateImage', () => {
    it('should generate an image successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'data:image/jpeg;base64,mockImageData'
        }
      };
      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await generateImage('test prompt');
      
      expect(result).toBe('data:image/jpeg;base64,mockImageData');
      expect(mockModel.generateContent).toHaveBeenCalledWith('test prompt');
    });

    it('should handle blocked content error', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('blocked content'));

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
      const result = await generateContentStream(
        'test blog',
        'Blog Post',
        'Professional',
        false
      );

      expect(result).toBe(mockStream);
      expect(mockModel.generateContentStream).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('test blog')])
      );
    });

    it('should handle plugin guideline Q&A', async () => {
      const result = await generateContentStream(
        'test question',
        'Plugin Guideline Q&A',
        'Professional',
        false
      );

      expect(result).toBe(mockStream);
      expect(mockModel.generateContentStream).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('expert assistant')])
      );
    });

    it('should handle wireframe generation', async () => {
      const result = await generateContentStream(
        'create a navbar',
        'Wireframe',
        'Professional',
        false
      );

      expect(result).toBe(mockStream);
      expect(mockModel.generateContentStream).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('expert frontend developer')])
      );
    });

    it('should include Google search tool when enabled', async () => {
      await generateContentStream(
        'test blog',
        'Blog Post',
        'Professional',
        true
      );

      expect(GoogleGenerativeAI).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          generationConfig: expect.objectContaining({
            temperature: 0.7
          })
        })
      );
    });

    it('should handle errors', async () => {
      mockModel.generateContentStream.mockRejectedValue(new Error('API error'));

      await expect(generateContentStream(
        'test',
        'Blog Post',
        'Professional',
        false
      )).rejects.toThrow('Failed to generate content');
    });
  });
});
