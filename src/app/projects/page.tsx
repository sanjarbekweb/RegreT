'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  ExternalLink,
  Plus,
  GitBranch,
  Terminal,
  Trash2,
  X,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Developer Workspace
          </div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
            Project Studio & Repos
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Link GitHub repositories, Vercel deployments, screenshots, and coding activity logs.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
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
              className={`workspace-panel p-5 space-y-3.5 cursor-pointer transition-colors bg-[#111827] border ${
                isSelected
                  ? 'border-[#388BFD] ring-1 ring-[#388BFD]/40'
                  : 'border-[#1E293B] hover:border-[#334155]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#238636] border border-[#238636]/30">
                      {proj.status}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      Updated {proj.updatedAt.split('T')[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-[#F0F6FC] mt-1.5">
                    {proj.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="p-1 rounded text-[#484F58] hover:text-[#F85149] transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-7 h-7 rounded-md bg-[#161F2E] border border-[#232E3E] text-[#388BFD] flex items-center justify-center">
                    <FolderGit2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#8B949E] leading-relaxed line-clamp-2">
                {proj.description}
              </p>

              {/* Screenshots preview */}
              {proj.screenshots.length > 0 && (
                <div className="h-32 rounded-md overflow-hidden border border-[#1E293B] bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.screenshots[0]}
                    alt={proj.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Integrations & Tech */}
              <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {proj.githubRepo && (
                    <a
                      href={`https://github.com/${proj.githubRepo}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-[#0D1117] border border-[#1E293B] px-2.5 py-1 rounded text-[#F0F6FC] hover:border-[#388BFD]/50 transition-colors"
                    >
                      <GitBranch className="w-3 h-3 text-[#388BFD]" />
                      <span>{proj.githubRepo}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#64748B]" />
                    </a>
                  )}
                  {proj.vercelUrl && (
                    <a
                      href={proj.vercelUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-[#0D1117] border border-[#1E293B] px-2.5 py-1 rounded text-[#388BFD] hover:underline"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Deployment</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[9px] font-mono px-2 py-0.2 rounded bg-[#0D1117] text-[#8B949E] border border-[#1E293B]"
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
        <div className="workspace-panel p-5 space-y-4 bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider">
                Development Activity Logs: {selectedProj.name}
              </h3>
              <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                {projectActivities.length} coding sessions linked to this repository
              </div>
            </div>
            <Link
              href="/capture"
              className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#388BFD]" />
              <span>Log Coding Session</span>
            </Link>
          </div>

          <div className="space-y-2">
            {projectActivities.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                No coding logs associated with this project yet. Use Quick Capture to record commits or work sessions.
              </div>
            ) : (
              projectActivities.map((act) => (
                <div
                  key={act.id}
                  className="rounded-md bg-[#0D1117] border border-[#1E293B] p-3 space-y-1.5 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-[#F0F6FC]">{act.title}</div>
                      <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                        {act.startedAt.split('T')[0]} at {act.startedAt.split('T')[1]?.slice(0, 5)}
                      </div>
                    </div>
                    {act.githubCommit && (
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#161F2E] text-[#388BFD] border border-[#232E3E]">
                        {act.githubCommit}
                      </span>
                    )}
                  </div>
                  {act.description && <p className="text-[#8B949E] leading-relaxed">{act.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="workspace-panel max-w-lg w-full p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
            >
              <form onSubmit={handleCreateProject}>
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider">
                    Create Project Hub
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[#64748B] hover:text-[#F0F6FC]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. RegreT Personal Life OS"
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Project goals, scope, and architecture..."
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md p-2.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        GitHub Repo
                      </label>
                      <input
                        type="text"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="user/repository"
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        Vercel URL
                      </label>
                      <input
                        type="text"
                        value={vercelUrl}
                        onChange={(e) => setVercelUrl(e.target.value)}
                        placeholder="https://app.vercel.app"
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Tech Stack (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Screenshot Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Close
                  </button>
                  <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
