import Link from 'next/link'

interface joblistinglinkprops{
    title : string;
    description : string;
}

export function Joblistinglink({title, description}:joblistinglinkprops) {
    return(
        <Link href="/job-info" className="truncate bg-[#F5C6BF] p-3 max-w-md w-full min-h-fit block">
            <span>{title}</span>
            <p>{description}</p> 
        </Link>
    )
}