export default function JobInfo(){
    return(
        <div className="h-screen flex flex-col pt-2 sm:pt-4 pb-2 sm:pb-4 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden 
        bg-gradient-to-b from-[#0e2931] via-[#3ea8a7] to-[#0e2931]">

      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{ 
          backgroundImage: `url('blob_bg.svg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center' 
        }}
      />
      </div>
    )
}

