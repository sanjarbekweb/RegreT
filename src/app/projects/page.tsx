'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Developer Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Project Studio & Repos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Link GitHub repositories, Vercel deployments, screenshots, and coding activity logs.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2.5 px-5 self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Grid: Project Cards (Bento style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((proj) => {
          const isSelected = selectedProj?.id === proj.id;
          return (
            <motion.div
              key={proj.id}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`bento-card p-6 space-y-4 cursor-pointer transition-all bg-white dark:bg-[#131A29] ${
                isSelected
                  ? 'ring-2 ring-lime shadow-md border-lime/40'
                  : 'hover:border-slate-300 dark:hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 uppercase">
                      {proj.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Updated {proj.updatedAt.split('T')[0]}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-2">
                    {proj.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-2xl bg-lime/20 flex items-center justify-center">
                    <FolderGit2 className="w-4 h-4 text-slate-950 dark:text-lime" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-sans">
                {proj.description}
              </p>

              {/* Screenshots preview */}
              {proj.screenshots.length > 0 && (
                <div className="h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.screenshots[0]}
                    alt={proj.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Integrations & Tech */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {proj.githubRepo && (
                    <a
                      href={`https://github.com/${proj.githubRepo}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.06] px-3 py-1 rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                      <span>{proj.githubRepo}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  {proj.vercelUrl && (
                    <a
                      href={proj.vercelUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full text-iris hover:underline font-semibold"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Vercel Deploy</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Project Connected Coding Timeline */}
      {selectedProj && (
        <div className="bento-card p-6 md:p-7 space-y-5 bg-white dark:bg-[#131A29]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                Development Activity Logs: {selectedProj.name}
              </h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {projectActivities.length} coding sessions linked to this repository
              </div>
            </div>
            <Link
              href="/capture"
              className="btn-secondary text-xs py-2 px-4 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-iris" />
              <span>Log Coding Session</span>
            </Link>
          </div>

          <div className="space-y-3">
            {projectActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No coding logs associated with this project yet. Use Quick Capture to log terminal commands, commits, or screenshots.
              </div>
            ) : (
              projectActivities.map((act) => (
                <div
                  key={act.id}
                  className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-4 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display font-bold text-slate-900 dark:text-white">{act.title}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {act.startedAt.split('T')[0]} at {act.startedAt.split('T')[1]?.slice(0, 5)}
                      </div>
                    </div>
                    {act.githubCommit && (
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-lime text-slate-950 font-bold">
                        {act.githubCommit}
                      </span>
                    )}
                  </div>
                  {act.description && <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{act.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bento-card max-w-lg w-full p-6 space-y-4 bg-white dark:bg-[#131A29]"
            >
              <form onSubmit={handleCreateProject}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                    Create Project Hub
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3.5 pt-3">
                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. RegreT Personal Life OS"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Project architectural goals, problems solved, and scope..."
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        GitHub Repo
                      </label>
                      <input
                        type="text"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="user/repository"
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Vercel URL
                      </label>
                      <input
                        type="text"
                        value={vercelUrl}
                        onChange={(e) => setVercelUrl(e.target.value)}
                        placeholder="https://app.vercel.app"
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tech Stack (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Screenshot Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Close
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
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
