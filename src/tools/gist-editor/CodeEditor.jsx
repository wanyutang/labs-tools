import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { markdown } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { css } from "@codemirror/lang-css";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";

const getExtension = (filename = "") => filename.toLowerCase().split(".").pop() || "";

const getLanguageExtension = (filename) => {
  const extension = getExtension(filename);
  if (extension === "md" || extension === "markdown") return markdown();
  if (extension === "html" || extension === "htm") return html();
  if (extension === "js" || extension === "jsx" || extension === "ts" || extension === "tsx") {
    return javascript({ jsx: extension === "jsx" || extension === "tsx", typescript: extension === "ts" || extension === "tsx" });
  }
  if (extension === "json") return json();
  if (extension === "css" || extension === "scss" || extension === "less") return css();
  if (extension === "sql") return sql();
  if (extension === "java") return java();
  return [];
};

const editorBaseTheme = EditorView.theme({
  "&": {
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    backgroundColor: "#1e1e1e",
    display: "flex",
    flexDirection: "column"
  },
  ".cm-scroller": {
    flex: "1 1 auto",
    minHeight: 0,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    overflow: "auto",
    touchAction: "pan-x pan-y pinch-zoom"
  },
  ".cm-content": {
    padding: "0.75rem 1rem",
    caretColor: "#d4d4d4"
  },
  ".cm-gutters": {
    backgroundColor: "#1e1e1e",
    borderRight: "1px solid #2d2d2d",
    color: "#5c5c5c"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5rem 0 0.25rem"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#252526"
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.035)"
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(0, 122, 204, 0.35)"
  },
  "&.cm-focused": {
    outline: "none"
  }
});

const noWrapTheme = EditorView.theme({
  ".cm-content": {
    minWidth: "max-content"
  },
  ".cm-line": {
    paddingRight: "2rem"
  }
});

const makeFontTheme = (fontSize, lineHeight) => EditorView.theme({
  ".cm-scroller": {
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`
  }
});

const makeWrapExtension = (softWrap) => softWrap ? EditorView.lineWrapping : noWrapTheme;

const CodeEditor = forwardRef(function CodeEditor({
  filename,
  value,
  onChange,
  fontSize,
  lineHeight,
  softWrap,
  onPinchStart,
  onPinchMove,
  onPinchEnd
}, ref) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const languageCompartment = useMemo(() => new Compartment(), []);
  const fontCompartment = useMemo(() => new Compartment(), []);
  const wrapCompartment = useMemo(() => new Compartment(), []);

  onChangeRef.current = onChange;

  useImperativeHandle(ref, () => ({
    focus: () => viewRef.current?.focus(),
    insertText: (text) => {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
        scrollIntoView: true
      });
      view.focus();
    }
  }), []);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        oneDark,
        editorBaseTheme,
        languageCompartment.of(getLanguageExtension(filename)),
        fontCompartment.of(makeFontTheme(fontSize, lineHeight)),
        wrapCompartment.of(makeWrapExtension(softWrap)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentValue = view.state.doc.toString();
    if (currentValue === value) return;
    view.dispatch({
      changes: { from: 0, to: currentValue.length, insert: value }
    });
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(filename))
    });
  }, [filename, languageCompartment]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: fontCompartment.reconfigure(makeFontTheme(fontSize, lineHeight))
    });
  }, [fontCompartment, fontSize, lineHeight]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: wrapCompartment.reconfigure(makeWrapExtension(softWrap))
    });
  }, [softWrap, wrapCompartment]);

  return (
    <div
      ref={containerRef}
      className="min-w-0 min-h-0 h-full flex-1 overflow-hidden"
      onTouchStart={onPinchStart}
      onTouchMove={onPinchMove}
      onTouchEnd={onPinchEnd}
      onTouchCancel={onPinchEnd}
    />
  );
});

export default CodeEditor;
