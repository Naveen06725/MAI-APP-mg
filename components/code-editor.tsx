//fix
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Plus, Save, Share, Play, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-slate-800 animate-pulse rounded" />,
})

interface CodeProject {
  id: string
  name: string
  description: string
  language: string
  code: string
  user_id: string
  is_public: boolean
  created_at: string
  updated_at: string
}

interface CodeEditorProps {
  user: any
  initialProjects: CodeProject[]
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
]

export function CodeEditor({ user, initialProjects }: CodeEditorProps) {
  const [projects, setProjects] = useState<CodeProject[]>(initialProjects)
  const [activeProject, setActiveProject] = useState<CodeProject | null>(
    initialProjects.length > 0 ? initialProjects[0] : null,
  )
  const [code, setCode] = useState(
    activeProject?.code || "// Welcome to MAI Code Editor\nconsole.log('Hello, World!');",
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    language: "javascript",
  })

  const editorRef = useRef<any>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (activeProject) {
      setCode(activeProject.code)
    }
  }, [activeProject])

  // Auto-save functionality
  useEffect(() => {
    if (activeProject && code !== activeProject.code) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProject()
      }, 2000) // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [code, activeProject])

  const createProject = async () => {
    try {
      const response = await fetch("/api/code/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProject,
          code: `// ${newProject.name}\n// Created on ${new Date().toLocaleDateString()}\n\nconsole.log('Hello from ${newProject.name}!');`,
        }),
      })

      if (!response.ok) throw new Error("Failed to create project")

      const project = await response.json()
      setProjects((prev) => [project, ...prev])
      setActiveProject(project)
      setIsCreateDialogOpen(false)
      setNewProject({ name: "", description: "", language: "javascript" })
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const saveProject = async () => {
    if (!activeProject) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/code/projects/${activeProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to save project")

      const updatedProject = await response.json()
      setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProject : p)))
      setActiveProject(updatedProject)
    } catch (error) {
      console.error("Error saving project:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const shareProject = async () => {
    if (!activeProject) return

    try {
      const response = await fetch(`/api/code/projects/${activeProject.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_public: true,
          collaborators,
        }),
      })

      if (!response.ok) throw new Error("Failed to share project")

      const updatedProject = await response.json()
      setActiveProject(updatedProject)
      setIsShareDialogOpen(false)
    } catch (error) {
      console.error("Error sharing project:", error)
    }
  }

  const runCode = () => {
    if (activeProject?.language === "javascript" || activeProject?.language === "typescript") {
      try {
        // Create a new iframe for a safe execution environment
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Get the iframe's window and document
        const iframeWindow = iframe.contentWindow;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

        if (iframeWindow && iframeDoc) {
            // Hijack console.log and console.error to post messages back
            iframeDoc.open();
            iframeDoc.write('<script>window.onerror = (msg, src, l) => parent.postMessage({ type: "error", message: msg }); console.log = (...args) => parent.postMessage({ type: "log", message: args.join(" ") }); console.error = (...args) => parent.postMessage({ type: "error", message: args.join(" ") });</script>');
            iframeDoc.write('<script>' + code + '</script>');
            iframeDoc.close();

            // Listen for messages from the iframe
            const handleMessage = (event: MessageEvent) => {
                if (event.source === iframeWindow) {
                    const { type, message } = event.data;
                    if (type === "log") {
                        console.log("[MAI Code Runner]", message);
                    } else if (type === "error") {
                        console.error("[MAI Code Runner] Error:", message);
                    }
                    window.removeEventListener('message', handleMessage);
                    iframe.remove();
                }
            };
            window.addEventListener('message', handleMessage);
        } else {
            console.error("[MAI Code Runner] Failed to create sandboxed environment.");
            iframe.remove();
        }

      } catch (error) {
        console.error("[MAI Code Runner] Execution Error:", error)
      }
    }
  }

  const downloadProject = () => {
    if (!activeProject) return

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeProject.name}.${getFileExtension(activeProject.language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (language: string) => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      html: "html",
      css: "css",
      json: "json",
      markdown: "md",
    }
    return extensions[language] || "txt"
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              MAI Code
            </h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={newProject.language}
                      onValueChange={(value) => setNewProject((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createProject} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Projects List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={cn(
                  "cursor-pointer transition-colors bg-slate-700 border-slate-600 hover:bg-slate-600",
                  activeProject?.id === project.id && "bg-emerald-900 border-emerald-600",
                )}
                onClick={() => setActiveProject(project)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate">{project.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {project.language}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 truncate">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    {project.is_public && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{activeProject?.name || "No Project Selected"}</h1>
              {isSaving && (
                <Badge variant="secondary" className="text-xs">
                  Saving...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveProject} size="sm" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={runCode} size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
              <Button onClick={downloadProject} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Share Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="collaborators">Collaborator Emails (comma-separated)</Label>
                      <Input
                        id="collaborators"
                        value={collaborators.join(", ")}
                        onChange={(e) => setCollaborators(e.target.value.split(",").map((email) => email.trim()))}
                        className="bg-slate-700 border-slate-600"
                        placeholder="user1@example.com, user2@example.com"
                      />
                    </div>
                    <Button onClick={shareProject} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Share Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <MonacoEditor
            height="100%"
            language={activeProject?.language || "javascript"}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderWhitespace: "selection",
              tabSize: 2,
              insertSpaces: true,
            }}
            onMount={(editor) => {
              editorRef.current = editor
            }}
          />
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800 border-t border-slate-700 px-4 py-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-4">
              <span>Language: {activeProject?.language || "None"}</span>
              <span>Lines: {code.split("\n").length}</span>
              <span>Characters: {code.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span>Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
