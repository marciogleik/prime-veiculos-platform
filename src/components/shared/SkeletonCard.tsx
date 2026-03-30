import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-gray-100">
      <Skeleton className="aspect-[16/10] w-full" />
      <CardContent className="p-5">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-3 gap-2 py-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
