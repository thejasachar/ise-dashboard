"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

type EmotionResult = {
  label: string
  score: number
}

export default function EmotionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<EmotionResult | null>(null)

  // Redirect if not logged in
  if (!loading && !user) {
    router.push("/login")
  }

  const analyzeEmotion = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    try {
      // Call the backend API for emotion analysis
      const response = await fetch("http://localhost:5000/api/emotion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to analyze the text")
      }

      const data: EmotionResult = await response.json()
      setResult(data)

      toast({
        title: "Analysis complete",
        description: `Detected emotion: ${data.label} with confidence ${Math.round(data.score * 100)}%.`,
      })

      // Save progress to the backend
      if (user) {
        await fetch("http://localhost:5000/api/save-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            progress: {
              emotionRecognition: {
                lastUsed: new Date().toISOString(),
                attempts: 1,
                lastEmotion: data.label,
              },
            },
          }),
        })
      }
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "There was an error analyzing the text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emotion Analysis</h1>
          <p className="text-muted-foreground">Enter text to analyze the emotional content and tone.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Text Emotion Recognition</CardTitle>
            <CardDescription>Our AI will analyze the text to identify the primary emotion expressed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to analyze emotions (e.g., 'I'm so excited about my birthday party tomorrow!')"
              className="min-h-[150px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setText("")}>
              Clear
            </Button>
            <Button onClick={analyzeEmotion} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  Analyze
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>The primary emotion detected in your text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="rounded-full bg-primary/10 p-6 mx-auto mb-4">
                    <Brain className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold capitalize mb-2">{result.label}</h3>
                  <p className="text-muted-foreground">Confidence: {Math.round(result.score * 100)}%</p>
                </div>
              </div>
              <div className="mt-6 border-t pt-6">
                <h4 className="font-semibold mb-2">Understanding this emotion:</h4>
                <p className="text-sm">
                  {result.label === "joy" &&
                    "Joy is a feeling of great pleasure and happiness. It's often associated with success, achievement, or receiving something good."}
                  {result.label === "sadness" &&
                    "Sadness is an emotional pain associated with feelings of disadvantage, loss, despair, grief, helplessness, disappointment and sorrow."}
                  {result.label === "anger" &&
                    "Anger is an intense emotional state involving a strong uncomfortable and hostile response to a perceived provocation, hurt or threat."}
                  {result.label === "fear" &&
                    "Fear is an emotion induced by perceived danger or threat, which causes physiological changes and ultimately behavioral changes."}
                  {result.label === "surprise" &&
                    "Surprise is a brief mental and physiological state, a startle response experienced by animals and humans as the result of an unexpected event."}
                  {result.label === "love" &&
                    "Love encompasses a range of strong and positive emotional and mental states, from the most sublime virtue or good habit, the deepest interpersonal affection, to the simplest pleasure."}
                  {result.label === "disgust" &&
                    "Disgust is an emotional response of rejection or revulsion to something potentially contagious or something considered offensive, distasteful, or unpleasant."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How to Use This Tool</CardTitle>
            <CardDescription>Tips for getting the most out of the emotion analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">1. Use clear, expressive language</h3>
                <p className="text-sm text-muted-foreground">
                  The more emotionally expressive the text, the more accurate the analysis will be.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">2. Try different emotions</h3>
                <p className="text-sm text-muted-foreground">
                  Experiment with writing text that expresses different emotions to see how the AI responds.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">3. Use this as a learning tool</h3>
                <p className="text-sm text-muted-foreground">
                  Help children understand how written text can convey emotions, and how to recognize emotional cues in
                  writing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

