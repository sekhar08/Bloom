import Link from 'next/link';
import { listVideos } from '@/app/actions';
import { ArrowLeft, Clock3 } from 'lucide-react';
import VideoThumbnail from '@/components/VideoThumbnail';
import { signOut } from '@/auth';
import { requireSession } from '@/lib/session';
import SignOutButton from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await requireSession();
  const videos = await listVideos();

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Recordings</h1>
            <p className="mt-2 text-sm text-slate-500">{session.user.email ?? session.user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Recorder
            </Link>
            <SignOutButton
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/signin' });
              }}
            />
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg mb-4">No recordings yet.</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Create your first recording →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
            <div key={video.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition group">
              <Link href={`/recordings/${video.id}`} className="block relative aspect-video bg-black">
                {video.status === 'ready' && video.playbackId ? (
                  <VideoThumbnail playbackId={video.playbackId} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                    <Clock3 className="h-5 w-5" />
                    {video.status === 'failed' ? 'Processing failed' : 'Processing...'}
                  </div>
                )}
              </Link>
              
              <div className="p-4">
                <h2 className="font-medium text-white">{video.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{new Date(video.createdAt).toLocaleString()}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {video.status} · transcript {video.transcriptStatus}
                </p>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </main>
  );
}
