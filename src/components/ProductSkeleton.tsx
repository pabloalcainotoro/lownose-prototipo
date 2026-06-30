// src/components/ProductSkeleton.tsx
export default function ProductSkeleton() {
  return (
    <div className="animate-pulse flex flex-col space-y-3 w-full">
      {/* Caja de la imagen */}
      <div className="bg-neutral-200 dark:bg-neutral-800 h-64 w-full rounded-lg"></div>
      
      {/* Líneas del nombre y precio */}
      <div className="space-y-2">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
      </div>
    </div>
  );
}