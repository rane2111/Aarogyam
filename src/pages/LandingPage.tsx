import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Stethoscope, Pill, Activity, Shield, Globe } from "lucide-react";

const features = [
  { icon: Activity, title: "AI Symptom Checker", desc: "Get instant health insights powered by AI" },
  { icon: Stethoscope, title: "Video Consultations", desc: "Connect with doctors via HD video calls" },
  { icon: Pill, title: "Medicine Finder", desc: "Check medicine availability at nearby pharmacies" },
  { icon: Shield, title: "Secure & Private", desc: "Your health data is encrypted and protected" },
  { icon: Globe, title: "Multilingual", desc: "Available in English, Hindi, and Marathi" },
  { icon: Heart, title: "Smart Scheduling", desc: "Book appointments that fit your schedule" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-display text-foreground">Aarogyam</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>Login</Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Heart className="h-4 w-4" />
            Your Health, Our Priority
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight font-display">
            Healthcare Made
            <span className="text-primary"> Simple</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Aarogyam connects patients, doctors, and pharmacies on one platform.
            Check symptoms with AI, consult doctors via video, and find medicines — all in your language.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-8">
              Start Now — It's Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-base px-8">
              I'm a Doctor
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-foreground mb-12 font-display">
          Everything you need for better health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
              <f.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Aarogyam</span>
          </div>
          <p>© 2026 Aarogyam. Built with care for better healthcare access.</p>
        </div>
      </footer>
    </div>
  );
}
