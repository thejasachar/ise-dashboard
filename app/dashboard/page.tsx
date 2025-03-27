"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Calendar, Clock, LineChart } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

type ProgressData = {
  emotionRecognition: number;
  facialExpressions: number;
  conversationSkills: number;
  socialCues: number;
  overallProgress: number;
  sessionsCompleted: number;
  lastSession: string;
  nextSession: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated and not still loading
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // Fetch user progress data
    const fetchProgressData = async (): Promise<void> => {
      if (!user) return;

      try {
        // Fetch progress data from the backend API
        const response = await fetch(`http://localhost:5000/api/get-progress/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch progress data");
        }

        const data: ProgressData = await response.json();
        console.log("Fetched progress data from API:", data); // Debugging log
        setProgressData(data);
      } catch (error) {
        console.error("Error fetching progress data:", error);
        toast({
          title: "Error fetching progress data",
          description: "Unable to load progress data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProgressData();
    }
  }, [user, loading, router, toast]);

  if (loading || isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your child's progress and upcoming sessions.</p>
        </div>

        {/* Dashboard Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData?.overallProgress}%</div>
              <Progress value={progressData?.overallProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">+5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData?.sessionsCompleted}</div>
              <p className="text-xs text-muted-foreground mt-2">2 sessions this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(progressData?.lastSession || "").toLocaleDateString()}</div>
              <p className="text-xs text-muted-foreground mt-2">Emotion recognition focus</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Session</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(progressData?.nextSession || "").toLocaleDateString()}</div>
              <p className="text-xs text-muted-foreground mt-2">10:00 AM - Social cues practice</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="skills" className="w-full">
          <TabsList>
            <TabsTrigger value="skills">Skills Progress</TabsTrigger>
            <TabsTrigger value="sessions">Session History</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="skills" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Emotion Recognition</CardTitle>
                  <CardDescription>Ability to identify emotions in text and speech</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{progressData?.emotionRecognition}%</span>
                  </div>
                  <Progress value={progressData?.emotionRecognition} className="mt-2" />
                  <p className="text-sm mt-4">
                    Your child is showing strong progress in identifying basic emotions like happiness and sadness, but
                    still needs practice with more complex emotions like frustration and disappointment.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Facial Expressions</CardTitle>
                  <CardDescription>Ability to recognize and interpret facial cues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{progressData?.facialExpressions}%</span>
                  </div>
                  <Progress value={progressData?.facialExpressions} className="mt-2" />
                  <p className="text-sm mt-4">
                    Your child is making steady progress in recognizing basic facial expressions. We recommend continued
                    practice with the face detection exercises.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Skills</CardTitle>
                  <CardDescription>Ability to maintain appropriate conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{progressData?.conversationSkills}%</span>
                  </div>
                  <Progress value={progressData?.conversationSkills} className="mt-2" />
                  <p className="text-sm mt-4">
                    This is an area that needs more focus. Your child is making progress but would benefit from
                    additional practice in turn-taking and staying on topic.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Social Cues</CardTitle>
                  <CardDescription>Ability to recognize and respond to social signals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{progressData?.socialCues}%</span>
                  </div>
                  <Progress value={progressData?.socialCues} className="mt-2" />
                  <p className="text-sm mt-4">
                    Your child is showing excellent progress in this area, particularly in understanding personal space
                    and appropriate greetings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>A history of your child's training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">Session #{progressData?.sessionsCompleted! - i}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            new Date(progressData?.lastSession || "").getTime() - i * 7 * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {
                            [
                              "Emotion Recognition",
                              "Facial Expressions",
                              "Conversation Practice",
                              "Social Cues",
                              "Mixed Skills",
                            ][i % 5]
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">{30 + Math.floor(Math.random() * 15)} minutes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>Based on your child's progress and learning patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Focus on Conversation Skills</h3>
                    <p className="text-sm mt-2">
                      We recommend scheduling additional sessions focused on conversation skills, as this is currently
                      the area with the most room for improvement.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Try the Emotion Analysis Tool</h3>
                    <p className="text-sm mt-2">
                      Your child is showing good progress with emotion recognition. Use our emotion analysis tool to
                      practice identifying emotions in different contexts.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Real-world Practice</h3>
                    <p className="text-sm mt-2">
                      Consider creating opportunities to practice the skills learned in VR in controlled real-world
                      settings, starting with family members.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}