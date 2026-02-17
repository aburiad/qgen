import { useEffect, useState } from 'react';

interface PrintablePagePreviewProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  includeHeader?: boolean;
  showToolbar?: boolean;
}

/**
 * Pure CSS-driven print pagination system.
 * 
 * - Single container with all dynamic content
 * - No manual page splitting in JavaScript
 * - Browser handles pagination via @page CSS rule
 * - Uses page-break-inside: avoid to keep blocks intact
 */
export function PrintablePagePreview({
  children,
  header,
  includeHeader = true,
  showToolbar = true,
}: PrintablePagePreviewProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="printable-container">
      {showToolbar && (
        <div className="toolbar no-print">
          <button className="btn" onClick={() => window.print()}>
            PDF ডাউনলোড করুন
          </button>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#444' }}>
            প্রিন্ট ডায়ালগে <b>Destination: Save as PDF</b>, <b>Paper: A4</b>, <b>Scale: 100%</b> রাখো
          </div>
        </div>
      )}

      {/* Single continuous document container */}
      <div className="printable-document">
        {/* Header only in print mode or if includeHeader is true */}
        {includeHeader && header && (
          <div className="document-header">
            {header}
          </div>
        )}

        {/* All dynamic content in one continuous flow */}
        <div className="document-content">
          {children}
        </div>
      </div>

      <style>{`
        /* Print pagination controlled by browser via @page rule */
        @page {
          size: A4;
          margin: 5mm;
        }

        .printable-container {
          background: #f2f2f2;
          padding: 16px 0;
        }

        .toolbar {
          padding: 16px;
          text-align: center;
          background: white;
          margin: 0 16px 16px 16px;
          border-radius: 4px;
        }

        .toolbar .btn {
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background 0.2s;
          font-family: 'Noto Sans Bengali', sans-serif;
        }

        .toolbar .btn:hover {
          background: #1d4ed8;
        }

        /* Single document container */
        .printable-document {
          max-width: 210mm;
          margin: 20px auto;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 18mm;
          box-sizing: border-box;
        }

        .document-header {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #ddd;
        }

        .document-content {
          font-family: 'Noto Serif Bengali', serif;
          line-height: 1.6;
          color: #000;
        }

        /* Ensure logical blocks stay intact across page breaks */
        .document-content > * {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Print mode adjustments */
        @media print {
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            background: white;
            margin: 0;
            padding: 0;
          }

          .printable-container {
            background: white;
            padding: 0;
          }

          .toolbar,
          .no-print {
            display: none !important;
          }

          .printable-document {
            max-width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            background: white;
          }

          .document-header {
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #333;
          }

          .document-content > * {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .printable-container {
            padding: 8px 0;
            overflow-x: auto;
          }

          .toolbar {
            margin: 0 8px 12px 8px;
            padding: 12px;
          }

          .toolbar .btn {
            width: 100%;
            padding: 10px 16px;
            font-size: 14px;
          }

          .printable-document {
            margin: 0;
            max-width: unset;
            width: 210mm;
            padding: 18mm;
            background: white;
            border: 1px solid #e0e0e0;
          }
        }
      `}</style>
    </div>
  );
}
