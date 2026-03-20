"use client";

import * as React from "react"
import { ModeToggle } from "@/components/ui/modetoggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, Send, X, Bot, ChevronLeft, ChevronRight} from "lucide-react"
import Link from "next/link"
import { handleResume } from "@/lib/actions";
import { InterviewChat } from "@/components/ui/interview-chat";

export default function JobBoard() {
  
  const [fileName, setFileName] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [jobs, setJobs] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [portfolioUrl, setPortfolioUrl] = React.useState<string>("")
  const [detectedExpertise, setDetectedExpertise] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState<boolean>(false)

  const ITEMS_PER_PAGE = 5;
  const [error, setError] = React.useState<string | null>(null)
  const [isMounted, setIsMounted] = React.useState(false)
  const [selectedJob, setSelectedJob] = React.useState<any | null>(null)
  const [isInterviewing, setIsInterviewing] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    const savedFileName = localStorage.getItem("resume_filename")
    const savedJobs = localStorage.getItem("job_list")
    const savedPage = localStorage.getItem("current_page")
    const savedExpertise = localStorage.getItem("detected_expertise")

    if (savedFileName) setFileName(savedFileName)
    if (savedPage) setCurrentPage(parseInt(savedPage, 10) || 1)
    if (savedExpertise) setDetectedExpertise(savedExpertise)
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs))
      } catch (e) {
        console.error("Failed to parse saved jobs", e)
      }
    }
  }, [])

 // Add this block after your second useEffect
  React.useEffect(() => {
    if (isMounted && portfolioUrl === "" && !fileName) {
      // Clear all results from the UI
      setJobs([]);
      setDetectedExpertise(null);
      setError(null);
      // Clear memory so it doesn't come back on refresh
      localStorage.removeItem("job_list");
      localStorage.removeItem("detected_expertise");
      localStorage.removeItem("current_page");
    }
  }, [portfolioUrl, fileName, isMounted]);

  React.useEffect(() => {
    if (!isMounted) return

    if (fileName) {
      localStorage.setItem("resume_filename", fileName)
    } else {
      localStorage.removeItem("resume_filename")
    }

    if (jobs.length > 0) {
      localStorage.setItem("job_list", JSON.stringify(jobs))
      localStorage.setItem("current_page", currentPage.toString())
      if (detectedExpertise) localStorage.setItem("detected_expertise", detectedExpertise)
    } else {
      localStorage.removeItem("job_list")
      localStorage.removeItem("current_page")
      localStorage.removeItem("detected_expertise")
    }
  }, [fileName, jobs, currentPage, detectedExpertise, isMounted])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleResumeSubmit = async (formData: FormData) => {

    setIsPending(true)

    setError(null)

    try {

      const file = formData.get("resume") as File | null;

      if (fileName && (!file || file.size === 0) || !portfolioUrl) {

        setError("Please re-select your resume file. Browsers clear file selections when the page is reloaded.");

        setIsPending(false);

        return;
      }

      const response = await handleResume(formData)

      if (response.error) {

        setError(response.error)

        setJobs([])

        setDetectedExpertise(null)

        setCurrentPage(1)

      } else if (response.data) {

        setJobs(response.data)

        setDetectedExpertise(response.expertise || null)

        setCurrentPage(1)

      }
    } catch (err: any) {

      setError(err.message || "An unexpected error occurred")

    } finally {

      setIsPending(false)

    }

  }

  const indexOfLastJob = currentPage * ITEMS_PER_PAGE;

  const indexOfFirstJob = indexOfLastJob - ITEMS_PER_PAGE;

  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);

  return (
    <div className="h-screen flex flex-col py-[10] px-[20] lg:px-8 font-sans overflow-hidden 
    bg-linear-to-b from-[#0e2931] via-[#3ea8a7] to-[#0e2931]">

      <div 
        className="absolute inset-0 z-0 opacity-35 pointer-events-none" 
        style={{ 
          backgroundImage: `url('blob_bg.svg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center' 
        }}
      />
        
      <div className="mx-auto my-auto w-full max-w-3xl flex flex-col justify-center h-full min-h-0 m z-1">
        <div className="shrink-0">
          {(jobs.length == 0 )&& (
            <div className="flex flex-col items-center justify-center text-center mb-40">
            <h1 className="text-3xl sm:text-6xl font-bold text-white drop-shadow-md">
              Begin Your Career Now
            </h1>
            <p className="text-slate-200/90 text-1xl sm:text-2xl mt-3">
              Find Your Next Role and Build Our Future
            </p>
            
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
              {/* <ModeToggle /> */}
            </div>
          </div>
          )}
          {/* Design when there are jobs showing */}
          {(jobs.length > 0)&& (
            <div className="flex flex-col items-center justify-center text-center mt-10">
            <h1 className="text-xl sm:text-5xl font-bold text-white drop-shadow-md ">
              Open Positions
            </h1>
            <p className="text-slate-200/90 text-xl sm:text-xl mt-3">
              Begin Your Career Now
            </p>
            
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
              {/* <ModeToggle /> */}
            </div>
          </div>
          )}

          {(jobs.length > 0 || error || detectedExpertise) && (
            <div className="mt-10 flex flex-row items-center justify-around w-full ">
              
              <div className="w-full flex flex-col items-start justify-center space-y-2 pt-2">
                {jobs.length > 0 && (
                  <p className="text-white text-sm font-meduim tracking-wide">
                    Results Found : {jobs.length} 
                  </p>
                )}
                
              </div>
              {error &&
              <div className="fixed w-full flex flex-col items-center justify-between space-y-2 z-[-1]">
                <Card className=" group relative overflow-hidden bg-white/15 backdrop-blur-md border border-white shadow-xl p-5 mb-40"> 
                    <p className="text-[#ff2222] text-xl font-bold">{error}</p>
                </Card>
              </div>
                
              }
              {detectedExpertise && (
                <div className="rounded-xl border border-white/40 px-6 py-2 shadow-xl bg-[#0e2931] whitespace-nowrap flex items-center">
                  <p className="text-xs sm:text-sm font-bold text-white tracking-wider">
                    Detected Expertise: 
                    <span className="text-emerald-400 ml-2">
                      {detectedExpertise}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className=" overflow-y-auto space-y-3 no-scroll-bar">
          {currentJobs.map((item, index) => (
            <div key={indexOfFirstJob + index} onClick={() => setSelectedJob(item)} className="cursor-pointer">
              <Card className="group relative overflow-hidden transition-all hover:scale-[1.01] 
                  bg-white/25 backdrop-blur-md border border-white/20 shadow-xl m-4 ">
                <CardHeader className="">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg sm:text-xl font-bold text-[#265473] tracking-tight">
                        {item.title || "Untitled Position"}
                      </CardTitle>
                      <CardDescription className="text-sm text-white">
                        {item.companyName || item.advertiser?.description || "Unknown Company"} • {item.locations?.[0]?.label || "Location"} | <span className="font-extrabold">{item.workArrangements.data[0].label.text || "Arrangements"}</span>

                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="shrink-0 inline-flex items-center rounded-lg bg-[#326DB0] px-3 py-1 text-xs font-bold text-white">
                        {item.workTypes?.[0] || "Full-Time"} 
                      </span>
                      <p className="text-xs text-white/60">
                        {item.listingDateDisplay || "Listing Date"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent >
                  <p className="text-xs text-white/60">
                    {item.teaser || "Description"}
                  </p>
                  
                </CardContent>
              </Card>
            </div>
          ))}
          {!isPending && jobs.length === 0 && !error && (
            <div className="text-center py-16 px-4">
              <Card className="group relative overflow-hidden bg-white/25 backdrop-blur-md border border-white shadow-xl m-4 ">
                  <p className="text-[#0E2931] dark:text-[#0E2931] text-2xl font-extrabold ">
                    {fileName ? "No matching jobs found" : "Submit Your Application"}
                  </p>
                  <p className="text-[#0E2931] dark:text-[#0E2931] mt-1 max-w-sm mx-auto">
                    {fileName
                      ? "Try uploading a different resume or wait for new positions."
                      : "Upload your resume or paste portfolio link below."}
                  </p>
              </Card>
              
            </div>
          )}
          {isPending && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {totalPages > 1 && !isPending && (
          <div className="shrink-0 border-t border-white/20 flex justify-center items-center gap-2 py-2 mt-1">
            <Button
            
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>

            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full "
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight/>
            </Button>
          </div>
        )}

        <div className="shrink-0 pt-2">
          <div className="border border-white rounded-xl p-4 shadow-sm bg-[#0E2931] mb-10">
            <form action={handleResumeSubmit} className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <input type="file" name="resume" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx" />

              <div className="flex-1 text-left w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-grow space-y-2" >
                    <h3 className="text-xl font-semibold text-zinc-100 px-2">AI Role Match</h3>
                    <p className="text-xs text-zinc-500 mt-0.5"></p>
                    {!fileName && (
                    <Input
                      type="url"
                      name="portfolioUrl"
                      placeholder="https://yourportfolio.com"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="w-full h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#3EA8A7] outline-none transition"
                    />
                  )}
                  </div>
                </div>

                  {fileName && (
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-s text-green-600 font-medium flex items-center gap-1">
                        <Send className="w-3 h-3" /> {fileName}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFileName(null)
                          setPortfolioUrl("")
                          setDetectedExpertise(null)
                          setJobs([])
                          setCurrentPage(1)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                          localStorage.removeItem("resume_filename")
                          localStorage.removeItem("job_list")
                          localStorage.removeItem("current_page")
                          localStorage.removeItem("detected_expertise")
                        }}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-950 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-200"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
              </div>

              <div className="flex flex-col items-center gap-2 w-full sm:w-[auto]">
                <Button type="button" className="bg-[#91B032] text-white w-full hover:bg-[#C5F042]" size="sm" onClick={handleUploadClick} disabled={isPending || !!portfolioUrl}>
                  <UploadCloud className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{fileName ? "Change" : "Upload"}</span>
                </Button>
                <Button type="submit" size="sm" className="bg-white w-full text-[#0E2931]" disabled={(!fileName && !portfolioUrl) || isPending}>
                  {isPending ? "AI Parsing..." : "Find"}
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => { setSelectedJob(null); setIsInterviewing(false); }}>
          <div className={`bg-[#0E2931] rounded-4xl shadow-xl w-full ${isInterviewing ? 'max-w-4xl h-[85vh]' : 'max-w-4xl max-h-[90vh]'} flex flex-col overflow-hidden border-3 border-white/70 transition-all duration-300`} onClick={e => e.stopPropagation()}>
            
            {isInterviewing ? (
              <InterviewChat 
                jobTitle={selectedJob.title || "Untitled Position"}
                companyName={selectedJob.companyName || selectedJob.advertiser?.description}
                jobDescription={selectedJob.teaser}
                onClose={() => setIsInterviewing(false)}
              />
            ) : (
              <>
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1 pr-4">
                    {selectedJob.title || "Untitled Position"}
                  </h2>
                  <button onClick={() => setSelectedJob(null)} className="shrink-0 p-2 -mr-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 sm:p-6 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                      {selectedJob.companyName || selectedJob.advertiser?.description || "Unknown Company"}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                      {selectedJob.locations?.[0]?.label || "Remote"}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {selectedJob.workTypes?.[0] || "Full-time"}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Description</h3>
                      <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {selectedJob.teaser || "No description available."}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-wrap justify-between items-center gap-3">
                  <Button variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50" onClick={() => setIsInterviewing(true)}>
                    <Bot className="w-4 h-4 mr-2" />
                    Practice Interview
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                      Close
                    </Button>
                    {selectedJob.url && (
                      <Button onClick={() => window.open(selectedJob.url, '_blank')}>
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
