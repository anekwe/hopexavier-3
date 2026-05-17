export default function About() {
  return (
    <div className="py-20 relative bg-transparent">
      <div className="container px-4 lg:px-8 mx-auto max-w-4xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-brand-green">About hopexavier first academy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-xl leading-relaxed mb-10">
            hopexavier first academy is a premier co-educational secondary school located in the heart of Abuja, Nigeria. 
            We are dedicated to providing a world-class educational experience that nurtures the intellectual, emotional, and social growth of every student.
          </p>

          <div className="grid md:grid-cols-2 gap-12 my-16">
            <div className="bg-brand-green/5 p-8 rounded-2xl border border-brand-green/20">
              <h2 className="text-2xl font-bold text-brand-green mb-4">Our Mission</h2>
              <p>To empower students with the knowledge, skills, and character necessary to excel in a rapidly changing world. We aim to cultivate critical thinking, creativity, and a deep sense of responsibility towards society.</p>
            </div>
            <div className="bg-brand-pink/5 p-8 rounded-2xl border border-brand-pink/20">
              <h2 className="text-2xl font-bold text-brand-green mb-4">Our Vision</h2>
              <p>To be the leading center of academic excellence and character development in Nigeria, recognized globally for producing innovative leaders and compassionate citizens.</p>
            </div>
          </div>

          <h3 className="text-3xl font-bold mt-12 mb-6 text-brand-green">Our Core Values</h3>
          <ul className="grid md:grid-cols-2 gap-4 mb-16 list-none p-0">
            <li className="flex items-center gap-3 bg-card p-4 shadow-sm border rounded-lg">
               <span className="h-2 w-2 rounded-full bg-brand-pink"></span>
               <span className="font-semibold text-brand-green">Excellence</span>: Striving for the highest standards in all endeavors.
            </li>
            <li className="flex items-center gap-3 bg-card p-4 shadow-sm border rounded-lg">
               <span className="h-2 w-2 rounded-full bg-brand-green"></span>
               <span className="font-semibold text-brand-green">Integrity</span>: Upholding honesty and strong moral principles.
            </li>
            <li className="flex items-center gap-3 bg-card p-4 shadow-sm border rounded-lg">
               <span className="h-2 w-2 rounded-full bg-brand-pink"></span>
               <span className="font-semibold text-brand-green">Discipline</span>: Fostering self-control and accountability.
            </li>
             <li className="flex items-center gap-3 bg-card p-4 shadow-sm border rounded-lg">
               <span className="h-2 w-2 rounded-full bg-brand-pink"></span>
               <span className="font-semibold text-brand-green">Resilience</span>: Adapting and thriving in the face of challenges.
            </li>
          </ul>

          <div className="mt-16 text-center border-t pt-16">
            <h3 className="text-3xl font-bold mb-6 text-brand-green">Proprietor's Message</h3>
            <div className="flex flex-col md:flex-row items-center gap-8 mx-auto max-w-3xl">
              <div className="flex flex-col items-center">
                <img 
                  src="https://i.ibb.co/fTTqgB9/ceo.png" 
                  alt="ceo" 
                  border="0" 
                  className="w-48 h-auto object-cover rounded-xl shadow-lg border-4 border-brand-green/20 mb-4" 
                />
                <div className="text-center font-bold text-brand-green">Engr. Francisexavier Nnaemeka Anekwe(B.Tech, Msc, PhD)</div>
                <div className="text-center font-bold text-brand-pink">CEO - Hopexavier Group</div>
              </div>
              <blockquote className="italic border-l-4 border-brand-pink pl-6 text-xl text-left text-muted-foreground flex-1">
                "Education is more than just imparting knowledge; it is about shaping character and inspiring young minds to reach their full potential. At hopexavier first academy, we are committed to providing a safe, stimulating, and supportive environment where every child can flourish."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
