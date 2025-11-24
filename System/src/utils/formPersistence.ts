// Utility for saving and loading application form progress and uploaded documents

const FORM_PROGRESS_KEY = 'drivecash_app_form_progress';
const UPLOADED_DOCS_KEY = 'drivecash_uploaded_documents';

type UploadedDoc = { id: string; name: string; uploaded: string; status: string; type?: string };

export function saveFormProgress(formData: Record<string, unknown>) {
  try {
    localStorage.setItem(FORM_PROGRESS_KEY, JSON.stringify(formData));
  } catch {
    // ignore localStorage errors (storage full, privacy mode, etc.)
  }
}

export function loadFormProgress() {
  try {
    const data = localStorage.getItem(FORM_PROGRESS_KEY);
    return data ? JSON.parse(data) : null;
  } catch { 
    // ignore and return null on parse/localStorage errors
    return null; 
  }
}

export function clearFormProgress() {
  try {
    localStorage.removeItem(FORM_PROGRESS_KEY);
  } catch {
    // ignore
  }
}

export function saveUploadedDocument(doc: UploadedDoc) {
  try {
    const docs = loadUploadedDocuments();
    docs.push(doc);
    localStorage.setItem(UPLOADED_DOCS_KEY, JSON.stringify(docs));
  } catch {
    // ignore
  }
}

export function loadUploadedDocuments(): UploadedDoc[] {
  try {
    const data = localStorage.getItem(UPLOADED_DOCS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { 
    // ignore and return empty array on error
    return []; 
  }
}

export function clearUploadedDocuments() {
  try {
    localStorage.removeItem(UPLOADED_DOCS_KEY);
  } catch {
    // ignore
  }
}

export function deleteUploadedDocument(id: string): boolean {
  try {
  const docs = loadUploadedDocuments().filter((d: UploadedDoc) => d.id !== id);
    localStorage.setItem(UPLOADED_DOCS_KEY, JSON.stringify(docs));
    return true;
  } catch { 
    // ignore
    return false; 
  }
}
