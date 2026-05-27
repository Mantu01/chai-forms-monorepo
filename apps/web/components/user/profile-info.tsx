"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";
import { Camera, Save } from "lucide-react";

interface ProfileInfoProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string | null;
  };
}

const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(80),
  profileImageUrl: z.string().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileInfo({ user }: ProfileInfoProps) {
  const utils = trpc.useUtils();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName,
      profileImageUrl: user.profileImageUrl || null,
    },
  });

  const watchedImageUrl = form.watch("profileImageUrl");

  const uploadMutation = trpc.auth.uploadProfileImage.useMutation({
    onSuccess: (data) => {
      form.setValue("profileImageUrl", data.imageUrl, { shouldDirty: true });
      toast.success("Profile image uploaded! Click Save to apply changes.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload image");
    },
  });

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("Profile updated successfully!");
      await utils.auth.me.invalidate();
      form.reset({
        fullName: form.getValues("fullName"),
        profileImageUrl: form.getValues("profileImageUrl"),
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        uploadMutation.mutate({ base64Data: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate({
      fullName: data.fullName,
      profileImageUrl: data.profileImageUrl || undefined,
    });
  };

  const isPending = uploadMutation.isPending || updateMutation.isPending;
  const isDirty = form.formState.isDirty;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex flex-col items-center gap-4 text-center">
        <div className="relative group cursor-pointer">
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending}
          />
          <label htmlFor="avatar-upload" className="cursor-pointer block relative">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20 transition-all group-hover:ring-primary/50">
              {watchedImageUrl ? (
                <AvatarImage src={watchedImageUrl} alt={user.fullName} />
              ) : (
                user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
              )}
              <AvatarFallback className="text-xl bg-muted text-muted-foreground font-bold">
                {user.fullName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {uploadMutation.isPending ? (
                <Spinner className="h-5 w-5 text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </label>
        </div>
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold leading-none">{user.fullName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{user.email}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 border-t border-border/60">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold text-muted-foreground">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Full Name"
              className="border-border/80 bg-background/50 text-xs focus-visible:ring-primary h-8"
              {...form.register("fullName")}
              disabled={isPending}
            />
            {form.formState.errors.fullName && (
              <p className="text-xs text-destructive font-medium mt-0.5">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
            <Input
              value={user.email}
              disabled
              className="border-border/60 bg-muted/40 text-xs text-muted-foreground h-8 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-muted-foreground">User ID</span>
            <span className="font-mono text-[10px] select-all break-all text-foreground bg-muted/30 px-2 py-1 rounded border border-border/50">
              {user.id}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-muted-foreground">Verification status</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">
              Verified Account
            </span>
          </div>

          <Button
            type="submit"
            disabled={!isDirty || isPending}
            className="w-full cursor-pointer h-9 text-xs flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
