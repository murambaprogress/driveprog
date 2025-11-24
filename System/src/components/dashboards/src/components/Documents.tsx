import React, { useEffect, useState } from 'react';
import { FileText, Upload, Eye, Download, User, Bell, Settings, LogOut } from 'lucide-react';
import { saveUploadedDocument, loadUploadedDocuments, deleteUploadedDocument } from '../../../../utils/formPersistence';

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  useEffect(() => {
    try { const d = loadUploadedDocuments(); setDocs(d || []); } catch { setDocs([]); }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const doc = { id: `D${Date.now()}`, name: file.name, size: file.size, uploaded: new Date().toISOString(), status: 'pending', url: dataUrl, type: file.type };
      try { saveUploadedDocument(doc); setDocs(loadUploadedDocuments()); } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb/1024).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top account header (matches screenshot) */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-extrabold">DriveCash</div>
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <span>Texas Licensed</span>
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-150 active:scale-90 focus:ring-2 focus:ring-blue-300 focus:outline-none"><Bell className="w-5 h-5" /></button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium text-sm">Sarah Johnson</div>
              <div className="text-xs text-gray-500">User</div>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"><User className="w-5 h-5" /></div>
            <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-150 active:scale-90 focus:ring-2 focus:ring-blue-300 focus:outline-none"><Settings className="w-5 h-5" /></button>
            <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-150 active:scale-90 focus:ring-2 focus:ring-red-300 focus:outline-none"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="p-8 bg-gray-50 min-h-[calc(100vh-72px)]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-drivecash-primary mb-2 mt-2">Documents</h1>
          <p className="text-lg text-gray-500 mb-6">Manage your loan documents and upload new files</p>

          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Your Documents</h3>
              <label className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer transition-transform duration-150 hover:bg-blue-700 active:scale-95 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
                <input type="file" onChange={handleUpload} className="hidden" />
              </label>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs.length === 0 && (
                  <div className="text-gray-500">No documents uploaded yet.</div>
                )}
                {docs.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-50 rounded-md"><FileText className="w-6 h-6 text-red-600" /></div>
                          <div>
                            <div className="font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">{doc.type === 'application/pdf' ? 'PDF' : doc.type || 'File'} • {formatSize(doc.size)}</div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${doc.status === 'verified' || doc.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{doc.status}</span>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">Uploaded: {new Date(doc.uploaded).toLocaleDateString()}</div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <button onClick={() => setPreviewDoc(doc)} className="flex-1 border border-gray-200 rounded-md px-4 py-2 text-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150 active:scale-95 focus:ring-2 focus:ring-blue-300 focus:outline-none inline-flex items-center justify-center gap-2"><Eye className="w-4 h-4" /> View</button>
                      <a href={doc.url || '#'} download={doc.name} className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-transparent hover:bg-blue-100 transition-colors duration-150 active:scale-95 focus:ring-2 focus:ring-blue-300 focus:outline-none"><Download className="w-4 h-4" /> Download</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview modal */}
      {previewDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Preview — {previewDoc.name}</h4>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-600 hover:text-gray-900 transition-colors duration-150 active:scale-95 focus:ring-2 focus:ring-blue-300 focus:outline-none">Close</button>
            </div>
            <div className="prose">
              {previewDoc.type?.startsWith('image/') ? (
                <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full h-auto rounded" />
              ) : previewDoc.type === 'application/pdf' ? (
                <object data={previewDoc.url} type="application/pdf" width="100%" height="600">PDF preview not available.</object>
              ) : (
                <div className="text-sm text-gray-700">No inline preview available for this file type. Use download to view.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h4 className="text-lg font-semibold mb-4">Delete document?</h4>
            <p className="text-sm text-gray-600 mb-6">This will remove the document from your uploads. This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-150 active:scale-95 focus:ring-2 focus:ring-gray-300 focus:outline-none">Cancel</button>
              <button onClick={() => {
                if (deleting) {
                  deleteUploadedDocument(deleting);
                  setDocs(loadUploadedDocuments());
                }
                setDeleting(null);
              }} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-150 active:scale-95 focus:ring-2 focus:ring-red-300 focus:outline-none">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
