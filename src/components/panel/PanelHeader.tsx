interface PanelHeaderProps {
  title: string;
  description?: string;
}

export function PanelHeader({ title, description }: PanelHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </div>
  );
} 