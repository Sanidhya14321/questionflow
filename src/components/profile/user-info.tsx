"use client";

import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

interface UserInfoProps {
  user: User | null; // User can be null if not loaded or not logged in
}

export function UserInfo({ user }: UserInfoProps) {
  if (!user) {
    // Basic skeleton or loading state
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-muted animate-pulse"></AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
      <Card className="shadow-xl bg-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src={`https://placehold.co/100x100.png?text=${initials}`} alt={user.name} data-ai-hint="profile avatar" />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-3xl text-foreground">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize flex items-center">
                <UserCircle className="w-4 h-4 mr-1.5 text-primary" />
                {user.role}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center text-foreground">
            <Mail className="w-5 h-5 mr-3 text-accent" />
            <span>{user.email}</span>
          </div>
          {user.interests && user.interests.length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Interests:</h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
