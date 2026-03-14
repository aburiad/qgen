import { Block, Question } from '../types';
import { SafeKaTeX } from './SafeKaTeX';

interface QuestionRendererProps {
  question: Question;
  showAnswerSpace?: boolean;
  fontSize?: number;
  margin?: number;
  padding?: number;
  mcqFormat?: 'vertical' | 'two-column' | 'answer-key';
}

export function QuestionRenderer({ question, showAnswerSpace = true, fontSize, margin, padding, mcqFormat = 'vertical' }: QuestionRendererProps) {
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
      {/* Question row: number and content side-by-side for non-creative */}
      {question.type !== 'creative' ? (
        <div className="question-row" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div className="question-number" style={{ flex: '0 0 32px', fontWeight: 600, fontSize: fontSize ? `${fontSize * 1.1}px` : undefined }}>{question.number}।</div>
          <div className="question-content" style={{ flex: 1 }}>
            {question.optional && (
              <div className="text-xs text-slate-500 mb-1" style={{ fontSize: fontSize ? `${fontSize * 0.65}px` : undefined }}>(ঐচ্ছিক)</div>
            )}
            {question.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} fontSize={fontSize} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Creative Sub-questions */}
          <div className="ml-6 space-y-2">
            {question.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} fontSize={fontSize} />
            ))}
          </div>
        </>
      )}

      {/* Creative Sub-questions */}
      {question.type === 'creative' && question.subQuestions && (
        <div className="ml-6 mt-4 space-y-4">
          {question.subQuestions.map((subQ, idx) => (
            <div key={subQ.id} className="sub-question space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-medium" style={{ fontSize: fontSize ? `${fontSize * 0.95}px` : undefined }}>{subQ.label})</span>
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
      {/* MCQ Options */}
      {question.type === 'mcq' && question.options && (() => {
        const mcqLabels = ['ক', 'খ', 'গ', 'ঘ'];
        const effectiveFormat = question.mcqFormat || mcqFormat;
        if (effectiveFormat === 'answer-key') {
          return (
            <div className="ml-6 mt-4">
              <div className="space-y-1">
                <span className="font-semibold text-sm text-green-700 font-['Noto_Sans_Bengali']">
                  ✓ উত্তর: {mcqLabels[question.correctAnswer as number]}
                </span>
              </div>
            </div>
          );
        } else if (effectiveFormat === 'two-column') {
          return (
            <div className="ml-6 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-medium min-w-fit font-['Noto_Sans_Bengali']">{mcqLabels[idx]})</span>
                    <span style={{ fontSize: fontSize ? `${fontSize}px` : undefined }} className="font-['Noto_Sans_Bengali']">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          return (
            <div className="ml-6 mt-4">
              <div className="space-y-2">
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-medium min-w-fit font-['Noto_Sans_Bengali']">{mcqLabels[idx]})</span>
                    <span style={{ fontSize: fontSize ? `${fontSize}px` : undefined }} className="font-['Noto_Sans_Bengali']">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      })()}

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