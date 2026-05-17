import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        if (!supabase) throw new Error("Supabase is not configured.");
        const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) => 
          setTimeout(() => reject(new Error("Network timeout: Supabase unreachable")), 10000)
        );
        const dbPromise = supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        const result: any = await Promise.race([dbPromise, timeoutPromise]);
        const { data, error } = result;

        if (error) {
           if (error.code === '42P01' || error.message?.includes('does not exist')) {
              console.warn("Table posts does not exist. Please run the SQL schema.");
              let localPosts = [];
              try { localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]'); } catch(e) {}
              setPosts(localPosts);
              return;
           }
           throw error;
        }
        let loadedData = data || [];
        try {
           const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
           const localIds = new Set(localPosts.map((p: any) => p.id));
           loadedData = loadedData.filter((p: any) => !localIds.has(p.id));
           loadedData = [...localPosts, ...loadedData];
        } catch(e) {}
        setPosts(loadedData);
      } catch (e: any) {
        console.error("Error fetching posts:", e);
        let localPosts = [];
        try {
           localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
        } catch(er) {}
        setPosts(localPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="py-20 bg-transparent min-h-screen">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl font-bold mb-4 font-heading text-brand-green">Blog & News</h1>
        <p className="text-lg text-muted-foreground mb-12">Latest updates and stories from hopexavier first academy.</p>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-pulse">Loading posts...</div></div>
        ) : posts.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground bg-white rounded-xl">No news articles found. Please check back later.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow border-none shadow-md overflow-hidden">
                <div className="h-48 bg-muted bg-cover bg-center" style={{ backgroundImage: post.image_url ? `url(${post.image_url})` : 'none' }}>
                  {!post.image_url && <div className="h-full w-full flex items-center justify-center text-muted-foreground">No Image</div>}
                </div>
                <CardHeader>
                  <div className="flex items-center text-sm text-brand-pink mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <CardTitle className="text-xl leading-tight text-brand-green">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col flex-grow justify-between">
                  <div>
                    {post.excerpt && <p className="text-brand-green font-medium mb-4">{post.excerpt}</p>}
                    <div className="text-muted-foreground whitespace-pre-wrap line-clamp-3 text-left">{post.content}</div>
                  </div>
                  <div className="mt-6 flex justify-start">
                    <Link to={`/blog/${post.id}`} className="inline-flex items-center px-5 py-2 bg-brand-pink/10 text-brand-pink hover:bg-brand-pink hover:text-white transition-all duration-300 rounded-full text-sm font-bold shadow-sm hover:shadow-md">
                      Read more...
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
