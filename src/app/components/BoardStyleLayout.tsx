import { Block, Question, QuestionPaper } from '../types';
import { getExamTypeBangla } from '../utils/helpers';
import { SafeKaTeX } from './SafeKaTeX';

interface BoardStyleLayoutProps {
  paper: QuestionPaper;
  baseFontSize?: number;
  questionFontSize?: number;
  questionMargin?: number;
  questionPadding?: number;
  columnGap?: number;
  /** When true, hide header (for 2nd+ page in paginated preview) */
  hideHeader?: boolean;
}

export function BoardStyleLayout({ 
  paper, 
  baseFontSize = 13, 
  questionFontSize,
  questionMargin,
  questionPadding,
  columnGap = 8,
  hideHeader = false 
}: BoardStyleLayoutProps) {
  // Get column count from layout (default to 2 if not specified)
  const columnCount = parseInt(paper.setup.layout || '2');
  
  // Split questions into columns
  const splitIntoColumns = (questions: Question[], cols: number) => {
    const columns: Question[][] = Array.from({ length: cols }, () => []);
    questions.forEach((question, idx) => {
      columns[idx % cols].push(question);
    });
    return columns;
  };
  
  const questionColumns = splitIntoColumns(paper.questions, columnCount);

  return (
    <div className="board-exam-paper">
      {!hideHeader && (
      <div className="board-header" data-measure="header">
        <div className="text-center mb-4 pb-2 border-b border-black">
              {paper.setup.schoolName && (
                <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "'Noto Serif Bengali', serif" }}>
                  {paper.setup.schoolName}
                </h1>
              )}
              <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Noto Serif Bengali', serif" }}>
                {getExamTypeBangla(paper.setup.examType)} – {new Date().getFullYear()}
              </h2>
              <div className="flex justify-center gap-6 text-sm mt-1">
                <span style={{ fontFamily: "'Noto Serif Bengali', serif" }}>শ্রেণি: {paper.setup.class}</span>
                <span style={{ fontFamily: "'Noto Serif Bengali', serif" }}>বিষয়: {paper.setup.subject}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span style={{ fontFamily: "'Noto Serif Bengali', serif" }}>সময়: {paper.setup.timeMinutes || '০'} মিনিট</span>
                <span style={{ fontFamily: "'Noto Serif Bengali', serif" }}>পূর্ণমান: {paper.setup.totalMarks || '০'}</span>
          </div>
        </div>
        <div className="mb-3 text-xs border-b border-gray-300 pb-2" style={{ fontFamily: "'Noto Serif Bengali', serif" }}>
          <p className="italic">
            {paper.setup.instructions || '[দ্রষ্টব্য: ডান পাশে উল্লেখিত সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। প্রদত্ত উদ্দীপকটি পড়ে ক থেকে ঘ পর্যন্ত ৪টি প্রশ্নের উত্তর দিতে হবে।]'}
          </p>
        </div>
      </div>
      )}

      {/* Multi-Column Layout */}
      <div className="board-columns" style={{ gap: `${columnGap}px` }}>
        {questionColumns.map((column, idx) => (
          <div key={idx} className="board-column">
            {column.map((question) => (
              <div 
                key={question.id} 
                className="question-item" 
                data-question-id={question.id}
                style={{
                  fontSize: questionFontSize ? `${questionFontSize}px` : undefined,
                  margin: questionMargin ? `${questionMargin}px` : undefined,
                  padding: questionPadding ? `${questionPadding}px` : undefined,
                }}
              >
                <BoardQuestion question={question} fontSize={questionFontSize} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        .board-exam-paper {
          font-family: 'Noto Serif Bengali', serif;
          font-size: ${baseFontSize}px;
          line-height: 1.4;
          color: #000;
        }

        .board-columns {
          display: grid;
          grid-template-columns: repeat(${columnCount}, 1fr);
          gap: 0;
          height: 180mm;
        }

        .board-question {
          margin-bottom: 8px;
          page-break-inside: avoid;
        }

        .board-question-header {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          margin-bottom: 4px;
        }

        .board-question-number {
          font-weight: 600;
          font-size: 14px;
          align-self: flex-start;
        }

        .board-question-marks {
          font-size: 13px;
          margin-left: auto;
          min-width: 28px;
          text-align: center;
        }

        .board-question-content {
          margin-left: 0;
          margin-bottom: 3px;
        }

        .board-section-title {
          text-align: center;
          font-weight: 700;
          font-size: 14px;
          margin: 12px 0 8px 0;
          text-decoration: underline;
        }

        .board-uddipok {
          margin: 4px 0 6px 0;
          padding: 4px 0;
          font-size: 12.5px;
          line-height: 1.4;
        }

        .board-subquestions {
          margin-top: 4px;
          margin-left: 8px;
        }

        .board-subquestion {
          margin-bottom: 4px;
          display: flex;
          gap: 4px;
          align-items: flex-start;
        }

        .board-subquestion-label {
          font-weight: 600;
          min-width: 10px;
          flex-shrink: 0;
        }

        .board-subquestion-content {
          flex: 1;
          line-height: 1.4;
        }

        .board-subquestion-marks {
          font-size: 13px;
          margin-left: auto;
          flex-shrink: 0;
          min-width: 28px;
          text-align: center;
        }

        .board-block {
          margin: 2px 0;
        }

        .board-formula {
          margin: 4px 0;
          font-size: 13px;
        }

        .board-image {
          max-width: 100%;
          height: auto;
          margin: 6px 0;
          border: 1px solid #ddd;
        }

        .board-diagram-placeholder {
          border: 1px dashed #999;
          padding: 8px;
          margin: 6px 0;
          text-align: center;
          font-size: 11px;
          color: #666;
          font-style: italic;
          background-color: #fafafa;
        }

        .board-caption {
          font-size: 11px;
          color: #666;
          text-align: center;
          margin-top: 4px;
        }

        @media print {
          .board-exam-paper {
            font-size: 12px;
          }
          
          .board-question {
            page-break-inside: avoid;
          }

          /* Preserve column layout and spacing */
          .board-columns {
            display: grid;
            grid-template-columns: repeat(${columnCount}, 1fr);
            gap: 0;
            height: auto;
          }

          .board-column {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

function BoardQuestion({ question, fontSize }: { question: Question; fontSize?: number }) {
  const isCreative = question.type === 'creative';

  return (
    <div className={`board-question ${isCreative ? 'creative-question' : ''}`} style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}>
      {/* Non-creative: Question Number and Marks at top */}
      {!isCreative && (
        <div className="board-question-header">
          <span className="board-question-number">{question.number}।</span>
          <span className="board-question-marks">{question.marks}</span>
        </div>
      )}

      {/* Main Question Content (Uddipok for creative) */}
      {isCreative && question.blocks.length > 0 && (
        <div className="board-uddipok" style={{ display: 'flex', gap: '6px' }}>
          <span className="board-question-number" style={{ flexShrink: 0, paddingTop: '2px' }}>{question.number}।</span>
          <div style={{ flex: 1 }}>
            {question.blocks.map((block) => (
              <BoardBlock key={block.id} block={block} fontSize={fontSize} />
            ))}
          </div>
        </div>
      )}

      {/* Non-creative question content */}
      {!isCreative && (
        <div className="board-question-content">
          {question.blocks.map((block) => (
            <BoardBlock key={block.id} block={block} fontSize={fontSize} />
          ))}
        </div>
      )}

      {/* Creative Sub-questions */}
      {isCreative && question.subQuestions && question.subQuestions.length > 0 && (
        <div className="board-subquestions">
          {question.subQuestions.map((subQ) => (
            <div key={subQ.id} className="board-subquestion">
              <span className="board-subquestion-label">{subQ.label}.</span>
              <div className="board-subquestion-content">
                {subQ.blocks.map((block) => (
                  <BoardBlock key={block.id} block={block} fontSize={fontSize} />
                ))}
              </div>
              <span className="board-subquestion-marks">{subQ.marks}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BoardBlock({ block, fontSize }: { block: Block; fontSize?: number }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="board-block" style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: fontSize ? `${fontSize}px` : undefined }}>
          {block.content.text}
        </div>
      );

    case 'formula':
      if (!block.content.latex) return null;
      return (
        <div className="board-formula">
          <SafeKaTeX math={block.content.latex} />
        </div>
      );

    case 'image':
      if (!block.content.url) return null;
      return (
        <div className="board-block">
          <img 
            src={block.content.url} 
            alt={block.content.caption || 'Question'} 
            className="board-image"
            style={{
              width: block.content.width ? `${block.content.width}px` : 'auto',
              height: block.content.height ? `${block.content.height}px` : 'auto',
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
          {block.content.caption && (
            <p className="board-caption">{block.content.caption}</p>
          )}
        </div>
      );

    case 'diagram':
      return (
        <div className="board-diagram-placeholder">
          [{block.content.description || 'চিত্র'}]
        </div>
      );

    case 'table':
      const rows = block.content.rows || 2;
      const cols = block.content.cols || 2;
      const headers = block.content.headers || [];
      const data = block.content.data || [];
      
      return (
        <div className="board-block">
          <table style={{ 
            borderCollapse: 'collapse', 
            border: '1px solid #000', 
            fontSize: '11px',
            width: '100%'
          }}>
            {/* Table Header */}
            {headers.length > 0 && headers.some((h: string) => h && h.trim() !== '') && (
              <thead>
                <tr>
                  {headers.map((header: string, idx: number) => (
                    <th
                      key={idx}
                      style={{
                        border: '1px solid #000',
                        padding: '4px 6px',
                        textAlign: 'left',
                        backgroundColor: '#f1f5f9',
                        fontWeight: 'bold'
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            
            {/* Table Body */}
            <tbody>
              {data.map((rowData: string[], rowIdx: number) => (
                <tr key={rowIdx}>
                  {rowData.map((cellData: string, colIdx: number) => (
                    <td
                      key={colIdx}
                      style={{
                        border: '1px solid #000',
                        padding: '4px 6px',
                        textAlign: 'left'
                      }}
                    >
                      {cellData}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'list':
      if (!block.content.items || block.content.items.length === 0) return null;
      return (
        <div className="board-block" style={{ marginLeft: '4px' }}>
          {block.content.items.map((item: string, idx: number) => (
            item.trim() && (
              <div key={idx} style={{ 
                fontFamily: "'Noto Serif Bengali', serif",
                marginBottom: '2px',
                lineHeight: '1.4'
              }}>
                {String.fromCharCode(97 + idx)}. {item}
              </div>
            )
          ))}
        </div>
      );

    case 'blank':
      return (
        <div className="board-block" style={{ 
          borderBottom: '1px dotted #999', 
          height: '20px',
          margin: '4px 0' 
        }} />
      );

    default:
      return null;
  }
}