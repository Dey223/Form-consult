'use client';

import { useState, useEffect } from 'react';
import { 
  $createParagraphNode, 
  $createTextNode, 
  $getRoot, 
  $setSelection 
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Plugin pour synchroniser la valeur HTML
function HtmlPlugin({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (value && value !== '<p><br></p>' && value !== '') {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $getRoot().append(...nodes);
      });
    }
  }, [editor, value]);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          onChange(htmlString);
        });
      }}
    />
  );
}

// Configuration de l'éditeur
const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

function onError(error: Error) {
  console.error('Lexical Error:', error);
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Écrivez votre contenu...",
  className = ""
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-32 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center">
        <span className="text-gray-500">Chargement de l'éditeur...</span>
      </div>
    );
  }

  const initialConfig = {
    namespace: 'RichTextEditor',
    theme,
    onError,
    nodes: [],
  };

  return (
    <div className={className}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          {/* Barre d'outils simple */}
          <div className="border-b border-gray-300 px-3 py-2 bg-gray-50 rounded-t-md">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Éditeur de texte</span>
            </div>
          </div>
          
          {/* Zone d'édition */}
          <div className="relative">
            <PlainTextPlugin
              contentEditable={
                <ContentEditable 
                  className="min-h-[120px] p-3 text-sm outline-none resize-none"
                  style={{ 
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                />
              }
              placeholder={
                <div className="absolute top-3 left-3 text-gray-400 text-sm pointer-events-none">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>
        
        {/* Plugins */}
        <HistoryPlugin />
        <HtmlPlugin value={value} onChange={onChange} />
      </LexicalComposer>
    </div>
  );
} 