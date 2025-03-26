"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Upload, User } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Progress } from "@/components/ui/progress"

type FaceDetectionResult = {
  faces: Array<{
    top: number
    right: number
    bottom: number
    left: number
  }>
}

export default function FaceDetectionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<FaceDetectionResult | null>(null)

  // Redirect if not logged in
  if (!loading && !user) {
    router.push("/login")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!image) return

    setIsProcessing(true)
    try {
      // Convert the base64 image to a Blob
      const blob = await fetch(image).then((res) => res.blob())
      const formData = new FormData()
      formData.append("image", blob)

      // Make the API call to the backend
      const response = await fetch("http://localhost:5000/api/face-detection", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to process the image")
      }

      const data: FaceDetectionResult = await response.json()
      setResult(data)

      toast({
        title: "Image processed",
        description: `Detected ${data.faces.length} face(s) in the image.`,
      })
    } catch (error: any) {
      toast({
        title: "Processing failed",
        description: error.message || "There was an error processing the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Face Detection</h1>
          <p className="text-muted-foreground">Upload an image to detect and analyze faces.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>Upload a photo containing one or more faces to analyze.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

              {image ? (
                <div className="relative w-full max-w-md h-64 border rounded-lg overflow-hidden">
                  <Image src={image || "/placeholder.svg"} alt="Uploaded image" fill style={{ objectFit: "contain" }} />
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full max-w-md h-64 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setImage(null)
                setResult(null)
              }}
              disabled={!image || isProcessing}
            >
              Clear
            </Button>
            <Button onClick={processImage} disabled={!image || isProcessing}>
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  Detect Faces
                  <Camera className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
              <CardDescription>{result.faces.length} face(s) detected in the image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.faces.map((face, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Face {index + 1}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How to Use This Tool</CardTitle>
            <CardDescription>Tips for getting the most out of face detection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">1. Use clear images</h3>
                <p className="text-sm text-muted-foreground">
                  For best results, upload well-lit images where faces are clearly visible.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">2. Practice with different expressions</h3>
                <p className="text-sm text-muted-foreground">
                  Try uploading images with different facial expressions to help children recognize various emotional
                  states.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">3. Use as a learning tool</h3>
                <p className="text-sm text-muted-foreground">
                  Help children understand how to recognize faces and facial expressions in different contexts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

