"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Cloud,
  Database,
  Server,
  ShieldCheck,
  MoveRight,
  Menu,
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react';

const NimbusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

const navLinks = [
  { href: '#products', label: 'Products' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#pricing', label: 'Pricing' },
];

const products = [
  {
    icon: <Cloud className="h-10 w-10 text-primary" />,
    title: 'Nimbus Compute',
    description: 'Scalable virtual servers with flexible configurations to power any workload.',
    price: '49',
  },
  {
    icon: <Database className="h-10 w-10 text-primary" />,
    title: 'Nimbus Storage',
    description: 'Reliable, high-performance object and block storage for your data-intensive applications.',
    price: '29',
  },
  {
    icon: <Server className="h-10 w-10 text-primary" />,
    title: 'Nimbus Kubernetes',
    description: 'Managed Kubernetes service to deploy, manage, and scale containerized applications.',
    price: '99',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Nimbus Security',
    description: 'Comprehensive security solutions to protect your infrastructure and data from threats.',
    price: '79',
  },
];

const testimonials = [
  {
    quote: "NimbusScale revolutionized our workflow. Their infrastructure is rock-solid, and the scalability is exactly what we needed to grow our business without any hiccups.",
    name: 'Sarah Johnson',
    title: 'CTO, Innovate Inc.',
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'woman portrait',
    logo: 'https://placehold.co/140x40.png',
    logoHint: 'logo abstract',
  },
  {
    quote: "The customer support is phenomenal. We migrated our entire platform to NimbusScale, and their team was with us every step of the way. Truly a partner, not just a provider.",
    name: 'Michael Chen',
    title: 'CEO, TechSolutions',
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'man portrait',
    logo: 'https://placehold.co/140x40.png',
    logoHint: 'logo geometric',
  },
  {
    quote: "Performance and reliability are critical for us. NimbusScale delivers on both fronts, with impressive uptime and speed that keeps our users happy.",
    name: 'Emily Rodriguez',
    title: 'Head of Engineering, StreamFlow',
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'woman professional',
    logo: 'https://placehold.co/140x40.png',
    logoHint: 'logo tech',
  },
];


export default function Home() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <a href="#" className="flex items-center gap-2 font-bold text-lg">
            <NimbusIcon className="h-6 w-6 text-primary" />
            <span className="font-headline">NimbusScale</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
             <Button asChild className="hidden md:flex bg-accent text-accent-foreground hover:bg-accent/90">
              <a href="#cta">Request a Consultation</a>
            </Button>
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="border-b p-4">
                    <a href="#" className="flex items-center gap-2 font-bold text-lg" onClick={() => setMenuOpen(false)}>
                      <NimbusIcon className="h-6 w-6 text-primary" />
                      <span className="font-headline">NimbusScale</span>
                    </a>
                  </div>
                  <nav className="flex flex-col gap-4 p-4 text-lg">
                    {navLinks.map((link) => (
                      <a key={link.href} href={link.href} className="transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                        {link.label}
                      </a>
                    ))}
                  </nav>
                  <div className="mt-auto p-4 border-t">
                    <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      <a href="#cta" onClick={() => setMenuOpen(false)}>Request a Consultation</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="hero" className="py-20 md:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-primary">
              Cloud Solutions for a Scalable Future
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              Powering your business with robust, secure, and infinitely scalable cloud infrastructure. Experience the next generation of cloud services.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="#cta">Request a Consultation</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#products">Learn More <MoveRight className="ml-2 h-5 w-5" /></a>
              </Button>
            </div>
          </div>
        </section>

        <section id="products" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Our Cloud Products</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Transparent pricing and powerful features to help you build and scale.
              </p>
            </div>
            <div id="pricing" className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Card key={product.title} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="items-center text-center">
                    {product.icon}
                    <CardTitle className="font-headline mt-4">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-center">{product.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    <div className="text-center">
                      <span className="text-4xl font-bold">${product.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Trusted by Innovators</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                See what our customers are saying about their experience with NimbusScale.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="flex flex-col justify-between p-6 bg-secondary border-0 shadow-sm">
                  <CardContent className="p-0">
                    <blockquote className="text-lg italic">"{testimonial.quote}"</blockquote>
                  </CardContent>
                  <CardFooter className="p-0 mt-6 flex flex-col items-start gap-4">
                     <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.avatarHint} />
                          <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                        </div>
                      </div>
                      <Image src={testimonial.logo} alt="Company logo" width={120} height={40} data-ai-hint={testimonial.logoHint} className="opacity-60" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto max-w-4xl px-4 md:px-6 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Ready to Scale with Nimbus?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Let's discuss how NimbusScale can elevate your business. Get in touch with our cloud experts today for a free, no-obligation consultation.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                <a href="#">
                  Request a Free Consultation
                  <MoveRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <NimbusIcon className="h-6 w-6 text-primary" />
              <span className="font-headline font-bold">NimbusScale</span>
            </div>
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} NimbusScale. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}