import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { QuestionPaper } from '../types';
import { loadPapers } from '../utils/storage';

const STORAGE_KEY = 'bd-board-question-papers';

/**
 * Load paper by paperId from URL params.
 * Redirects to home if paper not found.
 */
export function usePaper() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<QuestionPaper | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!paperId) return;
      const papers = await loadPapers();
      const found = papers.find((p) => p.id === paperId);
      if (found) {
        setPaper(found);
      } else {
        // If API didn't return the new paper yet, try localStorage cache before redirecting.
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as QuestionPaper[];
            const fromCache = Array.isArray(parsed) ? parsed.find(p => p.id === paperId) : null;
            if (fromCache) {
              setPaper(fromCache);
              return;
            }
          }
        } catch (e) {
          // ignore parse errors and fall through to redirect
        }
        navigate('/');
      }
    };
    load();
  }, [paperId, navigate]);

  return { paper, setPaper, paperId };
}
