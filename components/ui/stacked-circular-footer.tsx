import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Facebook, Instagram, Linkedin, Twitter, Brain } from "lucide-react"

function StackedCircularFooter() {
  return (
    <footer className="bg-[#0D1426] py-12 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Logo Circle */}
          <div className="mb-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 p-8">
            <Brain className="w-12 h-12 text-cyan-400" />
          </div>
          
          {/* Navigation */}
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            <a href="#" className="text-white/70 hover:text-cyan-400 transition-colors">Home</a>
            <a href="#for-educators" className="text-white/70 hover:text-cyan-400 transition-colors">For Educators</a>
            <a href="#for-learners" className="text-white/70 hover:text-cyan-400 transition-colors">For Learners</a>
            <a href="#features" className="text-white/70 hover:text-cyan-400 transition-colors">Features</a>
            <a href="#pricing" className="text-white/70 hover:text-cyan-400 transition-colors">Pricing</a>
          </nav>
          
          {/* Social Media */}
          <div className="mb-8 flex space-x-4">
            <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-transparent hover:bg-cyan-400/10 hover:border-cyan-400/50 text-white/70 hover:text-cyan-400">
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Facebook</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-transparent hover:bg-cyan-400/10 hover:border-cyan-400/50 text-white/70 hover:text-cyan-400">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-transparent hover:bg-cyan-400/10 hover:border-cyan-400/50 text-white/70 hover:text-cyan-400">
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-transparent hover:bg-cyan-400/10 hover:border-cyan-400/50 text-white/70 hover:text-cyan-400">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </div>
          
          {/* Newsletter */}
          <div className="mb-8 w-full max-w-md">
            <form className="flex space-x-2">
              <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input 
                  id="email" 
                  placeholder="Enter your email" 
                  type="email" 
                  className="rounded-full bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/50" 
                />
              </div>
              <Button type="submit" className="rounded-full bg-cyan-500 hover:bg-cyan-600 text-white">
                Subscribe
              </Button>
            </form>
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-white/50">
              © 2024 DigiGyan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }
