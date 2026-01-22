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
  logo: string;
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
      <img
        src="https://www.theglobeandmail.com/resizer/v2/65SAIIIB2BGD3ATQ247G2T343U.JPG?auth=b1e9ced577046f6fd03cac067a6618c0a7da134ad8278b8b93a4157930c28383&width=600&quality=80"
        alt={`${name} logo`}
        className="relative  rounded-t-xl z-10 aspect-video h-40 w-full object-cover brightness-90 "
      />
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
