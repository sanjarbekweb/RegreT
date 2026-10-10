'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  ExternalLink,
  Plus,
  GitCommit,
  GitBranch,
  Terminal,
  Activity as ActivityIcon,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Project, Activity } from '../../lib/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Add project modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const loadData = useCallback(() => {
    const projs = storage.getProjects();
    setProjects(projs);
    setActivities(storage.getActivities());
    setSelectedProjectId((prev) => (prev && projs.some((p) => p.id === prev) ? prev : (projs.length > 0 ? projs[0].id : '')));
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, [loadData]);

  const handleDeleteProject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Permanently remove this project and its repository connections?')) {
      storage.deleteProject(id);
      loadData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      status: 'active',
      githubRepo: githubRepo.trim() || undefined,
      vercelUrl: vercelUrl.trim() || undefined,
      techStack: techStack
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      screenshots: screenshotUrl ? [screenshotUrl.trim()] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.addProject(newProj);
    loadData();
    setShowAddModal(false);
    setName('');
    setDescription('');
    setGithubRepo('');
    setVercelUrl('');
    setTechStack('');
    setScreenshotUrl('');
  };

  const selectedProj = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Activities related to selected project
  const projectActivities = activities.filter(
    (a) =>
      a.projectId === selectedProj?.id ||
      (selectedProj?.githubRepo && a.githubRepo?.includes(selectedProj.githubRepo))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Developer Workspace
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Project Studio & Repos
          </h1>
          <p className="text-xs text-muted mt-1">
            Link GitHub repositories, Vercel deployments, screenshots, and coding activity logs.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2 px-4 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Grid: Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => {
          const isSelected = selectedProj?.id === proj.id;
          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`bg-surface border rounded-lg p-5 space-y-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated border border-border uppercase font-semibold text-success">
                      {proj.status}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      Updated {proj.updatedAt.split('T')[0]}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground mt-1.5">{proj.name}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="p-1 rounded text-muted hover:text-danger hover:bg-elevated transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <FolderGit2 className="w-5 h-5 text-primary" />
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed line-clamp-2">{proj.description}</p>

              {/* Screenshots preview */}
              {proj.screenshots.length > 0 && (
                <div className="h-32 rounded overflow-hidden border border-border bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.screenshots[0]}
                    alt={proj.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Integrations & Tech */}
              <div className="space-y-2 pt-1 border-t border-border">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {proj.githubRepo && (
                    <a
                      href={`https://github.com/${proj.githubRepo}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-elevated px-2.5 py-1 rounded border border-border text-foreground hover:text-primary transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-muted" />
                      <span>{proj.githubRepo}</span>
                      <ExternalLink className="w-3 h-3 text-muted" />
                    </a>
                  )}
                  {proj.vercelUrl && (
                    <a
                      href={proj.vercelUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-elevated px-2.5 py-1 rounded border border-border text-primary hover:underline"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Vercel Deploy</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated text-muted border border-border/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Connected Coding Timeline */}
      {selectedProj && (
        <div className="bg-surface border border-border rounded-lg p-5 space-y-4 mt-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Development Activity Logs: {selectedProj.name}
              </h3>
              <div className="text-xs text-muted font-mono">
                {projectActivities.length} coding sessions linked to this repository
              </div>
            </div>
            <Link
              href="/capture"
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Log Coding Session</span>
            </Link>
          </div>

          <div className="space-y-3">
            {projectActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                No coding logs associated with this project yet. Use Quick Capture to log terminal commands, commits, or screenshots.
              </div>
            ) : (
              projectActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-elevated border border-border rounded p-4 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{act.title}</div>
                      <div className="text-[11px] font-mono text-muted mt-0.5">
                        {act.startedAt.split('T')[0]} at {act.startedAt.split('T')[1]?.slice(0, 5)}
                      </div>
                    </div>
                    {act.githubCommit && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-primary">
                        {act.githubCommit}
                      </span>
                    )}
                  </div>
                  {act.description && <p className="text-muted leading-relaxed">{act.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProject}
            className="bg-surface border border-border rounded-lg max-w-lg w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm text-foreground">Create Project Hub</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. RegreT Personal Life OS"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project architectural goals, problems solved, and scope..."
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">GitHub Repo</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="user/repository"
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">Vercel URL</label>
                  <input
                    type="text"
                    value={vercelUrl}
                    onChange={(e) => setVercelUrl(e.target.value)}
                    placeholder="https://app.vercel.app"
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Tech Stack (Comma separated)
                </label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Screenshot Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button type="submit" className="btn-primary text-xs">
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
