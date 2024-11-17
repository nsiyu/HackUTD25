import { HydrateAlert } from './HydrateAlert';
import { useState } from 'react';

interface Post {
  id: string;
  wellId: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export function Feed() {
  const [posts] = useState<Post[]>([
    {
      id: '1',
      wellId: 'W123',
      timestamp: new Date().toISOString(),
      severity: 'high',
      message: 'Hydrate formation detected in well W123',
      comments: []
    },
    {
      id: '2',
      wellId: 'W456',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'medium',
      message: 'Potential hydrate risk in well W456',
      comments: []
    }
  ]);

  return (
    <div className="min-h-screen bg-[#FAF9F8] font-ubuntu">
      {/* iOS Safe Area Top Padding */}
      <div className="h-14 bg-off-red" />
      
      {/* Header */}
      <header className="bg-off-red py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-medium text-white">EOG Hydrate Monitor</h1>
        <button className="text-white hover:text-gray-200">
          Profile
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="space-y-4">
              <HydrateAlert
                wellId={post.wellId}
                timestamp={new Date(post.timestamp).toLocaleString()}
                severity={post.severity}
              />
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-700">{post.message}</p>
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}