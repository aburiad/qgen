import { supabase } from './supabaseClient';

type PaperRecord = {
  id: string;
  user_id: string;
  title: string;
  setup: any;
  questions: any[];
  page_settings: any;
  created_at: string;
  updated_at: string;
};

const mapPaper = (p: PaperRecord) => ({
  id: p.id,
  title: p.title || 'Untitled',
  setup:
    p.setup || {
      subject: '',
      class: '',
      examType: '',
      date: '',
      schoolName: '',
      instructions: '',
    },
  questions: Array.isArray(p.questions) ? p.questions : [],
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  pageSettings: p.page_settings ?? null,
  createdBy: (p as any).created_by_email ?? undefined,
  userId: p.user_id,
});

export const fetchAllPapers = async () => {
  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('[Supabase] fetchAllPapers error:', error);
    return [];
  }

  return (data as PaperRecord[]).map(mapPaper);
};

export const fetchPaperById = async (id: string) => {
  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('[Supabase] fetchPaperById error:', error);
    return null;
  }

  return mapPaper(data as PaperRecord);
};

export const savePaperToWordPress = async (
  title: string,
  data: any,
  pageSettings: any
) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return { success: false, error: 'Not authenticated', id: null };
  }

  // Build payload and try insert. If DB doesn't have created_by_email column,
  // retry without it (helps when migrations not applied yet).
  const payload: any = {
    user_id: auth.user.id,
    created_by_email: auth.user.email ?? null,
    title,
    setup: data?.setup ?? null,
    questions: data?.questions ?? [],
    page_settings: pageSettings ?? null,
  };

  let inserted: any = null;
  let insertError: any = null;

  const tryInsert = async (p: any) => {
    return await supabase.from('papers').insert(p).select('*').single();
  };

  try {
    const res = await tryInsert(payload);
    inserted = res.data;
    insertError = res.error;
  } catch (err) {
    insertError = err;
  }

  // If insert failed due to missing column, retry without created_by_email
  if (insertError && (insertError.code === 'PGRST204' || String(insertError.message || '').includes("created_by_email"))) {
    try {
      const { data: retried, error: retryErr } = await tryInsert({
        user_id: auth.user.id,
        title,
        setup: data?.setup ?? null,
        questions: data?.questions ?? [],
        page_settings: pageSettings ?? null,
      });
      inserted = retried;
      insertError = retryErr;
    } catch (err) {
      insertError = err;
    }
  }

  if (insertError || !inserted) {
    console.error('[Supabase] savePaper error:', insertError);
    return {
      success: false,
      error: insertError?.message || String(insertError) || 'Insert failed',
      id: null,
    };
  }

  const mapped = mapPaper(inserted as PaperRecord);

  // Non-blocking: persist normalized questions and a version snapshot
  (async () => {
    try {
      await saveQuestionsForPaper(mapped.id, (data as any)?.questions ?? []);
    } catch (e) {
      console.warn('[Supabase] saveQuestionsForPaper (create) failed:', e);
    }
    try {
      await savePaperVersion(mapped.id, 'create');
    } catch (e) {
      console.warn('[Supabase] savePaperVersion (create) failed:', e);
    }
  })();

  return {
    success: true,
    id: mapped.id,
    ...mapped,
  };
};



/**
 * Persist questions into normalized `questions` table for a paper.
 * This deletes existing questions for the paper and bulk-inserts the provided array.
 */
export const saveQuestionsForPaper = async (paperId: string, questions: any[]) => {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { success: false, error: 'Not authenticated' };

    // Delete existing questions for the paper
    const { error: delError } = await supabase.from('questions').delete().eq('paper_id', paperId);
    if (delError) {
      console.error('[Supabase] delete questions error:', delError);
      // continue — we'll still try to insert new ones
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return { success: true, inserted: 0 };
    }

    const records = questions.map((q: any, idx: number) => ({
      paper_id: paperId,
      user_id: auth.user.id,
      parent_question_id: (q as any).parentQuestionId ?? null,
      number: q.number ?? idx + 1,
      type: q.type ?? null,
      title: (q as any).title ?? null,
      blocks: q.blocks ?? [],
      marks: q.marks ?? null,
      optional: q.optional ?? false,
    }));

    const { data: inserted, error: insertError } = await supabase.from('questions').insert(records).select('*');
    if (insertError) {
      console.error('[Supabase] insert questions error:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, inserted: Array.isArray(inserted) ? inserted.length : 0 };
  } catch (error) {
    console.error('[Supabase] saveQuestionsForPaper error:', error);
    return { success: false, error: (error as any).message || String(error) };
  }
};

/**
 * Save a snapshot of the paper into `paper_versions` for auditing/history.
 */
export const savePaperVersion = async (paperId: string, changeType: string) => {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { success: false, error: 'Not authenticated' };

    const { data: paperRow, error: fetchError } = await supabase.from('papers').select('*').eq('id', paperId).single();
    if (fetchError || !paperRow) {
      console.error('[Supabase] savePaperVersion fetch error:', fetchError);
      return { success: false, error: fetchError?.message || 'Paper not found' };
    }

    const { data: inserted, error: insertError } = await supabase.from('paper_versions').insert({
      paper_id: paperId,
      user_id: auth.user.id,
      change_type: changeType,
      data: paperRow,
    }).select('*').single();

    if (insertError) {
      console.error('[Supabase] savePaperVersion insert error:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, id: inserted.id };
  } catch (error) {
    console.error('[Supabase] savePaperVersion error:', error);
    return { success: false, error: (error as any).message || String(error) };
  }
};

export const updatePaperInWordPress = async (
  id: string,
  title: string,
  data: any,
  pageSettings: any
) => {
  const { data: updated, error } = await supabase
    .from('papers')
    .update({
      title,
      setup: data?.setup ?? null,
      questions: data?.questions ?? [],
      page_settings: pageSettings ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !updated) {
    console.error('[Supabase] updatePaper error:', error);
    return { success: false };
  }

  const mapped = mapPaper(updated as PaperRecord);

  // Try to persist normalized questions and a version snapshot (non-blocking)
  (async () => {
    try {
      await saveQuestionsForPaper(mapped.id, data?.questions ?? []);
    } catch (e) {
      console.warn('[Supabase] saveQuestionsForPaper (update) failed:', e);
    }
    try {
      await savePaperVersion(mapped.id, 'update');
    } catch (e) {
      console.warn('[Supabase] savePaperVersion (update) failed:', e);
    }
  })();

  return {
    success: true,
    ...mapped,
  };
};

export const deletePaperFromWordPress = async (id: string) => {
  const { error } = await supabase.from('papers').delete().eq('id', id);

  if (error) {
    console.error('[Supabase] deletePaper error:', error);
    return { success: false };
  }

  return { success: true };
};

export const duplicatePaperInWordPress = async (id: string) => {
  const original = await fetchPaperById(id);
  if (!original) return { success: false };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: inserted, error } = await supabase
    .from('papers')
    .insert({
      user_id: auth.user.id,
      created_by_email: auth.user.email ?? null,
      title: `${original.title} (Copy)`,
      setup: original.setup,
      questions: original.questions,
      page_settings: (original as any).pageSettings ?? null,
    })
    .select('*')
    .single();

  if (error || !inserted) {
    console.error('[Supabase] duplicatePaper error:', error);
    return { success: false };
  }

  const mapped = mapPaper(inserted as PaperRecord);

  // Non-blocking: persist normalized questions and a version snapshot for duplicated paper
  (async () => {
    try {
      await saveQuestionsForPaper(mapped.id, original.questions ?? []);
    } catch (e) {
      console.warn('[Supabase] saveQuestionsForPaper (duplicate) failed:', e);
    }
    try {
      await savePaperVersion(mapped.id, 'duplicate');
    } catch (e) {
      console.warn('[Supabase] savePaperVersion (duplicate) failed:', e);
    }
  })();

  return {
    success: true,
    id: mapped.id,
    ...mapped,
  };
};

