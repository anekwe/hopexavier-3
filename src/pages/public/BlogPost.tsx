import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { queryWithTimeout } from '@/lib/utils/supabase-timeout';
import { Calendar, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { data, error } = await queryWithTimeout(supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single());

        if (error || (data.status && data.status === 'Draft')) {
           throw error || new Error('Draft');
        }
        setPost(data);
      } catch (e: any) {
        console.error("Error fetching post:", e);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 flex justify-center p-12">
          <div className="animate-pulse text-lg">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 text-center p-12 text-muted-foreground bg-white rounded-xl">
          <p className="mb-4 text-xl">Post not found.</p>
          <Link to="/blog" className={buttonVariants({ variant: "outline" })}>
             <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-transparent min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-brand-green hover:text-brand-green/80 transition-colors mb-8 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
        </Link>
        
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {post.image_url && (
            <div className="h-64 md:h-96 w-full bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${post.image_url})` }}>
            </div>
          )}
          <div className="p-8 md:p-12">
            <div className="flex items-center text-sm text-brand-pink mb-4 font-medium">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(post.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold font-heading text-brand-green mb-6 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 font-medium mb-8 leading-relaxed border-l-4 border-brand-pink pl-4 py-1">
                {post.excerpt}
              </p>
            )}
            
            <div className="prose prose-lg max-w-none prose-p:text-gray-700 prose-headings:text-brand-green prose-a:text-brand-pink whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
