import React, { useEffect, useState } from "react";
import { jsPDF } from 'jspdf';
import {
  FileText,
  Upload,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileCheck,
  Sparkles,
  ChevronRight,
  Clock,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

const ReportGenerator = ({ onClose, projectId }) => {
  const [files, setFiles] = useState([]);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableDocs, setAvailableDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [checkedDocs, setCheckedDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [showSplitView, setShowSplitView] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoadingDocs(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doc/ProjectDocs/${projectId}`)
      .then(res => res.json())
      .then(data => setAvailableDocs(data.documents || []))
      .catch(() => setAvailableDocs([]))
      .finally(() => setLoadingDocs(false));
  }, [projectId]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError('');
  };

  const handleClose = () => {
    setFiles([]);
    setReport('');
    setLoading(false);
    setError('');
    setShowSplitView(false);
    onClose();
  };

  const closeSplitView = () => {
    setShowSplitView(false);
    setReport('');
  };

  const generateReport = async () => {
    if (files.length === 0 && checkedDocs.length === 0) {
      setError('Please select at least one file or document');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();

    files.forEach(file => formData.append('files', file));

    for (const docId of checkedDocs) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doc/download_direct/${docId}`);
        if (!res.ok) throw new Error('Failed to download document');
        const blob = await res.blob();
        const docInfo = availableDocs.find(d => d.document_id === docId);
        let filename = docInfo?.document_name || `document_${docId}.pdf`;
        if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
        formData.append('files', blob, filename);
      } catch (err) {
        setError(`Failed to fetch document ${docId}`);
        setLoading(false);
        return;
      }
    }

    if (projectId) {
      formData.append('project_id', projectId);
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`;

      const vectorRes = await fetch(`${API_BASE}/generate-vector-store`, {
        method: 'POST',
        body: formData,
      });

      if (!vectorRes.ok) {
        const errorData = await vectorRes.json();
        throw new Error(errorData.detail || 'Vector store creation failed.');
      }

      const reportRes = await fetch(`${API_BASE}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId
        }),
      });

      if (!reportRes.ok) {
        const errorData = await reportRes.json();
        throw new Error(errorData.detail || 'Report generation failed.');
      }

      const reportData = await reportRes.json();
      setReport(reportData.report);
      setShowSplitView(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT STATUS REPORT', 20, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Project ID: ${projectId}`, 20, 35);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 40, 190, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    let cleanedReport = report.replace(/={60,}/g, '').trim();
    cleanedReport = cleanedReport.replace(/\|[^|\n]*\|/g, '');
    cleanedReport = cleanedReport.replace(/\|[-:\s]+\|/g, '');

    const sections = cleanedReport.split(/\n\s*\n/);
    let currentY = 50;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 6;
    const margin = 20;
    const maxWidth = 170;

    sections.forEach((section) => {
      if (!section.trim()) return;
      const lines = section.split('\n');
      lines.forEach((line, index) => {
        if (currentY + lineHeight > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }
        if (!line.trim()) {
          currentY += lineHeight / 2;
          return;
        }
        if (line.match(/^[A-Z\s\d\.\-]+$/) && line.length < 50) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          currentY += 4;
        } else if (line.match(/^\d+\.\s+[A-Z]/) || line.includes('SUMMARY') || line.includes('STATUS')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
        }
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        wrappedLines.forEach((wrappedLine) => {
          if (currentY + lineHeight > pageHeight - 30) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(wrappedLine, margin, currentY);
          currentY += lineHeight;
        });
        currentY += 1;
      });
      currentY += 4;
    });

    doc.save(`project_${projectId}_status_report.pdf`);
  };

  const handleCheckboxChange = (docId) => {
    setCheckedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const getDocumentIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'meeting': return <Users className="h-4 w-4 text-sky-600" />;
      case 'progress': return <TrendingUp className="h-4 w-4 text-sky-700" />;
      case 'planning': return <Target className="h-4 w-4 text-sky-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Professional sky blue backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-sky-100/80 via-sky-50/80 to-white/80 backdrop-blur-lg"
        onClick={!showSplitView ? handleClose : undefined}
      ></div>

      {/* Split view container */}
      <div className={`flex h-full transition-all duration-500 ${showSplitView ? 'gap-1' : 'justify-center items-center'}`}>

        {/* Left Panel - Original Form */}
        <div className={`transition-all duration-500 ${showSplitView
          ? 'w-1/3 h-full overflow-y-auto'
          : 'w-full max-w-4xl mx-auto my-auto'
          }`}>
          <div className={`${showSplitView ? 'h-full p-4' : 'p-4'}`}>
            <div
              className={`relative bg-white rounded-2xl shadow-xl p-6 border border-sky-100 transform transition-all duration-300 ${showSplitView ? 'h-full' : 'p-8'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full p-2 transition-all duration-200"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className={`text-center ${showSplitView ? 'mb-6' : 'mb-8'}`}>
                <div className={`inline-flex items-center justify-center ${showSplitView ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl mb-4 shadow-lg`}>
                  <Sparkles className={`${showSplitView ? 'h-6 w-6' : 'h-8 w-8'} text-white`} />
                </div>
                <h2 className={`${showSplitView ? 'text-xl' : 'text-3xl'} font-bold text-slate-900 mb-2`}>
                  {showSplitView ? 'AI Generator' : 'DoCon AI Report Generator'}
                </h2>
                {!showSplitView && (
                  <p className="text-slate-600 font-medium">Transform your project documents into comprehensive reports</p>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-sky-50 p-1 rounded-xl mb-6 border border-sky-100">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 font-medium ${activeTab === 'upload'
                    ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-sky-25'
                    }`}
                >
                  <Upload className="h-4 w-4" />
                  <span className={showSplitView ? 'text-xs' : 'text-sm'}>Upload Files</span>
                </button>
                <button
                  onClick={() => setActiveTab('existing')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 font-medium ${activeTab === 'existing'
                    ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-sky-25'
                    }`}
                >
                  <FileCheck className="h-4 w-4" />
                  <span className={showSplitView ? 'text-xs' : 'text-sm'}>Documents</span>
                  {availableDocs.length > 0 && (
                    <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full font-semibold">
                      {availableDocs.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className={showSplitView ? 'mb-4' : 'mb-8'}>
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Upload className="h-5 w-5 text-sky-600" />
                      <h3 className={`${showSplitView ? 'text-sm' : 'text-lg'} font-semibold text-slate-800`}>Upload New Files</h3>
                    </div>

                    <label className="block cursor-pointer">
                      <div className={`border-2 border-dashed border-sky-200 rounded-xl ${showSplitView ? 'p-6' : 'p-10'} hover:border-sky-300 hover:bg-sky-25 transition-all duration-200 group bg-gradient-to-br from-sky-25 to-white`}>
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className={`${showSplitView ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg`}>
                            <Upload className={`${showSplitView ? 'h-6 w-6' : 'h-8 w-8'} text-white`} />
                          </div>
                          <h4 className={`${showSplitView ? 'text-sm' : 'text-lg'} font-semibold text-slate-800 mb-2`}>
                            {files.length > 0 ? `${files.length} file(s) selected` : 'Drop files here or browse'}
                          </h4>
                          {!showSplitView && (
                            <p className="text-slate-500 mb-4 font-medium">PDF files only • Maximum 10MB each</p>
                          )}
                          {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center mt-3">
                              {files.map((file, index) => (
                                <div key={index} className="flex items-center space-x-2 bg-sky-100 text-sky-700 px-3 py-2 rounded-lg text-xs font-medium border border-sky-200">
                                  <FileText className="h-3 w-3" />
                                  <span className="truncate max-w-24">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                  </div>
                )}

                {activeTab === 'existing' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileCheck className="h-5 w-5 text-sky-600" />
                      <h3 className={`${showSplitView ? 'text-sm' : 'text-lg'} font-semibold text-slate-800`}>Project Documents</h3>
                    </div>

                    {loadingDocs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                        <span className="ml-3 text-slate-600 font-medium">Loading documents...</span>
                      </div>
                    ) : availableDocs.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No documents found for this project</p>
                      </div>
                    ) : (
                      <div className={`grid gap-3 ${showSplitView ? 'max-h-60' : 'max-h-80'} overflow-y-auto pr-2`}>
                        {availableDocs.map(doc => (
                          <label
                            key={doc.document_id}
                            className={`flex items-center space-x-4 ${showSplitView ? 'p-3' : 'p-4'} bg-white hover:bg-sky-25 rounded-xl cursor-pointer transition-all duration-200 border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md`}
                          >
                            <input
                              type="checkbox"
                              checked={checkedDocs.includes(doc.document_id)}
                              onChange={() => handleCheckboxChange(doc.document_id)}
                              className="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 focus:ring-2"
                            />
                            <div className="flex-1 flex items-center space-x-3 min-w-0">
                              {getDocumentIcon(doc.document_category)}
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold text-slate-800 truncate ${showSplitView ? 'text-xs' : 'text-sm'}`}>
                                  {doc.document_name}
                                </h4>
                                <p className={`text-slate-500 capitalize font-medium ${showSplitView ? 'text-xs' : 'text-sm'}`}>
                                  {doc.document_category || 'Document'}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className={`${showSplitView ? 'px-4 py-2' : 'px-6 py-3'} border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 font-medium hover:border-slate-400`}
                >
                  <X className="h-4 w-4" />
                  <span className={showSplitView ? 'text-sm' : ''}>Cancel</span>
                </button>
                <button
                  onClick={generateReport}
                  disabled={(files.length === 0 && checkedDocs.length === 0) || loading}
                  className={`flex-1 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white ${showSplitView ? 'py-2 px-4' : 'py-3 px-6'} rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className={showSplitView ? 'text-sm' : ''}>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span className={showSplitView ? 'text-sm' : ''}>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Report Display */}
        {showSplitView && (
          <div className="w-2/3 h-full overflow-y-auto p-4 transform transition-all duration-500">
            <div className="bg-white rounded-2xl shadow-xl h-full border border-sky-100 relative">
              {/* Report close button */}
              <button
                onClick={closeSplitView}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full p-2 transition-all duration-200 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Report header */}
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-sky-100 p-6 z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Generated Report</h3>
                      <p className="text-sm text-slate-500 font-medium">AI-powered project analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadAsPDF}
                    className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white px-5 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Report content */}
              <div className="p-6 overflow-y-auto h-full">
                <div className="space-y-6">
                  {report.split(/\n\s*\n/).map((section, idx) => {
                    const lines = section.split('\n');
                    let currentMainNumber = null;
                    let subHeadingCounter = 0;

                    return (
                      <div key={idx} className="bg-gradient-to-br from-sky-25 to-white rounded-xl p-6 shadow-sm border border-sky-100">
                        {lines.map((line, lineIdx) => {
                          const trimmedLine = line.trim();

                          if (!trimmedLine) return null;

                          // Main headings
                          if (trimmedLine.match(/^\d+\.\s+[A-Z\s&]+$/)) {
                            const mainNumberMatch = trimmedLine.match(/^(\d+)\./);
                            if (mainNumberMatch) {
                              currentMainNumber = mainNumberMatch[1];
                              subHeadingCounter = 0;
                            }
                            return (
                              <h3 key={lineIdx} className="text-xl font-bold text-sky-700 mb-4 flex items-center space-x-3 bg-sky-50 p-4 rounded-xl border-l-4 border-sky-600">
                                <div className="w-3 h-3 bg-sky-600 rounded-full"></div>
                                <span>{trimmedLine}</span>
                              </h3>
                            );
                          }

                          // Sub-headings that should get numbered
                          if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+:$/) && currentMainNumber) {
                            subHeadingCounter++;
                            const numberedSubHeading = `${currentMainNumber}.${subHeadingCounter} ${trimmedLine}`;
                            return (
                              <h4 key={lineIdx} className="text-lg font-semibold text-slate-800 mb-3 mt-5 bg-slate-50 p-3 rounded-lg border-l-3 border-sky-400">
                                {numberedSubHeading}
                              </h4>
                            );
                          }

                          // Other sub-headings
                          if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+:/) || trimmedLine.match(/^[A-Z][a-zA-Z\s&]+$/)) {
                            return (
                              <h4 key={lineIdx} className="text-lg font-semibold text-slate-800 mb-3 mt-5 bg-slate-50 p-3 rounded-lg border-l-3 border-sky-400">
                                {trimmedLine}
                              </h4>
                            );
                          }

                          // Bullet points
                          if (trimmedLine.startsWith('•')) {
                            return (
                              <div key={lineIdx} className="ml-6 mb-3 flex items-start space-x-3">
                                <div className="w-2 h-2 bg-sky-500 rounded-full mt-2.5 flex-shrink-0"></div>
                                <span className="text-slate-700 leading-relaxed font-medium">{trimmedLine.substring(1).trim()}</span>
                              </div>
                            );
                          }

                          // Numbered sub-points
                          if (trimmedLine.match(/^\d+\.\s+[A-Z]/)) {
                            return (
                              <div key={lineIdx} className="ml-8 mb-4 font-semibold text-slate-800 bg-sky-50 p-3 rounded-lg border-l-3 border-sky-300">
                                {trimmedLine}
                              </div>
                            );
                          }

                          // Report header info
                          if (trimmedLine.includes('Generated on:') || trimmedLine.includes('Project ID:') || trimmedLine.includes('Report Type:')) {
                            return (
                              <div key={lineIdx} className="mb-3 font-semibold text-sky-700 bg-sky-50 p-3 rounded-lg border border-sky-200">
                                {trimmedLine}
                              </div>
                            );
                          }

                          // Separator lines
                          if (trimmedLine.match(/^=+$/)) {
                            return (
                              <div key={lineIdx} className="my-6 border-t-2 border-sky-200"></div>
                            );
                          }

                          // Key metrics or status info
                          if (trimmedLine.includes('Status:') || trimmedLine.includes('Budget:') || trimmedLine.includes('Health:')) {
                            return (
                              <div key={lineIdx} className="ml-6 mb-3 font-semibold text-sky-700 bg-sky-50 p-3 rounded-lg border-l-3 border-sky-500">
                                {trimmedLine}
                              </div>
                            );
                          }

                          // Sub-bullet points
                          if (trimmedLine.startsWith('○') || trimmedLine.match(/^[A-Z][a-zA-Z\s]+:/)) {
                            return (
                              <div key={lineIdx} className="ml-10 mb-3 flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-3 flex-shrink-0"></div>
                                <span className="text-slate-600 leading-relaxed font-medium">{trimmedLine.replace(/^○\s*/, '')}</span>
                              </div>
                            );
                          }

                          // Regular paragraphs
                          return (
                            <p key={lineIdx} className="mb-4 text-slate-700 leading-relaxed ml-3 font-medium">
                              {trimmedLine}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;