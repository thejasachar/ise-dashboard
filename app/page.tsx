"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Brain, Users, HeadsetIcon as VrHeadset } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

type Stats = {
  totalUsers: number
  sessionsCompleted: number
  activeUsers: number
}

export default function Home() {
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/stats") // Replace with your backend URL
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const data: Stats = await response.json()
        setStats(data)
      } catch (error) {
        toast({
          title: "Error fetching stats",
          description: "Unable to load statistics. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Enhancing Social Skills Through Virtual Reality
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    A safe, engaging environment for children to develop crucial social skills with personalized VR
                    experiences.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="px-8" asChild>
                    <Link href="/dashboard">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rounded-full bg-muted p-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VrHeadset className="h-32 w-32 text-primary" />
                  </div>
                  <div className="absolute top-8 left-8 rounded-full bg-primary/10 p-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute bottom-8 right-8 rounded-full bg-primary/10 p-4">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore the powerful tools that make our platform effective for social skills development.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Emotion Recognition</CardTitle>
                  <CardDescription>Understand emotional context in text</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our advanced AI analyzes text to identify emotions, helping children understand the emotional
                    context of written communication.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/emotion">Try Emotion Analysis</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Face Detection</CardTitle>
                  <CardDescription>Recognize facial expressions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Upload images to detect faces and analyze expressions, helping children learn to recognize and
                    interpret facial cues.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/face-detection">Try Face Detection</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                  <CardDescription>Monitor development over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Track and visualize progress as children develop their social skills, with detailed metrics and
                    insights for parents and educators.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Learning</CardTitle>
                  <CardDescription>Tailored to individual needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our system adapts to each child's unique learning style and pace, focusing on areas that need the
                    most attention.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/dashboard">Explore Learning Path</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join our community of parents, educators, and therapists helping children develop essential social
                  skills.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="px-8" asChild>
                  <Link href="/login">Create an Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

