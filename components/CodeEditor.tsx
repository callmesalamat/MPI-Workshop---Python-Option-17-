import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, readOnly }) => {
  return (
    <div className="relative h-full font-mono text-sm bg-slate-950 text-slate-300 overflow-hidden rounded-b-lg border border-slate-800 shadow-inner">
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-slate-900 border-r border-slate-800 flex flex-col items-end pt-4 pr-2 text-slate-600 select-none">
        {code.split('\n').map((_, i) => (
          <div key={i} className="leading-6">{i + 1}</div>
        ))}
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full h-full bg-transparent pl-10 pt-4 p-4 resize-none focus:outline-none focus:ring-0 leading-6 text-slate-200"
        spellCheck={false}
      />
    </div>
  );
};

export default CodeEditor;