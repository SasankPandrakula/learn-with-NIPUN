import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, Brain, ArrowRight, Code, Database, Layers } from "lucide-react";

const courses = [
  { title: "C Programming", icon: Code, students: "2.4k", color: "from-blue-500 to-cyan-500" },
  { title: "Python", icon: Code, students: "5.1k", color: "from-yellow-500 to-orange-500" },
  { title: "Java", icon: Code, students: "3.8k", color: "from-red-500 to-pink-500" },
  { title: "DSA", icon: Database, students: "4.2k", color: "from-green-500 to-emerald-500" },
  { title: "Full Stack Dev", icon: Layers, students: "6.7k", color: "from-purple-500 to-indigo-500" },
];

const stats = [
  { label: "Active Students", value: "10K+", icon: Users },
  { label: "Courses", value: "25+", icon: BookOpen },
  { label: "Certificates", value: "5K+", icon: Award },
  { label: "AI Powered", value: "24/7", icon: Brain },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pb-20 pt-24 sm:pt-32 bg-subtle-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 -right-20 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/20 to-yellow-400/20 blur-[100px]" />
        <div className="absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-yellow-400/15 to-cyan-400/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-cyan-500/5 via-transparent to-yellow-500/5 rounded-full blur-[120px]" />

        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-yellow-400/30 blur-2xl rounded-full" />
                <img 
                  src="/icon-192.png" 
                  alt="Learn With Nipun Logo" 
                  className="relative h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-2xl shadow-2xl ring-4 ring-white/30 logo-glow mx-auto mb-4" 
                />
              </div>
            </div>
            <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-cyan-500/10 to-yellow-500/10 border border-cyan-200/30 px-4 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm">
              🚀 Elevate Your Coding Journey
            </span>
            <h1 className="mb-6 font-display leading-tight tracking-tight">
              <span className="block text-4xl font-semibold sm:text-5xl lg:text-6xl text-foreground">
                Master Modern Tech with
              </span>
              <span className="block text-5xl font-extrabold sm:text-6xl lg:text-7xl text-gradient">
                Learn With NIPUN
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Interactive courses, real-world projects, and AI-powered mentorship designed to turn beginners into industry-ready developers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="hero" size="lg" onClick={() => navigate("/login")} className="gap-2 px-10 h-14 text-base bg-gradient-primary hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="lg" onClick={() => navigate("/courses")} className="h-14 px-10 text-base border-2 border-cyan-200/50 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-300">
                Explore Courses
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-gradient-to-r from-white via-cyan-50/30 to-yellow-50/30 py-12">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center group">
              <div className="mx-auto mb-2 h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-yellow-500/10 flex items-center justify-center ring-1 ring-cyan-200/30 group-hover:ring-cyan-400/50 transition-all duration-300">
                <stat.icon className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="font-display text-2xl font-bold text-gradient bg-gradient-primary bg-clip-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-20 bg-gradient-to-b from-white to-cyan-50/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-gradient bg-gradient-primary bg-clip-text">Popular Courses</h2>
            <p className="text-muted-foreground text-lg">Structured curriculum designed by industry experts</p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <div
                key={course.title}
                className="group cursor-pointer glass-card rounded-2xl border border-white/50 bg-white/70 p-6 transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:scale-[1.02]"
                onClick={() => navigate("/login")}
              >
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${course.color} p-3 ring-2 ring-white/50 shadow-lg`}>
                  <course.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-display font-bold text-foreground text-lg">{course.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{course.students} students enrolled</p>
                <div className="mt-4 h-1 w-full bg-gradient-to-r from-cyan-200 to-yellow-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-yellow-500 rounded-full transition-all duration-500 group-hover:w-full w-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        {/* Background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-yellow-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-400/20 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/10 to-transparent rounded-full" />

        <div className="container mx-auto relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                <img 
                  src="/icon-192.png" 
                  alt="Learn With Nipun Logo" 
                  className="relative h-16 w-16 object-contain rounded-xl shadow-xl ring-2 ring-white/30" 
                />
              </div>
            </div>
            <h2 className="mb-4 font-display text-4xl font-bold sm:text-5xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mb-8 text-xl text-cyan-100 leading-relaxed">
              Join thousands of students who are already learning with us. Your future in tech starts here.
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => navigate("/login")} 
              className="bg-white text-primary hover:bg-yellow-50 font-bold px-12 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Start Learning Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-r from-cyan-50/50 to-yellow-50/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/icon-192.png" 
              alt="Learn With Nipun Logo" 
              className="h-8 w-8 object-contain rounded-lg" 
            />
            <span className="font-display font-bold text-gradient bg-gradient-primary bg-clip-text">Learn With Nipun</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 Learn With Nipun. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
