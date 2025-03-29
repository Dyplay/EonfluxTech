import { useState, useRef, useCallback } from 'react';
import { FiX, FiUpload, FiImage, FiFile, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { storage, ID } from '@/lib/appwrite';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError: (error: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUploadSuccess,
  onUploadError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const processFile = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      setError("Only image files are allowed (JPEG, PNG, GIF, WEBP)");
      setIsUploading(false);
      onUploadError("Only image files are allowed");
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setIsUploading(false);
      onUploadError("File size must be less than 10MB");
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Upload to Appwrite Storage
      const result = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        ID.unique(),
        file
      );
      
      // Generate preview URL
      const fileUrl = storage.getFileView(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        result.$id
      );
      
      // Signal success
      setIsUploading(false);
      setUploadProgress(100);
      onUploadSuccess(fileUrl.href);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setError("Failed to upload file. Please try again.");
      onUploadError("Failed to upload file");
    }
  }, [onClose, onUploadError, onUploadSuccess]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [processFile]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, [processFile]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="max-w-md w-full rounded-lg shadow-xl bg-card border border-border/30"
        style={{
          background: 'linear-gradient(to bottom right, rgba(36, 36, 54, 0.98), rgba(20, 20, 35, 0.96))',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold">Upload Image</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-accent/50 text-muted-foreground"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50'
            } transition-colors cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="mb-3">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Uploading your image...</p>
                <div className="w-full bg-accent/30 rounded-full h-2 mb-1">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            ) : uploadProgress === 100 ? (
              <div className="flex flex-col items-center text-primary">
                <FiCheck className="w-16 h-16 mb-2" />
                <p>Upload complete!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FiImage className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm mb-2">Drag and drop your image here</p>
                <p className="text-xs text-muted-foreground mb-3">or click to browse files</p>
                <button 
                  className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                >
                  <FiUpload className="inline-block mr-2 w-4 h-4" />
                  Select Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="mt-4 text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, GIF, WEBP (max 10MB)
                </p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal; 