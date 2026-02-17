import { Block, Question } from '../types';
import { SafeKaTeX } from './SafeKaTeX';

interface QuestionRendererProps {
  question: Question;
  showAnswerSpace?: boolean;
  fontSize?: number;
  margin?: number;
  padding?: number;
}

export function QuestionRenderer({ question, showAnswerSpace = true, fontSize, margin, padding }: QuestionRendererProps) {
  const styleVar = {
    '--qf-font-size': fontSize ? `${fontSize}px` : undefined,
    '--qf-margin': margin ? `${margin}px` : undefined,
    '--qf-padding': padding ? `${padding}px` : undefined,
  } as React.CSSProperties;

  return (
    <div 
      className="question-item space-y-3"
      style={{
        fontSize: fontSize ? `${fontSize}px` : undefined,
        margin: margin ? `${margin}px` : undefined,
        padding: padding ? `${padding}px` : undefined,
        ...styleVar,
      }}
    >
      {/* Question Number and Type */}
      <div className="question-header flex items-baseline gap-2">
        <span className="font-semibold" style={{ fontSize: fontSize ? `${fontSize * 1.1}px` : undefined }}>{question.number}।</span>
        {question.optional && (
          <span className="text-xs text-slate-500" style={{ fontSize: fontSize ? `${fontSize * 0.65}px` : undefined }}>(ঐচ্ছিক)</span>
        )}
        <span className="ml-auto text-sm text-slate-600" style={{ fontSize: fontSize ? `${fontSize * 0.9}px` : undefined }}>[{question.marks}]</span>
      </div>

      {/* Main Question Content */}
      <div className="ml-6 space-y-2">
        {question.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} fontSize={fontSize} />
        ))}
      </div>

      {/* Creative Sub-questions */}
      {question.type === 'creative' && question.subQuestions && (
        <div className="ml-6 mt-4 space-y-4">
          {question.subQuestions.map((subQ, idx) => (
            <div key={subQ.id} className="sub-question space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-medium" style={{ fontSize: fontSize ? `${fontSize * 0.95}px` : undefined }}>{subQ.label})</span>
                <span className="ml-auto text-sm text-slate-600" style={{ fontSize: fontSize ? `${fontSize * 0.9}px` : undefined }}>[{subQ.marks}]</span>
              </div>
              <div className="ml-4 space-y-2">
                {subQ.blocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} fontSize={fontSize} />
                ))}
              </div>
              {showAnswerSpace && (
                <div className="ml-4 mt-2">
                  <AnswerSpace lines={Math.max(2, Math.floor(subQ.marks / 2))} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Answer Space for non-creative questions */}
      {showAnswerSpace && question.type !== 'creative' && question.type !== 'mcq' && (
        <div className="ml-6 mt-3">
          <AnswerSpace lines={Math.max(3, Math.floor(question.marks / 2))} />
        </div>
      )}
    </div>
  );
}

function BlockRenderer({ block, fontSize }: { block: Block; fontSize?: number }) {
  switch (block.type) {
    case 'text':
      return (
        <p 
          className="leading-relaxed font-['Noto_Sans_Bengali']"
          style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}
        >
          {block.content.text}
        </p>
      );

    case 'formula':
      if (!block.content.latex) return null;
      return (
        <div className="my-3" style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}>
          <SafeKaTeX math={block.content.latex} />
        </div>
      );

    case 'image':
      if (!block.content.url) return null;
      return (
        <div className="my-3">
          <img 
            src={block.content.url} 
            alt={block.content.caption || 'Question'} 
            className="border border-slate-200 rounded"
            style={{
              width: block.content.width ? `${block.content.width}px` : 'auto',
              height: block.content.height ? `${block.content.height}px` : 'auto',
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
          {block.content.caption && (
            <p className="text-sm text-slate-500 mt-2 text-center">{block.content.caption}</p>
          )}
        </div>
      );

    case 'table':
      const rows = block.content.rows || 2;
      const cols = block.content.cols || 2;
      
      // Initialize headers and data if missing (for backward compatibility)
      const headers = block.content.headers || Array(cols).fill('');
      const data = block.content.data || Array.from({ length: rows }, () => Array(cols).fill(''));
      
      return (
        <div className="my-3">
          <table className="border-collapse border border-slate-300 w-auto">
            {/* Table Header */}
            {headers.length > 0 && headers.some((h: string) => h && h.trim() !== '') && (
              <thead>
                <tr>
                  {headers.map((header: string, idx: number) => (
                    <th
                      key={idx}
                      className="border border-slate-300 px-3 py-2 bg-slate-100 font-semibold text-left font-['Noto_Sans_Bengali']"
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
                      className="border border-slate-300 px-3 py-2 min-w-[80px] font-['Noto_Sans_Bengali']"
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

    case 'diagram':
      return (
        <div className="my-3 p-4 border border-dashed border-slate-300 rounded bg-slate-50">
          <p className="text-sm text-slate-600 italic">
            [{block.content.description || 'চিত্র'}]
          </p>
        </div>
      );

    case 'list':
      if (!block.content.items || block.content.items.length === 0) return null;
      return (
        <ul className="list-disc list-inside space-y-1 my-2">
          {block.content.items.map((item: string, idx: number) => (
            item.trim() && <li key={idx} className="text-base">{item}</li>
          ))}
        </ul>
      );

    case 'blank':
      return <AnswerSpace lines={block.content.lines || 1} />;

    default:
      return null;
  }
}

function AnswerSpace({ lines }: { lines: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="border-b border-dotted border-slate-300 h-6" />
      ))}
    </div>
  );
}