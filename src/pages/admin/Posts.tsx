import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      
      const dbPromise = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) => 
        setTimeout(() => resolve({ data: null, error: new Error('TIMEOUT') }), 8000)
      );

      const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as { data: any, error: any };

      let loadedData = [];
      if (error) {
         if (error.message === 'TIMEOUT') {
            console.warn("Supabase request timed out. Loading local data.");
         } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.warn("Table posts does not exist. Please run the SQL schema.");
         } else {
            console.error("Supabase error:", error);
         }
      } else if (data) {
         loadedData = data;
      }

      try {
         const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
         // Filter out loadedData that are already in localPosts (overrides)
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const openNewForm = () => {
     setEditingPostId(null);
     setFormData({ title: '', slug: '', excerpt: '', content: '', image_url: '' });
     setImageFile(null);
     setShowForm(true);
  };

  const openEditForm = (post: any) => {
     setEditingPostId(post.id);
     setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        image_url: post.image_url || ''
     });
     setImageFile(null);
     setShowForm(true);
  };

  const handleCreateOrUpdatePost = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    let finalImageUrl = formData.image_url;

    try {
      if (imageFile) {
        try {
           const fileExt = imageFile.name.split('.').pop();
           const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
           const filePath = `${fileName}`;

           const timeoutPromise = new Promise<{ error: any, data: any }>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000));
           const uploadPromise = supabase.storage
             .from('blog-images')
             .upload(filePath, imageFile);
           
           const uploadResult: any = await Promise.race([uploadPromise, timeoutPromise]);
           const uploadError = uploadResult?.error;

           if (uploadError) {
             console.warn('Image upload via Supabase failed:', uploadError);
             throw uploadError; // Trigger fallback
           } else {
              const { data: { publicUrl } } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

              finalImageUrl = publicUrl;
           }
        } catch (e) {
           console.warn("Storage exception, compressing and falling back to base64", e);
           finalImageUrl = await new Promise<string>((resolve) => {
               const reader = new FileReader();
               reader.onloadend = () => {
                   const img = new Image();
                   img.onload = () => {
                       const canvas = document.createElement('canvas');
                       const MAX_WIDTH = 800;
                       let scaleSize = 1;
                       if (img.width > MAX_WIDTH) {
                           scaleSize = MAX_WIDTH / img.width;
                       }
                       canvas.width = img.width * scaleSize;
                       canvas.height = img.height * scaleSize;
                       const ctx = canvas.getContext('2d');
                       ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                       resolve(canvas.toDataURL('image/jpeg', 0.6));
                   };
                   img.onerror = () => {
                       // Failed to load, just use uncompressed if possible, or skip
                       resolve(reader.result as string || '');
                   };
                   img.src = reader.result as string;
               };
               reader.onerror = () => resolve('');
               reader.readAsDataURL(imageFile);
           });
        }
      }

      const postData = { ...formData, image_url: finalImageUrl };
      
      let isLocal = editingPostId && String(editingPostId).startsWith('local_');
      let isSaved = false;

      if (editingPostId && !isLocal) {
         try {
            const timeoutPromise = new Promise<{error: any}>((_, reject) => setTimeout(() => reject(new Error("Network timeout")), 8000));
            const dbPromise = supabase.from('posts').update(postData).eq('id', editingPostId);
            const { error: dbError } = await Promise.race([dbPromise, timeoutPromise]) as {error: any};
            if (dbError) throw dbError;
            toast.success('Post updated successfully!');
         } catch (dbErr: any) {
            console.warn("Database error, falling back to local storage", dbErr);
            const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
            const index = localPosts.findIndex((p: any) => p.id === editingPostId);
            if (index !== -1) {
                localPosts[index] = { ...localPosts[index], ...postData };
            } else {
                // The post wasn't local yet, we must push it as an override to local storage
                localPosts.unshift({ id: editingPostId, ...postData });
            }
            try {
               localStorage.setItem('local_posts', JSON.stringify(localPosts));
               toast.success('Post updated locally (Supabase write failed)');
            } catch(e) {
               toast.error('Post too large to save locally. Please check your database settings.');
            }
         }
      } else if (!editingPostId) {
         try {
            const timeoutPromise = new Promise<{error: any}>((_, reject) => setTimeout(() => reject(new Error("Network timeout")), 8000));
            const dbPromise = supabase.from('posts').insert([postData]);
            const { error: dbError } = await Promise.race([dbPromise, timeoutPromise]) as {error: any};
            if (dbError) throw dbError;
            toast.success('Post created successfully!');
         } catch (dbErr: any) {
            console.warn("Database error, falling back to local storage", dbErr);
            const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
            const newPost = { id: 'local_' + Date.now(), ...postData, created_at: new Date().toISOString() };
            localPosts.unshift(newPost);
            try {
               localStorage.setItem('local_posts', JSON.stringify(localPosts));
               toast.success('Post created locally (Supabase write failed)');
            } catch(e) {
               toast.error('Post too large to save locally. Try a smaller image.');
            }
         }
      } else if (isLocal) {
         const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
         const index = localPosts.findIndex((p: any) => p.id === editingPostId);
         if (index !== -1) localPosts[index] = { ...localPosts[index], ...postData };
         try {
            localStorage.setItem('local_posts', JSON.stringify(localPosts));
            toast.success('Post updated locally!');
         } catch(e) {
            toast.error('Post too large to save locally. Please check your system limits.');
         }
      }

      setFormData({ title: '', slug: '', excerpt: '', content: '', image_url: '' });
      setImageFile(null);
      setEditingPostId(null);
      
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setShowForm(false);
      fetchPosts();
    } catch (error: any) {
      console.error('Submission Error:', error);
      toast.error(error.message || 'Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      if (String(id).startsWith('local_')) {
          let localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
          localPosts = localPosts.filter((p: any) => p.id !== id);
          localStorage.setItem('local_posts', JSON.stringify(localPosts));
          toast.success('Local post deleted successfully!');
      } else {
          try {
             const timeoutPromise = new Promise<{error: any}>((_, reject) => setTimeout(() => reject(new Error("Network timeout")), 8000));
             const dbPromise = supabase.from('posts').delete().eq('id', id);
             const { error } = await Promise.race([dbPromise, timeoutPromise]) as {error: any};
             if (error) throw error;
             toast.success('Post deleted successfully!');
          } catch(e) {
             toast.error('Failed to delete post from remote database.');
             console.error(e);
             return;
          }
      }
      fetchPosts();
    } catch (error: any) {
      toast.error('Failed to delete post.');
      console.error(error);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Blog & News CMS</h1>
          <p className="text-muted-foreground">Manage school news, articles, and announcements.</p>
        </div>
        <Button onClick={() => showForm ? setShowForm(false) : openNewForm()} className="bg-brand-pink hover:bg-brand-pink/90 text-white">
          {showForm ? 'Cancel' : 'Create New Post'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-xl font-bold mb-4">{editingPostId ? 'Edit Post' : 'New Post'}</h2>
          <form onSubmit={handleCreateOrUpdatePost} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input required id="title" name="title" value={formData.title} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input required id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. new-admission-2026" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Blog Image {editingPostId && '(Leave empty to keep current)'}</Label>
              <Input type="file" id="image" accept="image/*" onChange={handleFileChange} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
              {formData.image_url && <p className="text-xs text-brand-green truncate">Current: {formData.image_url}</p>}
              <p className="text-xs text-muted-foreground">Upload an image for the blog post.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt / Short Description</Label>
              <Textarea required id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea required id="content" name="content" value={formData.content} onChange={handleChange} rows={6} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-pink text-white hover:bg-brand-pink/90 font-semibold">
              {isSubmitting ? (editingPostId ? 'Updating...' : 'Publishing...') : (editingPostId ? 'Update Post' : 'Publish Post')}
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Loading posts...</TableCell></TableRow>
            ) : posts.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No posts found.</TableCell></TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.slug}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                     <Button size="sm" variant="outline" onClick={() => openEditForm(post)} className="text-brand-green border-brand-green/30 hover:bg-brand-green hover:text-white">Edit</Button>
                     <Button size="sm" variant="outline" onClick={() => handleDelete(post.id)} className="text-brand-pink border-brand-pink/30 hover:bg-brand-pink hover:text-white">Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
