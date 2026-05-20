import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Trophy, Users, GraduationCap, ArrowRight, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [latestPosts, setLatestPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (!error && data) {
          setLatestPosts(data);
        }
      } catch (e) {
        console.error("Error fetching latest posts:", e);
      }
    };
    fetchLatestPosts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-brand-dark-green text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://i.ibb.co/h1n69Rtw/school-building-2.png')" }}></div>
        <div className="container relative py-32 px-4 lg:px-8 mx-auto z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 max-w-4xl leading-tight">
            Raising Future Leaders with <span className="text-brand-pink">Excellence</span> and Character
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10">
            A premium secondary education experience in Abuja, shaping the minds of tomorrow through academic rigor, discipline, and holistic development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link to="/apply" className={buttonVariants({ size: "lg", className: "bg-brand-pink text-brand-green hover:bg-brand-pink/60 hover:text-brand-green/60 transition-colors text-lg px-8 rounded-full h-14" })}>
              Apply Now
            </Link>
            <Link to="/contact" className={buttonVariants({ variant: "ghost", size: "lg", className: "bg-black/40 border-2 border-[#FF007F] text-white hover:bg-black/60 hover:text-[#FF007F] transition-colors duration-1000 ease-in-out text-lg px-8 rounded-full h-14" })}>
              Enquiries
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-transparent">
        <div className="container px-4 lg:px-8 mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-pink font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-green mt-2">Nurturing Excellence Everyday</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md overflow-hidden rounded-2xl">
              <CardHeader className="bg-brand-green/10 pb-4">
                <Trophy className="h-10 w-10 text-brand-green mb-2" />
                <CardTitle className="text-brand-green">Academic Excellence</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground">Rigorous curriculum designed to challenge students and foster a lifelong love for learning.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md overflow-hidden rounded-2xl">
              <CardHeader className="bg-brand-pink/10 pb-4">
                <Users className="h-10 w-10 text-brand-pink mb-2" />
                <CardTitle className="text-brand-green">Discipline & Character</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground">We focus on holistic development, instilling strong moral values and leadership skills.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md overflow-hidden rounded-2xl">
              <CardHeader className="bg-brand-pink/10 pb-4">
                <BookOpen className="h-10 w-10 text-brand-pink mb-2" />
                <CardTitle className="text-brand-green">Top-tier Facilities</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground">Modern classrooms, advanced science and ICT labs, and a well-stocked library to support education.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="py-20">
        <div className="container px-4 lg:px-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-green">Our Academic Programs</h2>
              <p className="text-muted-foreground text-lg">Comprehensive secondary education spanning Junior and Senior Secondary levels.</p>
            </div>
            <Link to="/services" className={buttonVariants({ variant: "link", className: "text-brand-pink p-0 h-auto mt-4 md:mt-0 text-base" })}>
              <span className="flex items-center gap-2">View all programs <ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative rounded-3xl overflow-hidden shadow-lg h-80 flex items-end">
              <div className="absolute inset-0 bg-[url('https://i.ibb.co/FkLdDdvt/school-prog-2.png')] bg-cover bg-center transition-transform duration-500 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-8 text-white w-full">
                <GraduationCap className="h-8 w-8 mb-3 text-brand-pink" />
                <h3 className="text-[0.95rem] min-[380px]:text-[1.05rem] min-[420px]:text-xl md:text-2xl font-bold mb-2 whitespace-nowrap md:whitespace-normal tracking-tight md:tracking-normal">Junior Secondary (JS1 - JS3)</h3>
                <p className="text-gray-200">Building a strong foundational knowledge base across sciences, arts, and technology.</p>
              </div>
            </div>
            <div className="group relative rounded-3xl overflow-hidden shadow-lg h-80 flex items-end">
              <div className="absolute inset-0 bg-[url('https://i.ibb.co/1JfmnZwF/school-prog-1.png')] bg-cover bg-center transition-transform duration-500 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-8 text-white w-full">
                <BookOpen className="h-8 w-8 mb-3 text-brand-pink" />
                <h3 className="text-[0.95rem] min-[380px]:text-[1.05rem] min-[420px]:text-xl md:text-2xl font-bold mb-2 whitespace-nowrap md:whitespace-normal tracking-tight md:tracking-normal">Senior Secondary (SS1 - SS3)</h3>
                <p className="text-gray-200">Specialized pathways in STEM and Arts/Humanities preparing students for higher education.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Announcements */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-pink-50/50">
          <div className="container px-4 lg:px-8 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div className="max-w-2xl">
                <span className="text-brand-pink font-semibold tracking-wider uppercase text-sm">Updates</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 mt-2 text-brand-green">Latest News & Announcements</h2>
                <p className="text-muted-foreground text-lg">Stay informed with important messages and updates from hopexavier first academy.</p>
              </div>
              <Link to="/blog" className={buttonVariants({ variant: "link", className: "text-brand-green p-0 h-auto mt-4 md:mt-0 text-base font-semibold" })}>
                <span className="flex items-center gap-2">View all news <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow border-none shadow-md overflow-hidden bg-white">
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-brand-green text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-dark-green rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-pink rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-20"></div>
        <div className="container relative z-10 px-4 mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Invest in Your Child's Future</h2>
          <p className="text-xl mb-10 text-white/90">Enrollment for the upcoming academic session is now open. Join the hopexavier first academy family today.</p>
          <Link to="/apply" className={buttonVariants({ size: "lg", className: "bg-brand-pink text-brand-green hover:bg-brand-pink/60 hover:text-brand-green/60 text-lg px-10 rounded-full h-14 shadow-xl shadow-black/10 transition-colors" })}>
            Start Application
          </Link>
        </div>
      </section>
    </div>
  );
}
