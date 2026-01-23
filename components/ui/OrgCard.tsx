"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Locate, Map, Phone, Share } from "lucide-react";
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
    <Card className="md:w-[297px] pb-4 ">
      {/* Optional overlay if needed */}
      <div className="relative w-full h-40 rounded-t-xl overflow-hidden">
        {/* Blurred background */}
        <img
          src="https://citedesrocheuses.com/wp-content/uploads/2026/01/cdr-rgb-v3.png"
          alt={`${name} background`}
          className="absolute inset-0 w-full h-full object-cover filter blur-md brightness-75"
        />

        {/* Actual logo */}
        <div className="relative flex items-center justify-center w-full h-full">
          <img
            src="https://citedesrocheuses.com/wp-content/uploads/2026/01/cdr-rgb-v3.png"
            alt={`${name} logo`}
            className="max-h-25 max-w-[80%] object-contain"
          />
        </div>
      </div>

      {category && (
        <CardAction className="p-2">
          <Badge variant="secondary">{category}</Badge>
        </CardAction>
      )}
      <CardHeader className="h-32">
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>
          <p className="text-sm flex gap-2">
            <Phone size={15} /> {phone}
          </p>
          <p className="text-sm  flex gap-2">
            <Locate size={15} /> {address}
          </p>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex gap-2 flex-wrap m-2">
        <Button size="sm" variant="default" onClick={onDetails}>
          Voir plus
        </Button>
        <Button size="sm" variant="outline" onClick={onShare}>
          <Share />
        </Button>
        <Button size="sm" variant="outline" onClick={onMap}>
          <Map />
        </Button>
        <Button size="sm" variant="outline" onClick={onMap}>
          <Heart fill="" />
        </Button>
      </CardFooter>
    </Card>
  );
}
