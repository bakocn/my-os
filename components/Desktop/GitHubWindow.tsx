"use client";

import React, { useEffect, useState } from "react";
import PdfViewer from "./MyComputer/PdfViewer";
import { Repo,FileItem } from "@/utils/types";





type GitHubWindowProps = {
  username: string;
  openWindow: (config: any) => void; 
  openFileInNotepad: (name: string, content: string) => void; 
};

export default function GitHubWindow({
  username,
  openWindow,
  openFileInNotepad,
}: GitHubWindowProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentRepo, setCurrentRepo] = useState<Repo | null>(null);
  const [path, setPath] = useState<string>(""); 
  const [files, setFiles] = useState<FileItem[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(false);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${username}/repos`);
        const data: Repo[] = await res.json();
        setRepos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [username]);

  const fetchRepoContents = async (repoName: string, path = "") => {
    setFetchingFiles(true);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${path}`
      );
      const data: FileItem[] = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
      setFiles([]);
    } finally {
      setFetchingFiles(false);
    }
  };

  const handleOpenFile = (file: FileItem) => {
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (fileExt === "pdf") {
      const url = file.download_url || file.html_url;
      if (!url) return; 

      openWindow({
        id: `${currentRepo?.name}-${file.path}`,
        title: file.name,
        icon: "/icons/pdf.png",
        render: () => (
          <PdfViewer
            fileUrl={url}
            width={window.innerWidth * 0.7}
            height={window.innerHeight * 0.8}
          />
        ),
        initialSize: { width: window.innerWidth * 0.7, height: window.innerHeight * 0.8 },
        initialPosition: { x: window.innerWidth * 0.15, y: window.innerHeight * 0.1 },
      });
    } else {
     
      const url = file.download_url;
      if (!url) return;

      fetch(url)
        .then((res) => res.text())
        .then((text) => {
          openFileInNotepad(file.name, text);
        })
        .catch(() => {
          openFileInNotepad(file.name, "⚠️ Failed to load file.");
        });
    }
  };

  if (loading) return <div className="p-4">Loading repositories...</div>;

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] ">
        <h1 className="p-2 font-bold bg-gray-200 border-b">My Repositories</h1>
      {currentRepo ? (
        <>
          <div className="  p-2 border-b flex items-center ">
            <button
              onClick={() => {
                const segments = path.split("/").filter(Boolean);
                segments.pop();
                const newPath = segments.join("/");
                setPath(newPath);
                fetchRepoContents(currentRepo.name, newPath);
              }}
              disabled={path === ""}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Back
            </button>
            <span className=" px-3 font-semibold text-white">
              {currentRepo.name}/{path}
            </span>
          </div>
          {fetchingFiles ? (
            <div className="p-2">Loading files...</div>
          ) : (
            <div className="flex-1 overflow-auto p-2 grid grid-cols-4">
              {files.map((file) => (
                <div
                  key={file.path}
                  className=" w-30 h-fit p-1 border bg-gray-200 rounded hover:bg-gray-100 cursor-pointer flex flex-col items-center"
                  onDoubleClick={() => {
                    if (file.type === "dir") {

                      if(file.path){
                      setPath(file.path);
                      fetchRepoContents(currentRepo.name, file.path);}
                    } else {
                      handleOpenFile(file);
                    }
                  }}
                >
                  <div className="text-2xl">{file.type === "dir" ? "📁" : "📄"}</div>
                  <span className="text-sm text-center break-words">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 overflow-auto px-10 p-5 py-3 gap-5 grid grid-cols-3 ">
          {repos.map((repo) => (
            <div 
              key={repo.id}
              className="p-2 border rounded hover:bg-gray-100 cursor-pointer flex flex-col items-center bg-gray-200"
              onDoubleClick={() => {
                setCurrentRepo(repo);
                setPath("");
                fetchRepoContents(repo.name);
              }}
            >
              <div className="text-4xl">📦</div>
              <span className="font-semibold text-center">{repo.name}</span>
              {repo.description && (
                <span className="text-xs text-center">{repo.description}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
