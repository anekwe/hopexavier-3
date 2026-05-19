import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Microscope, Monitor, Trophy } from "lucide-react";

export default function Services() {
  return (
    <div className="py-20 min-h-[calc(100vh-200px)] relative">
      <div className="container px-4 lg:px-8 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-green">Academic Programs & Services</h1>
          <p className="text-lg text-muted-foreground">Comprehensive education designed to develop well-rounded students prepared for global challenges.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
             <h2 className="text-[0.95rem] min-[380px]:text-[1.05rem] min-[420px]:text-xl md:text-2xl font-bold mb-6 flex items-center gap-2 md:gap-3 text-brand-green whitespace-nowrap md:whitespace-normal tracking-tight md:tracking-normal"><BookOpen className="text-brand-green h-5 w-5 md:h-6 md:w-6 shrink-0"/> Junior Secondary (JS1 - JS3)</h2>
             <p className="text-muted-foreground mb-6">Our Junior Secondary program provides a solid foundation across a wide range of subjects, helping students discover their interests and aptitudes. We focus on core competencies in Mathematics, English, Basic Sciences, and Social Studies.</p>
             <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
               <li>Pre-vocational studies</li>
               <li>Basic Science and Technology</li>
               <li>National Values Education</li>
               <li>Languages (English, French, Local Languages)</li>
             </ul>
          </div>
          <div>
            <h2 className="text-[0.95rem] min-[380px]:text-[1.05rem] min-[420px]:text-xl md:text-2xl font-bold mb-6 flex items-center gap-2 md:gap-3 text-brand-green whitespace-nowrap md:whitespace-normal tracking-tight md:tracking-normal"><Microscope className="text-brand-pink h-5 w-5 md:h-6 md:w-6 shrink-0"/> Senior Secondary (SS1 - SS3)</h2>
             <p className="text-muted-foreground mb-6">Students specialize in pathways that align with their career goals. We offer rigorous preparation for standard national and international examinations (WAEC, NECO, IGCSE).</p>
             <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
               <li><strong>STEM Pathway:</strong> Physics, Chemistry, Biology, Further Mathematics.</li>
               <li><strong>Arts/Humanities:</strong> Literature, Government, History, Economics.</li>
               <li><strong>Commercial:</strong> Accounting, Commerce, Economics.</li>
               <li>Intensive exam preparation and career counseling.</li>
             </ul>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-12 text-brand-green">Facilities & Extracurriculars</h2>
        <div className="grid md:grid-cols-3 gap-6">
           <Card className="border-none shadow-md">
              <CardHeader className="bg-white pb-2 pt-6">
                <Monitor className="h-8 w-8 text-brand-green mb-2" />
                <CardTitle className="text-brand-green">Modern ICT Labs</CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <p className="text-sm text-muted-foreground">State-of-the-art computer labs equipped with high-speed internet and modern software for coding and digital literacy.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader className="bg-white pb-2 pt-6">
                <Microscope className="h-8 w-8 text-brand-pink mb-2" />
                <CardTitle className="text-brand-green">Science Laboratories</CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <p className="text-sm text-muted-foreground">Fully equipped Physics, Chemistry, and Biology laboratories to facilitate practical learning and experimentation.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader className="bg-white pb-2 pt-6">
                <Trophy className="h-8 w-8 text-brand-pink mb-2" />
                <CardTitle className="text-brand-green">Sports & Club Activities</CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <p className="text-sm text-muted-foreground">A diverse range of extracurriculars including football, basketball, athletics, debate club, and robotics.</p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
