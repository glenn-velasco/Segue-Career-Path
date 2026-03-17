import { ModeToggle } from "@/components/ui/modetoggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, Send } from "lucide-react"
import Link from "next/link"

export default function JobBoard() {
  const jobItems = [
    {
      title: "Senior Frontend Engineer",
      description: "We are looking for an experienced frontend engineer to lead our core UI team. You will be responsible for building highly responsive, accessible, and performant user interfaces using React and Tailwind CSS.",
      type: "Full-time",
      location: "Remote"
    },
    {
      title: "Product Designer",
      description: "Join our design team to craft intuitive and visually stunning user experiences. You will collaborate closely with engineering and product management to take features from concept to launch.",
      type: "Contract",
      location: "New York, NY"
    },
    {
      title: "Product Designer",
      description: "Join our design team to craft intuitive and visually stunning user experiences. You will collaborate closely with engineering and product management to take features from concept to launch.",
      type: "Contract",
      location: "New York, NY"
    },
    {
      title: "Product Designer",
      description: "Join our design team to craft intuitive and visually stunning user experiences. You will collaborate closely with engineering and product management to take features from concept to launch.",
      type: "Contract",
      location: "New York, NY"
    },
    {
      title: "Product Designer",
      description: "Join our design team to craft intuitive and visually stunning user experiences. You will collaborate closely with engineering and product management to take features from concept to launch.",
      type: "Contract",
      location: "New York, NY"
    }
  ]

  return (
    // Outer wrapper: enforces a light background, full height, and a standard sans-serif font
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Inner wrapper: explicit max-width and margin-auto to center it perfectly */}
      <div className="mx-auto w-full max-w-3xl space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Open Positions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Find your next role and help us build the future.
          </p>
        </div>

        {/* Job Listings Area */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] no-scroll-bar">
          {jobItems.map((item, index) => (
            <Link key={index} href="/job-info">
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 m-3">
                <CardHeader className="pb-3">
                  {/* Flex container to separate Title/Location from the Badge */}
                  <div className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-slate-500">
                        {item.location}
                      </CardDescription>
                    </div>
                    
                    {/* Custom Styled Badge */}
                    <span className="shrink-0 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {item.type}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}  
        </div>
        
        {/* Action / Input Area */}
        <Card className="mt-8 border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Submit your application
            </CardTitle>
            <CardDescription>
              Upload your resume and details to apply.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Using flex-row for desktop so buttons sit side-by-side instead of stacking massive blocks */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload Resume
              </Button>
              <Button className="flex items-center gap-2 text-white hover:bg-slate-800 " variant={"ghost"}>
                <Send className="h-4 w-4" />
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
        <ModeToggle></ModeToggle>
      </div>
    </div>
  )
}