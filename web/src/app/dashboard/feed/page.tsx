"use client";
import { useEffect, useState } from "react";

type Post = { id: string; content: string; ts: number };

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("qwl_feed");
    if (saved) setPosts(JSON.parse(saved));
  }, []);
  function addPost(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const next = [{ id: crypto.randomUUID(), content: text.trim(), ts: Date.now() }, ...posts];
    setPosts(next);
    localStorage.setItem("qwl_feed", JSON.stringify(next));
    setText("");
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold">Feed</h1>
      <p className="text-sm text-[var(--muted)] mt-1">Public posts from the field.</p>
      <form onSubmit={addPost} className="mt-6 rounded-xl p-4 border border-white/10 bg-white/5">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share a signal, an insight, or a question..." className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] min-h-24" />
        <div className="mt-2 text-right">
          <button className="qwl-glow qwl-ring rounded-lg px-4 py-2 text-sm font-medium">Post</button>
        </div>
      </form>
      <div className="mt-4 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl p-4 border border-white/10 bg-white/5">
            <div className="text-xs text-[var(--muted)]">{new Date(p.ts).toLocaleString()}</div>
            <div className="mt-1 whitespace-pre-wrap leading-relaxed">{p.content}</div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="rounded-xl p-4 border border-white/10 bg-white/5 text-sm text-[var(--muted)]">No posts yet.</div>
        )}
      </div>
    </div>
  );
}

