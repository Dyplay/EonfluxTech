import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { Models } from 'appwrite';

interface JobCardProps {
  job: Models.Document & {
    title: string;
    description: string;
    requiredSkills: string;
    payment: number;
    createdAt: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  // Helper function to convert skills string to array
  const getSkillsArray = (skillsString: string) => {
    return skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {job.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {getSkillsArray(job.requiredSkills).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-primary">
          €{job.payment.toFixed(2)}
        </span>
        
        <Link
          href={`/career/post/${job.$id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          Apply Now
          <FiArrowRight className="ml-2 -mr-1 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
} 