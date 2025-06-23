"use client"
import "react-quill-new/dist/quill.snow.css";
import dynamic from "next/dynamic";
import { useMemo, useRef, useId, useCallback, useEffect } from "react";

interface RichEditorProps {
  placeholder: string;
  onChange: (value: string) => void;
  value?: string;
  className?: string;
  hidden?: boolean;
}

const RichEditor = ({ placeholder, onChange, value, className = "", hidden = false }: RichEditorProps) => {
  // ID stable basé sur le placeholder pour éviter les duplications en dev mode
  const baseId = useId();
  const stableId = useMemo(() => {
    // Créer un hash simple du placeholder pour un ID stable
    const hash = placeholder.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `${baseId}-${Math.abs(hash)}`;
  }, [baseId, placeholder]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Debug pour voir les valeurs reçues
  console.log(`RichEditor [${stableId}] received value:`, value, `hidden: ${hidden}`);
  
  // Si le composant est masqué, ne pas rendre l'éditeur
  if (hidden) {
    console.log(`RichEditor [${stableId}] is hidden, not rendering`);
    return null;
  }
  
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { 
      ssr: false,
      loading: () => (
        <div className="h-32 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center">
          <span className="text-gray-500">Chargement de l'éditeur {stableId}...</span>
        </div>
      )
    }),
    [] // Pas de dépendance pour éviter les re-créations
  );

  // Protection contre les erreurs Quill et aria-hidden
  useEffect(() => {
    console.log(`RichEditor [${stableId}] mounted`);
    
    // Fonction pour corriger les problèmes Quill et aria-hidden
    const fixQuillIssues = () => {
      const container = containerRef.current;
      if (!container) return;

      // 1. Corriger les problèmes aria-hidden
      const pickerOptions = container.querySelectorAll('.ql-picker-options[aria-hidden="true"]');
      pickerOptions.forEach(option => {
        const focusableElements = option.querySelectorAll('*[tabindex]:not([tabindex="-1"]), *:focus');
        if (focusableElements.length > 0) {
          option.removeAttribute('aria-hidden');
          (option as HTMLElement).style.display = 'none';
        }
      });

      // 2. Corriger les problèmes de focus Quill
      const quillEditor = container.querySelector('.ql-editor');
      if (quillEditor && !quillEditor.hasAttribute('tabindex')) {
        (quillEditor as HTMLElement).setAttribute('tabindex', '0');
      }

      // 3. Gérer les clics sur toolbar de façon sécurisée
      const toolbarButtons = container.querySelectorAll('.ql-toolbar button');
      toolbarButtons.forEach(button => {
        const existingHandler = button.getAttribute('data-safe-handler');
        if (!existingHandler) {
          button.setAttribute('data-safe-handler', 'true');
          
          const originalClick = (button as HTMLButtonElement).onclick;
          (button as HTMLButtonElement).onclick = (e: Event) => {
            try {
              // S'assurer qu'il y a une sélection valide
              const quill = (window as any).Quill;
              if (quill && quillEditor) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) {
                  // Créer une sélection par défaut
                  const range = document.createRange();
                  range.selectNodeContents(quillEditor);
                  range.collapse(true);
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                }
              }
              
                             if (originalClick) {
                 originalClick.call(button as HTMLButtonElement, e);
               }
            } catch (error) {
              console.warn(`RichEditor [${stableId}] toolbar click error:`, error);
            }
          };
        }
      });
    };

    // Corriger après un délai pour laisser Quill s'initialiser
    const timer = setTimeout(fixQuillIssues, 200);
    const observer = new MutationObserver(fixQuillIssues);
    
    if (containerRef.current) {
      observer.observe(containerRef.current, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['aria-hidden', 'class'] 
      });
    }
    
    return () => {
      console.log(`RichEditor [${stableId}] unmounting`);
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [stableId]);

  // Fonction pour gérer les changements avec nettoyage (mémorisée)
  const handleChange = useCallback((content: string) => {
    console.log(`RichEditor [${stableId}] handleChange called with:`, content);
    // Si le contenu est vide ou ne contient que des balises vides
    if (content === '<p><br></p>' || content === '<p></p>' || content.trim() === '') {
      onChange('');
    } else {
      onChange(content);
    }
  }, [onChange, stableId]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
      ],
      handlers: {
        // Override des handlers pour éviter les erreurs de sélection
        'list': function(value: string) {
          try {
            const quill = this.quill;
            const range = quill.getSelection();
            
            if (!range) {
              // Si pas de sélection, créer une sélection par défaut
              quill.setSelection(0, 0);
              quill.format('list', value);
            } else {
              quill.format('list', value);
            }
          } catch (error) {
            console.warn(`RichEditor list handler error:`, error);
          }
        }
      }
    }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'blockquote', 'code-block', 'link'
  ];

  return (
    <div ref={containerRef} className={className} data-editor-id={stableId}>
      <ReactQuill
        key={stableId}
        theme="snow"
        placeholder={placeholder}
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        style={{
          backgroundColor: 'white',
        }}
      />
      
      {/* CSS personnalisé pour React Quill */}
      <style jsx global>{`
        .ql-editor {
          min-height: 120px;
          font-size: 14px;
          line-height: 1.5;
        }
        .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-radius: 6px 6px 0 0;
        }
        .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-radius: 0 0 6px 6px;
        }
        .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        
        /* Corrections d'accessibilité pour React Quill */
        .ql-picker-options[aria-hidden="true"] {
          display: none !important;
          pointer-events: none !important;
        }
        
        .ql-picker-options:not([aria-hidden="true"]) {
          display: block !important;
        }
        
        /* Éviter les problèmes de focus sur les éléments cachés */
        .ql-picker-options[aria-hidden="true"] * {
          visibility: hidden !important;
          pointer-events: none !important;
        }
        
        /* Améliorer l'accessibilité des dropdowns */
        .ql-picker.ql-expanded .ql-picker-options {
          aria-hidden: false !important;
        }
        
        .ql-picker:not(.ql-expanded) .ql-picker-options {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default RichEditor;
