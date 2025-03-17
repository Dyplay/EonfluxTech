import { FiPackage } from 'react-icons/fi';

export default function ProductsLoading() {
  return (
    <div className="container max-w-7xl py-12">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
          <FiPackage className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Our Products</h1>
        <p className="text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
          Explore our open-source projects and products. These repositories showcase our commitment to innovation and quality software development.
        </p>
      </div>
      
      <div className="mb-12 flex justify-center">
        <div className="inline-flex items-center px-6 py-3 rounded-md bg-primary/70 text-primary-foreground animate-pulse">
          <div className="h-5 w-5 mr-2 rounded-full bg-primary-foreground/30"></div>
          <div className="h-4 w-40 rounded bg-primary-foreground/30"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm animate-pulse">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="h-6 w-32 bg-muted-foreground/20 dark:bg-gray-700 rounded"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-8 bg-muted-foreground/20 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-8 bg-muted-foreground/20 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              
              <div className="h-4 w-full bg-muted-foreground/20 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-muted-foreground/20 dark:bg-gray-700 rounded mb-4"></div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-6 w-16 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                <div className="h-6 w-20 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                <div className="h-6 w-14 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted-foreground/20 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-16 bg-muted-foreground/20 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            
            <div className="bg-muted/50 dark:bg-gray-700/50 p-4 flex justify-between">
              <div className="h-5 w-24 bg-primary/20 dark:bg-primary/30 rounded"></div>
              <div className="h-5 w-24 bg-primary/20 dark:bg-primary/30 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 