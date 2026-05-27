import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Save,
  Trash2,
  Eye,
  Settings,
  FileCode,
  FileImage,
  FileJson,
  FileTerminal,
  Search,
  RefreshCw,
  Lock,
  Globe,
  Key,
  Sparkles,
  Wand2,
  FileEdit,
  Send,
  Check,
  ExternalLink,
  BookOpenText,
  Braces,
  Database,
  NotebookText,
  Table2
} from "lucide-react";

const extensionPattern = /\.(md|markdown|txt|js|css|scss|less|html|htm|json|py|ipynb|sh|bash|zsh|ts|tsx|jsx|vue|svelte|yml|yaml|xml|csv|tsv|xlsx|xls|sql|toml|ini|env|pdf|doc|docx)$/i;

const getExtension = (filename = "") => {
  const match = filename.toLowerCase().match(/\.([^.]+)$/);
  return match ? match[1] : "";
};

const getFileIconMeta = (filename) => {
  const ext = getExtension(filename);

  if (["md", "markdown", "txt"].includes(ext)) {
    return { Icon: BookOpenText, className: "text-[#4ea1ff]" };
  }
  if (["js", "jsx", "ts", "tsx", "vue", "svelte", "html", "htm", "css", "scss", "less"].includes(ext)) {
    return { Icon: FileCode, className: "text-[#dcdcaa]" };
  }
  if (["json", "yml", "yaml", "toml", "xml", "ini", "env"].includes(ext)) {
    return { Icon: Braces, className: "text-[#ce9178]" };
  }
  if (["py", "ipynb"].includes(ext)) {
    return { Icon: ext === "ipynb" ? NotebookText : FileCode, className: "text-[#c586c0]" };
  }
  if (["sh", "bash", "zsh"].includes(ext)) {
    return { Icon: FileTerminal, className: "text-[#89d185]" };
  }
  if (["csv", "tsv", "xlsx", "xls"].includes(ext)) {
    return { Icon: Table2, className: "text-[#89d185]" };
  }
  if (["sql"].includes(ext)) {
    return { Icon: Database, className: "text-[#4ec9b0]" };
  }
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return { Icon: FileImage, className: "text-[#d7ba7d]" };
  }
  if (["pdf", "doc", "docx"].includes(ext)) {
    return { Icon: FileText, className: "text-[#b5cea8]" };
  }

  return { Icon: FileText, className: "text-gray-500" };
};

export default function App() {
  const [token, setToken] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gists, setGists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [activeGist, setActiveGist] = useState(null);
  const [activeFile, setActiveFile] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [draftFilename, setDraftFilename] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [expandedGists, setExpandedGists] = useState(new Set());
  const [isPreview, setIsPreview] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const [showNewGistModal, setShowNewGistModal] = useState(false);
  const [newGistName, setNewGistName] = useState("");
  const [newGistPublic, setNewGistPublic] = useState(false);
  const [newGistContent, setNewGistContent] = useState("# 新增文件\n開始在此編輯內容...");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [suggestedFilename, setSuggestedFilename] = useState("");

  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("github_gist_token");
    const savedGeminiKey = localStorage.getItem("gemini_api_key");
    if (savedGeminiKey) {
      setGeminiKey(savedGeminiKey);
    }
    if (savedToken) {
      setToken(savedToken);
      validateAndFetchGists(savedToken, savedGeminiKey || "");
    } else {
      setShowSettings(true);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      let refreshed = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshed) return;
        refreshed = true;
        window.location.reload();
      });
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
        .then(registration => registration.update())
        .catch(() => {});
    }
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Token 無效，請重新確認權限設定。");
        }
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.message || `伺服器回應錯誤: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const validateAndFetchGists = async (targetToken, targetGeminiKey = geminiKey) => {
    if (!targetToken) return;
    setLoading(true);
    try {
      const res = await fetchWithRetry("https://api.github.com/gists?per_page=100", {
        headers: {
          "Authorization": `Bearer ${targetToken}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      });
      const data = await res.json();
      setGists(data);
      setIsTokenValid(true);
      localStorage.setItem("github_gist_token", targetToken);
      if (targetGeminiKey) {
        localStorage.setItem("gemini_api_key", targetGeminiKey);
      } else {
        localStorage.removeItem("gemini_api_key");
      }
      setGeminiKey(targetGeminiKey || "");
      setShowSettings(false);
      showToast("同步 GitHub Gist 成功", "success");
    } catch (err) {
      console.error(err);
      setIsTokenValid(false);
      setShowSettings(true);
      showToast(err.message || "取得 Gist 失敗，請確認網路與 Token。", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGist = async () => {
    if (!activeGist || !activeFile) return;
    setSaving(true);
    try {
      await fetchWithRetry(`https://api.github.com/gists/${activeGist.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          files: {
            [activeFile]: { content: editorContent }
          }
        })
      });
      setOriginalContent(editorContent);
      showToast("存檔成功！已更新至 GitHub", "success");
      setGists(prevGists => prevGists.map(g => {
        if (g.id === activeGist.id) {
          return {
            ...g,
            files: {
              ...g.files,
              [activeFile]: {
                ...g.files[activeFile],
                content: editorContent
              }
            }
          };
        }
        return g;
      }));
    } catch (err) {
      console.error(err);
      showToast("存檔失敗，請確認網路狀態。", "error");
    } finally {
      setSaving(false);
    }
  };

  const openGistInNewWindow = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!activeGist?.html_url) return;
    window.open(activeGist.html_url, "_blank", "noopener,noreferrer");
  };

  const handleSaveGistMetadata = async () => {
    if (!activeGist || !activeFile) return;

    const nextFilename = draftFilename.trim();
    const nextDescription = draftDescription.trim();
    if (!nextFilename) {
      showToast("檔名不能留空。", "error");
      return;
    }

    const filenameChanged = nextFilename !== activeFile;
    const descriptionChanged = nextDescription !== (activeGist.description || "");
    if (!filenameChanged && !descriptionChanged) {
      setMetadataOpen(false);
      return;
    }

    setSaving(true);
    try {
      const filesPayload = filenameChanged ? {
        [activeFile]: {
          filename: nextFilename
        }
      } : undefined;

      await fetchWithRetry(`https://api.github.com/gists/${activeGist.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          description: nextDescription,
          ...(filesPayload ? { files: filesPayload } : {})
        })
      });

      setGists(prevGists => prevGists.map(gist => {
        if (gist.id !== activeGist.id) return gist;
        const files = { ...gist.files };
        if (filenameChanged) {
          delete files[activeFile];
          files[nextFilename] = {
            ...(gist.files[activeFile] || {}),
            filename: nextFilename
          };
        }
        return { ...gist, description: nextDescription, files };
      }));

      setActiveGist(prev => {
        const files = { ...prev.files };
        if (filenameChanged) {
          delete files[activeFile];
          files[nextFilename] = {
            ...(prev.files[activeFile] || {}),
            filename: nextFilename
          };
        }
        return { ...prev, description: nextDescription, files };
      });
      if (filenameChanged) {
        setActiveFile(nextFilename);
      }
      setMetadataOpen(false);
      showToast("檔案資訊已更新。", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "檔案資訊更新失敗。", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGist = async (gistId) => {
    if (!window.confirm("確定要永久刪除此 Gist 嗎？此動作無法復原。")) return;
    try {
      await fetchWithRetry(`https://api.github.com/gists/${gistId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      });
      showToast("已成功刪除該 Gist", "success");
      setGists(prev => prev.filter(g => g.id !== gistId));
      if (activeGist?.id === gistId) {
        setActiveGist(null);
        setActiveFile("");
        setEditorContent("");
        setOriginalContent("");
        setDraftFilename("");
        setDraftDescription("");
        setMetadataOpen(false);
      }
    } catch (err) {
      console.error(err);
      showToast("刪除失敗，請再試一次。", "error");
    }
  };

  const handleCreateGist = async () => {
    if (!newGistName.trim()) {
      showToast("名稱不能留空", "error");
      return;
    }
    setSaving(true);
    try {
      const defaultFilename = newGistName.includes(".") ? newGistName : `${newGistName}.md`;
      const res = await fetchWithRetry("https://api.github.com/gists", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          description: newGistName,
          public: newGistPublic,
          files: {
            [defaultFilename]: { content: newGistContent }
          }
        })
      });
      const newGist = await res.json();
      setGists(prev => [newGist, ...prev]);
      setShowNewGistModal(false);
      showToast("成功建立新的 Gist", "success");
      handleSelectGist(newGist, defaultFilename);
      setNewGistName("");
    } catch (err) {
      console.error(err);
      showToast("建立失敗，請稍後重試。", "error");
    } finally {
      setSaving(false);
    }
  };

  const getFilePath = (filename) => {
    return (filename || "Untitled").replace(extensionPattern, "");
  };

  const buildTree = (gistsList) => {
    const root = { name: "Root", isFolder: true, children: {}, gists: [] };
    const query = searchQuery.toLowerCase();

    gistsList.forEach(gist => {
      const matchesSearch = query ? (
        (gist.description && gist.description.toLowerCase().includes(query)) ||
        Object.keys(gist.files || {}).some(f => f.toLowerCase().includes(query))
      ) : true;
      if (!matchesSearch) return;

      const files = Object.keys(gist.files || {});
      const primaryFile = files[0] || "Untitled";
      const pathStr = getFilePath(primaryFile);
      const parts = pathStr.split(".").filter(Boolean);
      let currentNode = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!currentNode.children[part]) {
          currentNode.children[part] = {
            name: part,
            isFolder: true,
            children: {},
            gists: []
          };
        }
        currentNode = currentNode.children[part];
      }

      const lastPart = parts[parts.length - 1] || "Untitled";
      currentNode.gists.push({
        displayName: lastPart,
        gist,
        filename: primaryFile
      });
    });
    return root;
  };

  const handleSelectGist = async (gist, filename) => {
    if (editorContent !== originalContent) {
      if (!window.confirm("您有尚未儲存的修改，確定要捨棄並切換檔案嗎？")) {
        return;
      }
    }

    setActiveGist(gist);
    setActiveFile(filename);
    setDraftFilename(filename);
    setDraftDescription(gist.description || "");
    setMetadataOpen(false);
    setSidebarOpen(false);

    const fileObj = gist.files[filename];
    if (fileObj && fileObj.content) {
      setEditorContent(fileObj.content);
      setOriginalContent(fileObj.content);
    } else if (fileObj && fileObj.raw_url) {
      setLoading(true);
      try {
        const res = await fetch(fileObj.raw_url);
        const text = await res.text();
        setEditorContent(text);
        setOriginalContent(text);
        gist.files[filename].content = text;
      } catch (err) {
        showToast("無法下載檔案內容，請確認連線。", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setEditorContent("");
      setOriginalContent("");
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const insertSymbol = (symbol) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = editorContent.substring(0, start);
    const after = editorContent.substring(end);

    setEditorContent(before + symbol + after);

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 50);
  };

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      showToast("iPhone 請用 Safari 分享選單加入主畫面。");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
      showToast("已開始安裝應用程式。", "success");
    }
  };

  const callGeminiAPI = async (promptText, systemInstruction = "") => {
    if (!geminiKey) {
      throw new Error("未設定 Gemini API Key。");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
      })
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.error?.message || `Gemini API 回應異常: ${response.status}`);
    }

    const result = await response.json();
    const output = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!output) throw new Error("Gemini API 沒有回傳文字內容。");
    return output;
  };

  const handleOpenAiModal = () => {
    if (!geminiKey) {
      showToast("請先在設定中心輸入 Gemini API Key。", "error");
      setShowSettings(true);
      return;
    }
    setAiResult("");
    setSuggestedFilename("");
    setShowAiModal(true);
  };

  const handleAiSuggestFilename = async () => {
    if (!editorContent.trim()) {
      showToast("請先輸入或載入內容。", "error");
      return;
    }
    setAiLoading(true);
    setSuggestedFilename("");
    try {
      const systemPrompt = "你是 GitHub Gist 檔案分類助手。請根據內容推薦一個 2 到 3 層、用點號分隔的檔名，例如 tech.react.hooks.md 或 note.work.weekly.md。只輸出檔名，不要解釋。";
      const result = await callGeminiAPI(`目前內容如下：\n\n${editorContent.slice(0, 3000)}`, systemPrompt);
      setSuggestedFilename(result.trim().replace(/^`+|`+$/g, ""));
      showToast("已生成推薦檔名。", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message || "無法取得檔名建議。", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyNewFilename = async () => {
    if (!suggestedFilename || !activeGist || !activeFile) return;
    setSaving(true);
    try {
      await fetchWithRetry(`https://api.github.com/gists/${activeGist.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          files: {
            [activeFile]: {
              filename: suggestedFilename,
              content: editorContent
            }
          }
        })
      });
      const updatedGists = gists.map(gist => {
        if (gist.id !== activeGist.id) return gist;
        const files = { ...gist.files };
        delete files[activeFile];
        files[suggestedFilename] = { filename: suggestedFilename, content: editorContent };
        return { ...gist, files, description: suggestedFilename };
      });
      setGists(updatedGists);
      setActiveFile(suggestedFilename);
      setDraftFilename(suggestedFilename);
      setDraftDescription(suggestedFilename);
      setActiveGist(prev => {
        const files = { ...prev.files };
        delete files[activeFile];
        files[suggestedFilename] = { filename: suggestedFilename, content: editorContent };
        return { ...prev, files, description: suggestedFilename };
      });
      setOriginalContent(editorContent);
      setSuggestedFilename("");
      showToast("已重新命名並更新分群。", "success");
    } catch (error) {
      console.error(error);
      showToast("重命名失敗。", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAiPolishText = async () => {
    if (!editorContent.trim()) return;
    setAiLoading(true);
    try {
      const systemPrompt = "你是文件潤飾與 Markdown 格式化助手。請優化語氣、流暢度、錯字與 Markdown 格式。只輸出修改後完整內容。";
      setAiResult(await callGeminiAPI(editorContent, systemPrompt));
    } catch (error) {
      console.error(error);
      showToast(error.message || "精煉失敗。", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiContinueWriting = async () => {
    if (!editorContent.trim()) return;
    setAiLoading(true);
    try {
      const systemPrompt = "你是寫作助理。請延續使用者提供的文章或程式碼，接著往下寫一至兩段。只輸出續寫內容。";
      setAiResult(await callGeminiAPI(editorContent, systemPrompt));
    } catch (error) {
      console.error(error);
      showToast(error.message || "續寫失敗。", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiCustomPrompt = async () => {
    if (!aiPrompt.trim() || !editorContent.trim()) return;
    setAiLoading(true);
    try {
      const systemPrompt = "你是代碼與文字編輯助手。請嚴格執行使用者指令，只回傳修改後的完整新內容，不要額外解釋。";
      const promptText = `請根據指令「${aiPrompt}」修改以下內容：\n\n${editorContent}`;
      setAiResult(await callGeminiAPI(promptText, systemPrompt));
      setAiPrompt("");
    } catch (error) {
      console.error(error);
      showToast(error.message || "AI 指令失敗。", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiResult = (mode = "replace") => {
    if (!aiResult) return;
    setEditorContent(prev => mode === "replace" ? aiResult : `${prev}\n${aiResult}`);
    setAiResult("");
    setShowAiModal(false);
    showToast("AI 結果已套用。", "success");
  };

  const toggleFolder = (folderPath) => {
    const next = new Set(expandedFolders);
    if (next.has(folderPath)) next.delete(folderPath);
    else next.add(folderPath);
    setExpandedFolders(next);
  };

  const toggleGistExpand = (gistId) => {
    const next = new Set(expandedGists);
    if (next.has(gistId)) next.delete(gistId);
    else next.add(gistId);
    setExpandedGists(next);
  };

  const renderTree = (node, path = "", depth = 0) => {
    return (
      <div key={path || "root"} className="select-none">
        {Object.entries(node.children).map(([folderName, folderNode]) => {
          const folderPath = path ? `${path}.${folderName}` : folderName;
          const isExpanded = expandedFolders.has(folderPath);
          return (
            <div key={folderPath}>
              <div
                className="flex items-center justify-between py-2 px-3 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc] font-medium text-xs transition-colors rounded"
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onClick={() => toggleFolder(folderPath)}
              >
                <div className="flex items-center min-w-0">
                  <span className="mr-1.5 text-gray-500">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <Folder size={14} className="mr-1.5 text-yellow-500/80" />
                  <span className="truncate">{folderName}</span>
                </div>
              </div>
              {isExpanded && renderTree(folderNode, folderPath, depth + 1)}
            </div>
          );
        })}

        {node.gists.map(({ displayName, gist, filename }) => {
          const isSelected = activeGist?.id === gist.id && activeFile === filename;
          const isGistExpanded = expandedGists.has(gist.id);
          const files = Object.keys(gist.files || {});
          const hasMultipleFiles = files.length > 1;
          const { Icon: ItemIcon, className: itemIconClassName } = getFileIconMeta(filename);

          return (
            <div key={`${gist.id}:${filename}`}>
              <div
                className={`flex items-center justify-between py-2.5 px-3 cursor-pointer text-xs transition-colors rounded ${
                  isSelected
                    ? "bg-[#37373d] text-white font-medium border-l-2 border-[#007acc]"
                    : "hover:bg-[#2a2d2e] text-[#b3b3b3]"
                }`}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onClick={() => handleSelectGist(gist, filename)}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <ItemIcon size={14} className={`mr-1.5 flex-shrink-0 ${isSelected ? "text-[#007acc]" : itemIconClassName}`} />
                  <span className="truncate">{displayName}</span>
                </div>

                {hasMultipleFiles && (
                  <button
                    className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGistExpand(gist.id);
                    }}
                  >
                    {isGistExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                )}
              </div>

              {isGistExpanded && (
                <div className="bg-[#1e1e1f] py-1 border-l border-[#3c3c3c] ml-5">
                  {files.map(filename => {
                    const isFileSelected = isSelected && activeFile === filename;
                    const { Icon: ChildIcon, className: childIconClassName } = getFileIconMeta(filename);
                    return (
                      <div
                        key={filename}
                        className={`flex items-center py-2 pr-3 pl-6 text-[11px] cursor-pointer ${
                          isFileSelected ? "text-white font-semibold bg-[#2a2d2e]" : "text-gray-500 hover:text-gray-300"
                        }`}
                        onClick={() => handleSelectGist(gist, filename)}
                      >
                        <ChildIcon size={11} className={`mr-1.5 flex-shrink-0 ${isFileSelected ? "text-[#007acc]" : childIconClassName}`} />
                        <span className="truncate">{filename}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const parseMarkdown = (markdownText) => {
    if (!markdownText) return { __html: '<p class="text-gray-500 italic">無內容...</p>' };

    let html = markdownText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-white border-b border-[#3c3c3c] pb-2 mt-4 mb-2">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-white border-b border-[#3c3c3c]/50 pb-1 mt-4 mb-2">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-white mt-3 mb-1.5">$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-base font-bold text-gray-200 mt-2 mb-1">$1</h4>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-[#1a1a1a] p-3 rounded-lg border border-[#3c3c3c] font-mono text-xs overflow-x-auto my-3 text-gray-300">$1</pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-[#2d3139] px-1.5 py-0.5 rounded text-xs font-mono text-amber-400">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/^\s*[-*+]\s+(.*?)$/gm, '<li class="list-disc ml-5 my-1 text-gray-300">$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="list-decimal ml-5 my-1 text-gray-300">$1</li>');
    html = html.replace(/\n/g, "<br />");

    return { __html: html };
  };

  const treeData = buildTree(gists);
  const charCount = editorContent ? editorContent.length : 0;
  const wordCount = editorContent ? editorContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const metadataDirty = Boolean(activeGist) && (
    draftFilename.trim() !== activeFile ||
    draftDescription.trim() !== (activeGist.description || "")
  );

  return (
    <div className="safe-screen flex w-full bg-[#1e1e1e] text-[#d4d4d4] font-sans overflow-hidden select-none">
      <div
        className={`fixed safe-fixed-y left-0 z-40 w-72 bg-[#252526] border-r border-[#3c3c3c] flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopSidebarCollapsed ? "md:-translate-x-full" : "md:translate-x-0"
        }`}
      >
        <div className="h-14 border-b border-[#3c3c3c] flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-[#007acc] rounded-full animate-pulse"></span>
            <span className="font-semibold text-white tracking-wide text-sm">GistMobile Editor</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 hover:bg-[#37373d] rounded text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 border-b border-[#3c3c3c]">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋標題、檔名或路徑..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-xs text-white rounded px-8 py-2 outline-none placeholder-gray-500 transition-all"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
          {loading && gists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <RefreshCw className="animate-spin text-[#007acc]" size={20} />
              <span className="text-xs text-gray-500">正在與 GitHub 進行數據同步...</span>
            </div>
          ) : Object.keys(treeData.children).length === 0 && treeData.gists.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-600">無符合篩選條件的項目</div>
          ) : (
            renderTree(treeData)
          )}
        </div>

        <div className="p-3 border-t border-[#3c3c3c] bg-[#1e1e1f] flex space-x-2">
          <button
            onClick={() => setShowNewGistModal(true)}
            className="flex-1 bg-[#2ea44f] hover:bg-[#2c974b] active:scale-95 text-white py-2 px-3 rounded flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all"
          >
            <Plus size={14} />
            <span>建立新 Gist</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-[#3c3c3c] hover:bg-[#4d4d4d] p-2 rounded text-gray-300 transition-all"
            title="設定 GitHub Token"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"></div>
      )}

      <div className={`flex-1 h-full flex flex-col min-w-0 transition-[margin] duration-300 ease-in-out ${desktopSidebarCollapsed ? "md:ml-0" : "md:ml-72"}`}>
        <div className="h-14 border-b border-[#3c3c3c] flex items-center justify-between px-3 md:px-5 bg-[#1e1e1e]">
          <div className="flex items-center min-w-0 space-x-2">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-[#2d2d2d] rounded text-gray-300 md:hidden flex-shrink-0">
              <Menu size={20} />
            </button>
            <button
              onClick={() => setDesktopSidebarCollapsed((value) => !value)}
              className="hidden md:flex p-1.5 hover:bg-[#2d2d2d] rounded text-gray-300 flex-shrink-0"
              title={desktopSidebarCollapsed ? "展開左側選單" : "收合左側選單"}
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0 flex flex-col justify-center">
              {activeGist ? (
                <button
                  onClick={() => setMetadataOpen(value => !value)}
                  className="min-w-0 flex items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-[#2d2d2d] transition-colors"
                  title="展開檔案資訊"
                >
                  {activeGist.public ? (
                    <Globe size={12} className="text-[#007acc] flex-shrink-0" />
                  ) : (
                    <Lock size={12} className="text-amber-500 flex-shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-white truncate max-w-[190px] sm:max-w-[300px] md:max-w-[420px]">
                    {activeFile}
                  </span>
                  <ChevronDown size={14} className={`text-gray-500 flex-shrink-0 transition-transform ${metadataOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <span className="text-sm text-gray-500 font-medium">尚未選取任何檔案</span>
              )}
            </div>
          </div>

          {activeGist && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleOpenAiModal}
                className="p-2 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 rounded transition-all"
                title="Gemini AI 協作"
              >
                <Sparkles size={16} />
              </button>

              <div className="flex items-center rounded bg-[#252526] overflow-hidden">
                <button
                  onClick={() => setIsPreview(false)}
                  className={`p-2 flex items-center gap-1.5 transition-colors ${!isPreview ? "bg-[#007acc] text-white" : "hover:bg-[#2d2d2d] text-gray-400"}`}
                  title="Editor"
                >
                  <FileCode size={16} />
                  <span className="hidden lg:inline text-xs font-semibold">Editor</span>
                </button>
                <button
                  onClick={() => setIsPreview(true)}
                  className={`p-2 flex items-center gap-1.5 transition-colors ${isPreview ? "bg-[#007acc] text-white" : "hover:bg-[#2d2d2d] text-gray-400"}`}
                  title="View"
                >
                  <Eye size={16} />
                  <span className="hidden lg:inline text-xs font-semibold">View</span>
                </button>
              </div>

              <button
                onClick={handleSaveGist}
                disabled={saving || editorContent === originalContent}
                className={`py-1.5 px-3 rounded flex items-center space-x-1 text-xs font-semibold transition-all ${
                  editorContent === originalContent
                    ? "bg-[#2d2d2d] text-gray-500 cursor-not-allowed"
                    : "bg-[#007acc] text-white hover:bg-[#0062a3] active:scale-95"
                }`}
              >
                <Save size={13} />
                <span className="hidden sm:inline">{saving ? "正在儲存" : "儲存"}</span>
              </button>

              <button
                onClick={() => handleDeleteGist(activeGist.id)}
                className="p-2 hover:bg-[#3e2d2d] hover:text-[#f85149] rounded text-gray-400 transition-colors"
                title="刪除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {activeGist && metadataOpen && (
          <div className="border-b border-[#3c3c3c] bg-[#181818] px-3 py-3 md:px-5">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
              <label className="min-w-0 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Filename</span>
                <input
                  value={draftFilename}
                  onChange={(event) => setDraftFilename(event.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] text-xs text-white rounded px-3 py-2 outline-none font-mono"
                />
              </label>

              <label className="min-w-0 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Description</span>
                <input
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] text-xs text-white rounded px-3 py-2 outline-none"
                  placeholder="Gist description"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={openGistInNewWindow}
                  className="flex items-center gap-1.5 bg-[#252526] hover:bg-[#2d2d2d] text-[#4ea1ff] border border-[#3c3c3c] rounded px-3 py-2 text-xs font-semibold transition-colors"
                  title="用新視窗開啟 GitHub Gist"
                >
                  <ExternalLink size={13} />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={handleSaveGistMetadata}
                  disabled={saving || !metadataDirty}
                  className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-semibold transition-colors ${
                    metadataDirty
                      ? "bg-[#007acc] text-white hover:bg-[#0062a3]"
                      : "bg-[#2d2d2d] text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Check size={13} />
                  <span>更新</span>
                </button>
              </div>
            </div>
            <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] text-gray-500">
              <span className="truncate">{getFilePath(activeFile).replace(/\./g, " / ")}</span>
            </div>
          </div>
        )}

        <div className="flex-1 relative flex flex-col min-h-0 bg-[#1e1e1e]">
          {!activeGist ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#1e1e1e] space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#252526] border border-[#3c3c3c] flex items-center justify-center shadow-lg">
                <FileCode size={32} className="text-[#007acc]" />
              </div>
              <div className="max-w-sm space-y-2">
                <h3 className="text-lg font-bold text-white">點選 Gist 以開始編輯</h3>
                <p className="text-xs text-[#858585] leading-relaxed">
                  請點擊左上角選單載入並新增 Gist，此程式直接連線至 GitHub API，所有異動均會同步。
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-[#3c3c3c] hover:bg-[#4d4d4d] active:scale-95 text-white py-2 px-5 rounded-lg text-xs font-semibold transition-all shadow-md md:hidden"
              >
                開啟文章目錄
              </button>
            </div>
          ) : isPreview ? (
            <div className="flex-1 overflow-y-auto px-6 py-6 prose prose-invert bg-[#1e1e1e] max-w-full custom-scrollbar selection:bg-[#007acc]/30">
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={parseMarkdown(editorContent)} />
            </div>
          ) : (
            <div className="flex-1 flex min-h-0 relative">
              <div
                ref={lineNumbersRef}
                className="w-11 bg-[#1e1e1e] text-right pr-2 select-none font-mono text-[13px] leading-[22px] py-3 text-[#5c5c5c] border-r border-[#2d2d2d] overflow-hidden"
              >
                {editorContent.split("\n").map((_, index) => (
                  <div key={index} className="h-[22px]">{index + 1}</div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                onScroll={handleScroll}
                placeholder="開始編寫精彩的內容..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] leading-[22px] py-3 px-4 resize-none text-[#d4d4d4] placeholder-gray-600 overflow-y-auto custom-scrollbar focus:ring-0 selection:bg-[#007acc]/30"
              />
            </div>
          )}

          {activeGist && !isPreview && (
            <div className="h-10 border-t border-[#3c3c3c] bg-[#252526] flex items-center justify-between px-2 overflow-x-auto select-none flex-shrink-0 hide-scrollbar scroll-smooth">
              <div className="flex space-x-1">
                <button onClick={() => insertSymbol("#")} className="h-8 w-8 text-xs font-bold rounded hover:bg-[#37373d] text-gray-300 flex items-center justify-center">#</button>
                <button onClick={() => insertSymbol("- ")} className="h-8 w-8 text-xs font-bold rounded hover:bg-[#37373d] text-gray-300 flex items-center justify-center">-</button>
                <button onClick={() => insertSymbol("**")} className="h-8 w-8 text-xs font-bold rounded hover:bg-[#37373d] text-gray-300 flex items-center justify-center">B</button>
                <button onClick={() => insertSymbol("*")} className="h-8 w-8 text-xs italic rounded hover:bg-[#37373d] text-gray-300 flex items-center justify-center">I</button>
                <button onClick={() => insertSymbol("`")} className="h-8 w-8 text-xs font-mono rounded hover:bg-[#37373d] text-gray-300 flex items-center justify-center">`</button>
                <button onClick={() => insertSymbol("[] ")} className="h-8 w-8 text-xs rounded hover:bg-[#37373d] text-gray-300 flex items-center justify-center">[ ]</button>
                <button onClick={() => insertSymbol("  ")} className="h-8 w-12 text-xs font-medium rounded hover:bg-[#37373d] text-gray-300 flex items-center justify-center">Tab</button>
              </div>
              <div className="text-[10px] text-gray-500 pr-2 flex space-x-3">
                <span>字數: {charCount}</span>
                <span>單詞: {wordCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 safe-modal">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[#3c3c3c] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Key size={18} className="text-[#007acc]" />
                <span className="font-bold text-sm">設定中心</span>
              </div>
              {isTokenValid && (
                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-[#37373d] rounded text-gray-400">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">GitHub Gist Token</label>
                <input
                  type="password"
                  placeholder="github_pat_xxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] text-xs text-white rounded-lg p-2.5 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Gemini API Key</label>
                  <span className="text-[10px] text-gray-500">選填</span>
                </div>
                <input
                  type="password"
                  placeholder="AI 功能用，不使用可留空"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] focus:border-purple-500 text-xs text-white rounded-lg p-2.5 outline-none font-mono"
                />
              </div>

              <div className="bg-[#1e1e1e] p-3.5 rounded-lg border border-[#3c3c3c] space-y-2">
                <h4 className="text-xs font-semibold text-white">權杖與 API Key</h4>
                <p className="text-[11px] text-[#858585] leading-relaxed">
                  Token 和 Gemini Key 只存於此瀏覽器。GitHub token 需要 <strong className="text-white">gist</strong> 權限；Gemini Key 只有使用 AI 功能時才需要。
                </p>
                <div className="flex flex-col gap-1">
                  <a className="text-[11px] text-[#4ea1ff] underline" target="_blank" rel="noreferrer" href="https://github.com/settings/tokens/new?description=Gist%20Pocket%20Editor&scopes=gist">
                    開啟 GitHub Token 建立頁
                  </a>
                  <a className="text-[11px] text-purple-300 underline" target="_blank" rel="noreferrer" href="https://aistudio.google.com/app/apikey">
                    開啟 Google AI Studio API Key 頁
                  </a>
                </div>
              </div>

              <button
                onClick={handleInstallPwa}
                className="w-full bg-purple-900/45 hover:bg-purple-900 border border-purple-500/30 text-purple-200 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <Sparkles size={12} />
                <span>{isInstallable ? "安裝到桌面 / 主畫面" : "PWA：iPhone 可用 Safari 加入主畫面"}</span>
              </button>
            </div>

            <div className="p-4 bg-[#1e1e1f] border-t border-[#3c3c3c] flex space-x-2">
              {isTokenValid && (
                <button onClick={() => setShowSettings(false)} className="flex-1 bg-[#3c3c3c] hover:bg-[#4d4d4d] text-white py-2 rounded-lg text-xs font-semibold transition-all">
                  取消
                </button>
              )}
              <button
                onClick={() => validateAndFetchGists(token, geminiKey)}
                disabled={loading}
                className="flex-1 bg-[#007acc] hover:bg-[#0062a3] text-white py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
              >
                {loading && <RefreshCw className="animate-spin" size={12} />}
                <span>驗證並同步</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center px-4 safe-modal">
          <div className="bg-[#252526] border border-purple-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#3c3c3c] bg-[#2a2a30]/50 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-purple-300">
                <Sparkles size={18} className="animate-pulse" />
                <span className="font-bold text-sm">Gemini AI 協作助理</span>
              </div>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setSuggestedFilename("");
                  setAiResult("");
                }}
                className="p-1 hover:bg-[#37373d] rounded text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={aiLoading}
                  onClick={handleAiSuggestFilename}
                  className="flex items-center justify-center space-x-1.5 bg-[#37373d] hover:bg-purple-900/30 text-purple-200 border border-purple-500/20 py-2.5 px-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                >
                  <Wand2 size={13} />
                  <span>檔名建議</span>
                </button>
                <button
                  disabled={aiLoading}
                  onClick={handleAiPolishText}
                  className="flex items-center justify-center space-x-1.5 bg-[#37373d] hover:bg-[#4d4d4d] text-gray-200 py-2.5 px-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                >
                  <FileEdit size={13} className="text-[#007acc]" />
                  <span>文件精煉</span>
                </button>
              </div>

              <button
                disabled={aiLoading}
                onClick={handleAiContinueWriting}
                className="w-full flex items-center justify-center space-x-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Sparkles size={13} />
                <span>接續文章寫作</span>
              </button>

              {suggestedFilename && (
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="text-[11px] text-purple-300 font-semibold">推薦分群檔名</div>
                  <div className="font-mono text-xs text-white bg-black/40 p-2.5 rounded border border-[#3c3c3c] break-all">
                    {suggestedFilename}
                  </div>
                  <button
                    disabled={saving}
                    onClick={handleApplyNewFilename}
                    className="w-full bg-[#2ea44f] hover:bg-[#2c974b] text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={12} /> : <Check size={12} />}
                    <span>套用重新命名與分群</span>
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">自訂 AI 指令</label>
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    placeholder="例如：翻譯成英文、整理成條列..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] focus:border-purple-500 text-xs text-white rounded-lg px-3 py-2.5 outline-none transition-all"
                  />
                  <button
                    disabled={aiLoading || !aiPrompt.trim()}
                    onClick={handleAiCustomPrompt}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white p-2.5 rounded-lg flex items-center justify-center transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <RefreshCw className="animate-spin text-purple-400" size={24} />
                  <span className="text-xs text-purple-200">Gemini 正在運算中...</span>
                </div>
              )}

              {aiResult && !aiLoading && (
                <div className="bg-[#1a1a1f] border border-[#3c3c3c] rounded-xl p-3.5 space-y-3">
                  <span className="text-[11px] text-purple-300 font-semibold block">AI 結果</span>
                  <div className="max-h-44 overflow-y-auto bg-black/30 p-2.5 rounded font-mono text-xs text-gray-300 border border-[#2d2d2d] custom-scrollbar select-text whitespace-pre-wrap">
                    {aiResult}
                  </div>
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleApplyAiResult("replace")}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      覆蓋原文
                    </button>
                    <button
                      onClick={() => handleApplyAiResult("append")}
                      className="flex-1 bg-[#3c3c3c] hover:bg-[#4d4d4d] text-white py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      插入尾端
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewGistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 safe-modal">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[#3c3c3c] flex items-center justify-between">
              <span className="font-bold text-sm text-white">建立新的 GitHub Gist</span>
              <button onClick={() => setShowNewGistModal(false)} className="p-1 hover:bg-[#37373d] rounded text-gray-400">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Gist 名稱</label>
                <input
                  type="text"
                  placeholder="例如：winnygist.labs.aaaa.md"
                  value={newGistName}
                  onChange={(e) => setNewGistName(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] text-xs text-white rounded-lg p-2.5 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">初始內容</label>
                <textarea
                  value={newGistContent}
                  onChange={(e) => setNewGistContent(e.target.value)}
                  className="w-full h-32 bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] text-xs text-white rounded-lg p-2.5 outline-none font-mono resize-none"
                />
              </div>

              <label className="flex items-center justify-between py-2 px-1">
                <span>
                  <span className="block text-xs text-gray-300 font-medium">公開此 Gist</span>
                  <span className="block text-[10px] text-gray-500">不勾選則建立為 hidden Gist</span>
                </span>
                <input
                  type="checkbox"
                  checked={newGistPublic}
                  onChange={(e) => setNewGistPublic(e.target.checked)}
                  className="w-4 h-4 accent-[#007acc]"
                />
              </label>
            </div>

            <div className="p-4 bg-[#1e1e1f] border-t border-[#3c3c3c] flex space-x-2">
              <button onClick={() => setShowNewGistModal(false)} className="flex-1 bg-[#3c3c3c] hover:bg-[#4d4d4d] text-white py-2 rounded-lg text-xs font-semibold transition-all">
                取消
              </button>
              <button
                onClick={handleCreateGist}
                disabled={saving}
                className="flex-1 bg-[#2ea44f] hover:bg-[#2c974b] text-white py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
              >
                {saving && <RefreshCw className="animate-spin" size={12} />}
                <span>建立檔案</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed safe-toast left-1/2 -translate-x-1/2 z-50 bg-[#252526] border border-[#3c3c3c] rounded-full px-4 py-2 flex items-center space-x-2 shadow-2xl">
          <span className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-[#2ea44f]" : "bg-[#f85149]"}`} />
          <span className="text-xs font-medium text-white">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
