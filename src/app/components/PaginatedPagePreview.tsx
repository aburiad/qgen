import { useRef } from 'react';

interface PaginatedPagePreviewProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  includeHeader?: boolean;
  showToolbar?: boolean;
}

const PAGE_W_MM = 210;

/**
 * Pure CSS-based pagination component.
 * All content is rendered in a single container.
 * Browser handles pagination automatically via CSS @page and page-break rules.
 */
export function PaginatedPagePreview({
  children,
  header,
  footer,
  includeHeader = true,
  showToolbar = true,
}: PaginatedPagePreviewProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="paginated-container">
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

      {/* Single document container - browser handles pagination */}
      <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
        <div
          ref={documentRef}
          className="document-wrapper"
          style={{
            width: `${PAGE_W_MM}mm`,
            margin: '20px auto',
            background: 'white',
            padding: '18mm',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
            minHeight: '297mm',
          }}
        >
          {/* Header - shown only on first page via CSS */}
          {includeHeader && header && (
            <div className="document-header">
              {header}
            </div>
          )}

          {/* All content in single container */}
          <div className="document-content">
            {children}
          </div>
        </div>
      </div>

      {footer && (
        <div className="pages-footer no-print">
          {footer}
        </div>
      )}
    </div>
  );
}
