"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Heart, Locate, MapPin, MapPinned, Phone } from "lucide-react";
import Image from "next/image";

interface OrgCardProps {
  // logo: string;
  name: string;
  phone: string;
  address: string;
  category?: string;
  onDetails?: () => void;
  onShare?: () => void;
  onMap?: () => void;
}

export function OrgCard({
  // logo,
  name,
  phone,
  address,
  category,
  onDetails,
  onShare,
  onMap,
}: OrgCardProps) {
  return (
    <Card className="md:w-[297px] pb-4 bg-gray-100 ">
      {/* Optional overlay if needed */}
      {/* IMAGE HEADER */}
      
      <div className="relative h-24 w-full overflow-hidden rounded-t-md">
          <Button size="icon" variant="ghost" onClick={onMap} className="absolute top-0 right-0" >
<Heart className="text-rose-600 z-10" />        </Button>
        <img
          
            src="https://canmore-banff.acfa.ab.ca/wp-content/uploads/2022/12/Logo-Fondation-Franco-Albertaine-1024x338.png"
          alt={`${name} background`}
          className="absolute inset-0 h-full w-full object-cover blur-md brightness-90 scale-110"
        />

        {/* LOGO */}
        <div className="relative z-10 flex h-full items-end justify-center pb-2">
          <img
          
            alt={name}
            src="https://canmore-banff.acfa.ab.ca/wp-content/uploads/2022/12/Logo-Fondation-Franco-Albertaine-1024x338.png"
            className="h-22  object-contain rounded-xl p-1"
          />
        </div>
      </div>

      {category && (
        <CardAction className="p-2">
          <Badge variant="secondary">{category}</Badge>
        </CardAction>
      )}
      {/* CONTENT */}
      <CardContent className="space-y-2 pt-3">
        <h3 className=" font-semibold text-base">{name}</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{phone}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5" />
          <span>{address}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap m-2">
        <Button size="sm" variant="default" onClick={onDetails}>
          Voir plus
        </Button>
        <Button size="sm" variant="outline" onClick={onShare}>
          <ExternalLink />
        </Button>
        <Button size="sm" variant="outline" onClick={onMap}>
          <MapPinned />
        </Button>
      </CardFooter>
    </Card>
  );
}
