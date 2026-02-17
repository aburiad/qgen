import { QuestionPaper } from '../types';
import * as wpApi from './wpApiService';

const STORAGE_KEY = 'bd-board-question-papers';

/** Papers list: show only current user's papers when logged in */
const filterPapersByCurrentUser = (papers: QuestionPaper[]): QuestionPaper[] => {
  const userEmail =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('userEmail')
      : null;
  if (!userEmail) return papers;
  return papers.filter((p) => p.createdBy === userEmail);
};

/**
 * Debug helper - log storage operations
 */
const debugLog = (message: string, data?: any) => {
  console.log(`[Storage Debug] ${message}`, data || '');
};

/**
 * Properly decode Unicode escaped strings
 * Handles cases where text is stored as escaped sequences like \u09AC or u09AC (corrupted)
 */
const decodeUnicodeString = (str: any): string => {
  if (typeof str !== 'string') return str;
  
  try {
    // First handle corrupted format without backslash: u09AC
    let decoded = str.replace(/u([0-9a-fA-F]{4})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch (e) {
        console.warn(`[Storage] Failed to decode: ${match}`, e);
        return match;
      }
    });
    
    // Then handle proper format with backslash: \u09AC
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch (e) {
        console.warn(`[Storage] Failed to decode: ${match}`, e);
        return match;
      }
    });
    
    return decoded;
  } catch (e) {
    console.warn('[Storage] Error decoding unicode string:', e);
    return str;
  }
};

/**
 * Recursively decode all string values in an object
 */
const decodeObjectStrings = (obj: any): any => {
  if (typeof obj === 'string') {
    return decodeUnicodeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => decodeObjectStrings(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const decoded: any = {};
    for (const key in obj) {
      decoded[key] = decodeObjectStrings(obj[key]);
    }
    return decoded;
  }
  return obj;
};

/**
 * Ensure paper has all required fields with safe defaults
 */
const ensurePaperStructure = (paper: any): QuestionPaper => {
  if (!paper || typeof paper !== 'object') {
    throw new Error('Invalid paper object');
  }
  
  // Extract only the numeric part of class if it contains extra text
  let classValue = paper.setup?.class || '';
  if (classValue && typeof classValue === 'string') {
    // Remove any non-numeric characters, keep only the first number
    const match = classValue.match(/\d+/);
    if (match) {
      classValue = match[0];
    }
  }
  
  return {
    id: paper.id || '',
    title: paper.title || 'Untitled',
    setup: {
      subject: paper.setup?.subject || '',
      class: classValue,
      examType: paper.setup?.examType || 'class-test',
      timeMinutes: paper.setup?.timeMinutes || 60,
      totalMarks: paper.setup?.totalMarks || 100,
      layout: paper.setup?.layout || '1',
      date: paper.setup?.date || new Date().toISOString().split('T')[0],
      schoolName: paper.setup?.schoolName || '',
      instructions: paper.setup?.instructions || '',
      duration: paper.setup?.duration || '',
      schoolLogo: paper.setup?.schoolLogo || '',
    },
    questions: Array.isArray(paper.questions) ? paper.questions : [],
    createdAt: paper.createdAt || new Date().toISOString(),
    updatedAt: paper.updatedAt || new Date().toISOString(),
    createdBy: paper.createdBy,
  };
};

/**
 * Save paper to Supabase (primary storage)
 * localStorage is used only as temporary cache
 */
export const savePapers = async (papers: QuestionPaper[]) => {
  try {
    // Save each paper to Supabase
    for (const paper of papers) {
      if (paper.id) {
        await wpApi.updatePaperInWordPress(
          paper.id,
          paper.setup?.schoolName || 'Untitled Paper',
          paper,
          {}
        );
      } else {
        const result = await wpApi.savePaperToWordPress(
          paper.setup?.schoolName || 'Untitled Paper',
          paper,
          {}
        );
        if (result.success && result.id) {
          paper.id = result.id.toString();
        }
      }
    }
    
    // Keep localStorage as cache only (not primary storage)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch (error) {
    console.error('Error saving papers to WordPress:', error);
    throw error;
  }
};

/**
 * Load papers from Supabase (primary source)
 * Caches in localStorage for performance
 */
export const loadPapers = async (): Promise<QuestionPaper[]> => {
  try {
    debugLog('Loading papers from Supabase');
    
    // Check if localStorage has corrupted data with escaped unicode
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (cachedData && cachedData.includes('u09a')) {
      debugLog('Corrupted data detected in localStorage, attempting to decode');
      try {
        let cached = JSON.parse(cachedData);
        cached = decodeObjectStrings(cached);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
        debugLog('Fixed corrupted data in localStorage');
      } catch (e) {
        console.warn('[Storage] Failed to fix corrupted data, clearing cache:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    
    // Load from Supabase (primary source of truth)
    let papers = await wpApi.fetchAllPapers();
    
    // Decode any Unicode escape sequences in the papers
    papers = decodeObjectStrings(papers);
    
    // Ensure papers is always an array
    const papersArray = Array.isArray(papers) ? papers : [];
    debugLog('Loaded from API:', papersArray.length, 'papers');
    
    // Validate and fix structure of all papers
    const validPapers = papersArray.map(p => {
      try {
        return ensurePaperStructure(p);
      } catch (e) {
        console.warn('Invalid paper structure, skipping:', p);
        return null;
      }
    }).filter((p): p is QuestionPaper => p !== null);
    
    // Cache in localStorage for offline/performance
    if (validPapers && validPapers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validPapers));
      debugLog('Cached', validPapers.length, 'papers in localStorage');
    } else {
      // If no papers in WordPress, check localStorage cache
      debugLog('No papers from API, checking localStorage cache');
      const cachedData = localStorage.getItem(STORAGE_KEY);
      if (cachedData) {
        try {
          let cached = JSON.parse(cachedData);
          // Decode any Unicode escape sequences
          cached = decodeObjectStrings(cached);
          const cachedArray = Array.isArray(cached) ? cached : [];
          
          // Validate cached papers structure
          const validCached = cachedArray.map(p => {
            try {
              return ensurePaperStructure(p);
            } catch (e) {
              console.warn('Invalid cached paper structure:', p);
              return null;
            }
          }).filter((p): p is QuestionPaper => p !== null);
          
          debugLog('Using cached papers:', validCached.length, 'papers');
          return filterPapersByCurrentUser(validCached);
        } catch (parseError) {
          console.error('Error parsing cached data:', parseError);
          return [];
        }
      }
      return [];
    }
    
    // Debug: Log table blocks when loading
    if (Array.isArray(validPapers)) {
      validPapers.forEach((paper: QuestionPaper, pidx: number) => {
        if (paper && paper.questions && Array.isArray(paper.questions)) {
          paper.questions.forEach((q, qidx) => {
            if (q && q.blocks && Array.isArray(q.blocks)) {
              q.blocks.forEach((b, bidx) => {
                if (b && b.type === 'table') {
                  console.log(`📥 Loaded Table from Paper${pidx + 1} Q${qidx + 1} Block${bidx + 1}:`, {
                    rows: b.content.rows,
                    cols: b.content.cols,
                    headers: b.content.headers,
                    data: b.content.data
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return filterPapersByCurrentUser(validPapers);
  } catch (error) {
    console.error('Error loading papers from Supabase:', error);
    // Fallback to localStorage cache if API fails
    try {
      const cachedData = localStorage.getItem(STORAGE_KEY);
      if (cachedData) {
        let cached = JSON.parse(cachedData);
        // Decode any Unicode escape sequences
        cached = decodeObjectStrings(cached);
        const cachedArray = Array.isArray(cached) ? cached : [];
        
        // Validate cached papers structure
        const validCached = cachedArray.map(p => {
          try {
            return ensurePaperStructure(p);
          } catch (e) {
            return null;
          }
        }).filter((p): p is QuestionPaper => p !== null);
        
        debugLog('Using localStorage fallback, papers:', validCached.length);
        return filterPapersByCurrentUser(validCached);
      }
      return [];
    } catch (cacheError) {
      console.error('Error loading from cache:', cacheError);
      return [];
    }
  }
};

/**
 * Save a single paper to Supabase. Returns the saved paper (id may change for new papers).
 */
export const savePaper = async (paper: QuestionPaper): Promise<QuestionPaper> => {
  try {
    const userEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('userEmail') : null;
    const savedPaperInput: QuestionPaper = {
      ...paper,
      createdBy: userEmail || paper.createdBy,
    };
    // Debug: Log table blocks before saving
    savedPaperInput.questions.forEach((q, idx) => {
      q.blocks.forEach((b, bidx) => {
        if (b.type === 'table') {
          console.log(`📊 Saving Table in Q${idx + 1} Block${bidx + 1}:`, {
            rows: b.content.rows,
            cols: b.content.cols,
            headers: b.content.headers,
            data: b.content.data
          });
        }
      });
    });

    let savedPaper = savedPaperInput;
    
    // Valid Supabase IDs are UUID; temp IDs (like temp-123...) should be treated as NEW
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      savedPaperInput.id || ''
    );

    if (savedPaperInput.id && isUuid) {
      // Existing row in Supabase – update
      debugLog('Updating existing paper in Supabase:', savedPaperInput.id);
      const updateResult = await wpApi.updatePaperInWordPress(
        savedPaperInput.id,
        savedPaperInput.setup?.schoolName || 'Untitled Paper',
        savedPaperInput,
        {}
      );
      
      if (!updateResult.success) {
        debugLog('Update failed, error:', (updateResult as any).error);
        console.warn(
          `Failed to update paper in Supabase: ${(updateResult as any).error}`
        );
        // Keep savedPaper as is (with existing UUID)
      } else {
        // Update successful - use updated data if available
        if ((updateResult as any).id) {
          savedPaper = { ...savedPaperInput, id: (updateResult as any).id };
        }
      }
    } else {
      // New paper (or temp id) – insert into Supabase first
      debugLog(
        'Saving new paper to Supabase:',
        savedPaperInput.setup?.schoolName
      );
      const result = await wpApi.savePaperToWordPress(
        savedPaperInput.setup?.schoolName || 'Untitled Paper',
        savedPaperInput,
        {}
      );
      
      debugLog('Save result:', result);
      
      if (result.success && result.id) {
        savedPaper = { ...savedPaperInput, id: result.id.toString() };
        debugLog('Paper saved successfully with ID:', result.id);
      } else {
        const errorMsg = (result as any).error || 'Unknown error';
        console.error(`Failed to save paper to Supabase: ${errorMsg}`);
        throw new Error(`Failed to save paper: ${errorMsg}`);
      }
    }
    
    // Cache in localStorage (not primary)
    const papers = await loadPapers();
    const index = papers.findIndex(p => p.id === savedPaper.id);
    if (index >= 0) {
      papers[index] = savedPaper;
    } else {
      papers.push(savedPaper);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    return savedPaper;
  } catch (error) {
    console.error('Error saving paper:', error);
    throw error;
  }
};

/**
 * Delete a paper from Supabase
 */
export const deletePaper = async (id: string) => {
  try {
    await wpApi.deletePaperFromWordPress(id);
    
    // Update localStorage cache
    const papers = await loadPapers();
    const filtered = papers.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting paper:', error);
    throw error;
  }
};

/**
 * Duplicate a paper in Supabase
 */
export const duplicatePaper = async (id: string): Promise<QuestionPaper | null> => {
  try {
    const papers = await loadPapers();
    
    // Ensure papers is an array
    if (!Array.isArray(papers)) {
      console.error('[Duplicate Paper] Papers is not an array:', typeof papers, papers);
      return null;
    }
    
    const paper = papers.find(p => p && p.id === id);
    
    if (!paper) return null;
    
    const result = await wpApi.duplicatePaperInWordPress(id);
    if (result.success && result.id) {
      const userEmail =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('userEmail')
          : null;
      const newPaper: QuestionPaper = {
        ...paper,
        id: result.id.toString(),
        setup: {
          ...paper.setup,
          schoolName: paper.setup.schoolName
            ? `${paper.setup.schoolName} (Copy)`
            : undefined,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userEmail || paper.createdBy,
      };
      
      // Cache in localStorage
      papers.push(newPaper);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
      
      return newPaper;
    }
    
    return null;
  } catch (error) {
    console.error('Error duplicating paper:', error);
    throw error;
  }
};

/**
 * Generate unique ID for new papers (temporary)
 */
export const generateId = () => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all papers from WordPress
 */
export const getAllPapers = async (): Promise<QuestionPaper[]> => {
  return loadPapers();
};

/**
 * Clear all papers from WordPress and localStorage
 */
export const clearAllPapers = async () => {
  try {
    // Get all papers first
    const papers = await loadPapers();
    
    // Delete each from WordPress
    for (const paper of papers) {
      if (paper.id && /^\d+$/.test(paper.id)) {
        try {
          await wpApi.deletePaperFromWordPress(paper.id);
        } catch (err) {
          console.error('Error deleting paper:', err);
        }
      }
    }
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all papers:', error);
    throw error;
  }
};