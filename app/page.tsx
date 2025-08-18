import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Users, Mic, Sparkles, Code, Camera, Share2 } from "lucide-react"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-serif font-black text-foreground">MAI Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif font-black text-foreground mb-6">AI-Powered Collaboration Platform</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your workflow with smart meetings, AI voice interactions, collaborative coding, and social sharing
            - all in one comprehensive platform.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/sign-up">Start Your Journey</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-card rounded-lg p-6 text-center border">
            <Video className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Smart Meetings</h3>
            <p className="text-muted-foreground text-sm">
              Intelligent scheduling, participant tracking, and AI-powered meeting insights with media sharing.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 text-center border">
            <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Voice AI</h3>
            <p className="text-muted-foreground text-sm">
              Natural voice interactions with AI for seamless communication and assistance during meetings.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 text-center border">
            <Code className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Code Collaboration</h3>
            <p className="text-muted-foreground text-sm">
              Real-time code editing, project sharing, file uploads, and collaborative development tools.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 text-center border">
            <Share2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Social Sharing</h3>
            <p className="text-muted-foreground text-sm">
              Create reels, share content with photos and videos, and build your professional network.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-serif font-bold text-foreground">Everything You Need</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Team Collaboration</h4>
                  <p className="text-muted-foreground text-sm">
                    Work together seamlessly across all features with real-time sharing
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Camera className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Media Integration</h4>
                  <p className="text-muted-foreground text-sm">
                    Photos, videos, camera capture, emoticons, GIFs, and rich media support
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">AI-Powered</h4>
                  <p className="text-muted-foreground text-sm">
                    Intelligent voice assistance and smart features throughout your workflow
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h4 className="text-xl font-serif font-semibold text-foreground mb-2">Ready to Transform?</h4>
              <p className="text-muted-foreground">Join the future of multimedia collaboration</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card rounded-lg p-8 border">
          <h3 className="text-3xl font-serif font-bold text-card-foreground mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of teams already using MAI Platform to enhance their meetings, collaborate on code, share
            media content, and build their professional networks with AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
