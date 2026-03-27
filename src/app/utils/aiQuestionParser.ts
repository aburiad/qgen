/**
 * AI Question Parser Service
 * Uses Gemini AI Vision OR Tesseract.js for OCR
 */

import Tesseract from 'tesseract.js';
import type { Question, QuestionType, SubQuestion } from '../types';
import { generateId } from './storage';

// Gemini API (Google AI) - from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Field definitions for different question types
 */
export const QUESTION_FIELDS = {
  mcq: ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'],
  creative: ['uddipok', 'ka', 'kha', 'ga', 'gha'],
  'short-question': ['question', 'answer_hint'],
  'fill-in-blanks': ['question', 'correct_answer'],
  'true-false': ['question', 'correct_answer'],
  matching: ['left_column', 'right_column'],
  explain: ['question', 'answer_guideline'],
  'problem-solving': ['question', 'solution_steps'],
  conversion: ['question', 'answer'],
  pattern: ['question', 'answer'],
  diagram: ['question', 'diagram_description'],
  construction: ['question', 'construction_steps'],
  'table-based': ['question', 'table_data'],
  'graph-based': ['question', 'graph_analysis'],
  proof: ['question', 'proof_steps'],
} as const;

export type QuestionFieldType = keyof typeof QUESTION_FIELDS;

/**
 * Convert image file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Build the prompt for AI based on question type and fields
 */
function buildPrompt(questionType: string, fields: readonly string[]): string {
  const fieldList = fields.join(', ');
   
  return `You are an expert at reading and parsing exam questions from images.

TASK: Analyze the image and extract the question content. Map the extracted text into the provided fields.

QUESTION TYPE: ${questionType}

FIELDS TO FILL: ${fieldList}

IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, no explanation, no extra text
2. Keys must EXACTLY match the field names provided
3. If content is missing for a field → return empty string ""
4. Preserve Bengali and English text as-is (do NOT translate)
5. For math equations, convert to LaTeX format
   Example: x² + y² = r² → $x^2 + y^2 = r^2$
6. Ignore page numbers, headers, footers, and unrelated text
7. Focus only on the main question content in the image

SPECIFIC FIELD MAPPING:
- For MCQ: question=main question, option_a/b/c/d=choices, correct_answer=letter (a/b/c/d)
- For Creative: uddipok=main paragraph/stem, ka/kha/ga/gha=sub-questions
- For Short Question: question=the question, answer_hint=optional hint

OUTPUT FORMAT:
{
  "field1": "extracted text",
  "field2": "extracted text"
}

Now analyze the image and return the JSON:`;
}

/**
 * Parse AI response to extract JSON
 */
function parseGeminiResponse(responseText: string): Record<string, string> {
  // Try to find JSON in the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
   
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  }
   
  // Fallback: try to parse the whole response
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse response:', e);
    return {};
  }
}

/**
 * Parse raw OCR text and map to question fields
 * Simple approach: put all text in main field, let user manually edit
 */
function parseOCRTextToFields(rawText: string, questionType: QuestionFieldType): Record<string, string> {
  const result: Record<string, string> = {};
   
  // Clean up text but preserve newlines for readability
  const cleanedText = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
   
  if (questionType === 'creative') {
    // Put all text in uddipok field for manual editing
    result['uddipok'] = cleanedText;
    // Leave sub-question fields empty for user to fill manually
  } else if (questionType === 'mcq') {
    result['question'] = cleanedText;
  } else {
    result['question'] = cleanedText;
  }
   
  return result;
}

/**
 * Main function to extract question from image using Tesseract.js (FREE)
 */
export async function extractQuestionWithTesseract(
  imageFile: File,
  questionType: QuestionFieldType,
  onProgress?: (progress: number) => void
): Promise<Record<string, string>> {
  try {
    // Convert image to base64 for Tesseract
    const base64Image = await fileToBase64(imageFile);
     
    // Run Tesseract OCR
    const result = await Tesseract.recognize(
      `data:${imageFile.type};base64,${base64Image}`,
      'ben+eng', // Bengali + English
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        }
      }
    );

    const rawText = result.data.text;
    console.log('OCR Raw Text:', rawText);
     
    // Parse the extracted text and map to fields
    return parseOCRTextToFields(rawText, questionType);
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    throw error;
  }
}

/**
 * Extract question using Gemini API (Google AI)
 */
export async function extractQuestionWithGemini(
  imageFile: File,
  questionType: QuestionFieldType
): Promise<Record<string, string>> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const base64Image = await fileToBase64(imageFile);
    const fields = QUESTION_FIELDS[questionType] || QUESTION_FIELDS['short-question'];
    const fieldList = fields.join(', ');

    const prompt = buildPrompt(questionType, fields);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini extracted:', extractedText);

    return parseGeminiResponse(extractedText);
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw error;
  }
}

/**
 * Map extracted fields to a Question object
 * This converts the raw field values into the proper Question structure
 */
export function mapFieldsToQuestion(
  fields: Record<string, string>,
  questionType: QuestionType
): Partial<Question> {
  const question: Partial<Question> = {
    type: questionType,
    blocks: [],
    marks: 1,
    optional: false,
  };

  if (questionType === 'creative') {
    // For creative questions: uddipok + sub-questions (ক, খ, গ, ঘ)
    if (fields.uddipok) {
      question.blocks = [
        { id: generateId(), type: 'text', content: fields.uddipok }
      ];
    }
    
    // Create sub-questions with proper structure
    const subQuestions: SubQuestion[] = [];
    const markers = [
      { key: 'ka', label: 'ক' },
      { key: 'kha', label: 'খ' },
      { key: 'ga', label: 'গ' },
      { key: 'gha', label: 'ঘ' },
    ];
    
    for (const { key, label } of markers) {
      if (fields[key]) {
        subQuestions.push({
          id: generateId(),
          label: label,
          blocks: [{ id: generateId(), type: 'text', content: fields[key] }],
          marks: 1,
        });
      }
    }
    
    if (subQuestions.length > 0) {
      question.subQuestions = subQuestions;
    }
  } else if (questionType === 'mcq') {
    // For MCQ: question + options
    if (fields.question) {
      question.blocks = [
        { id: generateId(), type: 'text', content: fields.question }
      ];
    }
    
    // Options as array
    const options: string[] = [];
    if (fields.option_a) options.push(fields.option_a);
    if (fields.option_b) options.push(fields.option_b);
    if (fields.option_c) options.push(fields.option_c);
    if (fields.option_d) options.push(fields.option_d);
    
    if (options.length > 0) {
      question.options = options;
    }
    
    if (fields.correct_answer) {
      // Convert letter to index
      const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
      question.correctAnswer = answerMap[fields.correct_answer.toLowerCase()] ?? 0;
    }
  } else {
    // For other types: just question text
    if (fields.question) {
      question.blocks = [
        { id: generateId(), type: 'text', content: fields.question }
      ];
    }
  }

  return question;
}

/**
 * Main OCR function: Try Gemini first, then Tesseract fallback
 */
export async function extractQuestionWithAI(
  imageFile: File,
  questionType: QuestionFieldType,
  onProgress?: (progress: number) => void
): Promise<Record<string, string>> {
  // First try Gemini (if API key available)
  if (GEMINI_API_KEY) {
    try {
      return await extractQuestionWithGemini(imageFile, questionType);
    } catch (geminiError) {
      console.error('Gemini failed, trying Tesseract:', geminiError);
    }
  }

  // Fallback to Tesseract (free, always works)
  try {
    return await extractQuestionWithTesseract(imageFile, questionType, onProgress);
  } catch (tesseractError) {
    console.error('Tesseract failed:', tesseractError);
    throw new Error('OCR failed. Please try again or use manual entry.');
  }
}
