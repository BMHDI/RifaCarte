'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter } from '@/components/ui/card';
import {  Heart, MapPin, MapPinned, Phone, PhoneOff } from 'lucide-react';
import { OrgCardProps } from '@/types/types';
import { toTitleCase } from '@/lib/utils';
import { ShareButton } from './ShareButton';
import { useOrg } from '@/app/context/OrgContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from './spinner';
import Link from 'next/link';


export function OrgCard({
  id, // 👈 add this
  image_url,
  name,
  phone,
  address,
  category,
  onMap,
  onSave,
  isSaved,
}: OrgCardProps) {
  const defaultImage =
    'https://edmonton.acfa.ab.ca/wp-content/uploads/2019/05/Logo-2-updatex-345x242.png';
  const imgSrc = image_url || defaultImage;
 
    
 
  return (
    <Card className="md:w-[297px] max-h-[400px] w-[88dvw] mx-auto md:mx-3  pb-4 bg-gray-100 dark:bg-gray-800 shadow ">
      {/* Optional overlay if needed */}
      {/* IMAGE HEADER */}
      <div className="relative  h-26 w-full overflow-hidden rounded-t-md">
        <Heart
          onClick={onSave}
          className="  absolute m-2 top-0 right-0 rounded-full z-20"
          stroke="red"
          fill={isSaved ? 'red' : 'none'}
        />
        <img
          src={imgSrc}
          alt={`${name} background`}
          className="absolute inset-0 h-full w-full object-cover blur-md brightness-90 scale-110"
        />

        {/* LOGO */}
        <div className="relative z-10 flex h-full items-end justify-center pb-2">
          <img alt={name} src={imgSrc} className="h-22  object-contain rounded-xl p-1" />
        </div>
      </div>

      {/* CONTENT */}
      <CardContent className="space-y-2 pt-3 ">
        <h4 className="font-semibold  h-[2.5rem] ">{name}</h4>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {phone ? <Phone className="h-4 w-4" /> : <PhoneOff className="h-4 w-4" />}
          <span  className='text-xs '> {phone ? phone : "Non disponible"}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5" />
          <span className='text-xs h-[2.5rem]'>{address ? address : "Non disponible"}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-1 flex-wrap m-2">
        <Button
      size="sm"
      variant="default"
    >
     <Link href={`/${id}`}>
  Voir +
</Link>
    </Button>
        {/* Share button */}
        <ShareButton id={id} name={name} />
        <Button size="sm" variant="outline" onClick={onMap}>
        <MapPinned />
        </Button>
      </CardFooter>
      {category && category.length > 0 && (
        <CardAction className="p-1 flex  flex-wrap gap-1">
          {(Array.isArray(category) ? category : [category]).map((cat) => (
            <Badge key={cat} variant="outline" className='border border-gray-400 '>
              {toTitleCase(cat)}
            </Badge>
          ))}
        </CardAction>
      )}
    </Card>
  );
}
