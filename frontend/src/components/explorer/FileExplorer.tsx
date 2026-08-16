import { useState } from "react";
import { File, FilePlus, FolderPlus, Trash2, Edit2, ChevronRight, ChevronDown } from "lucide-react";
import { useFileStore, type FileNode } from "../../stores/fileStore";

export default function FileExplorer() {
  const { activeFileId, createFile, createFolder, deleteNode, renameNode, setActiveFile, getChildren } = useFileStore();
  
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ root: true });
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddFile = (parentId: string | null) => {
    const name = prompt("Enter file name (e.g., script.js):");
    if (name) {
      const ext = name.split('.').pop()?.toLowerCase();
      let lang = "python";
      if (ext === "js") lang = "javascript";
      if (ext === "ts") lang = "typescript";
      if (ext === "json") lang = "json";
      if (ext === "md") lang = "markdown";
      
      createFile(parentId, name, lang as any);
      if (parentId) setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const handleAddFolder = (parentId: string | null) => {
    const name = prompt("Enter folder name:");
    if (name) {
      createFolder(parentId, name);
      if (parentId) setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const startRename = (node: FileNode) => {
    setRenamingId(node.id);
    setRenameValue(node.name);
  };

  const submitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameNode(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const renderTree = (parentId: string | null, depth: number = 0) => {
    const children = getChildren(parentId).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });

    return children.map(node => (
      <div key={node.id}>
        <div 
          className={`file-item ${activeFileId === node.id ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 1 + 0.5}rem` }}
          onClick={() => node.type === "file" ? setActiveFile(node.id) : toggleFolder(node.id)}
        >
          <div className="file-item-left">
            {node.type === "folder" ? (
              expandedFolders[node.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : (
              <File size={14} className="file-icon" />
            )}
            
            {renamingId === node.id ? (
              <input 
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={submitRename}
                onKeyDown={e => e.key === 'Enter' && submitRename()}
                onClick={e => e.stopPropagation()}
                className="rename-input"
              />
            ) : (
              <span className="file-name">{node.name}</span>
            )}
          </div>

          <div className="file-actions" onClick={e => e.stopPropagation()}>
            <button title="Rename" onClick={() => startRename(node)}><Edit2 size={12} /></button>
            <button title="Delete" onClick={() => {
              if (confirm(`Delete ${node.name}?`)) deleteNode(node.id);
            }}><Trash2 size={12} /></button>
          </div>
        </div>
        
        {node.type === "folder" && expandedFolders[node.id] && (
          <div className="folder-children">
            {renderTree(node.id, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3>EXPLORER</h3>
        <div className="explorer-actions">
          <button title="New File in Root" onClick={() => handleAddFile(null)}><FilePlus size={16} /></button>
          <button title="New Folder in Root" onClick={() => handleAddFolder(null)}><FolderPlus size={16} /></button>
        </div>
      </div>
      <div className="explorer-tree">
        {renderTree(null)}
      </div>
    </div>
  );
}
