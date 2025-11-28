import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Send } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface ReviewerApplicationDialogProps {
  children: React.ReactNode;
}

export const ReviewerApplicationDialog = ({ children }: ReviewerApplicationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("");
  const { isConnected, address } = useAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!name || !email || !institution || !expertise || !experience) {
      toast.error("Please fill in all fields");
      return;
    }

    // Simulate application
    toast.success("Application submitted successfully! Your reviewer profile is under verification.");
    setOpen(false);
    
    // Reset form
    setName("");
    setEmail("");
    setInstitution("");
    setExpertise("");
    setExperience("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Apply as Reviewer
          </DialogTitle>
          <DialogDescription>
            Join our network of verified reviewers. Your wallet will be used for authentication and maintaining your reviewer identity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isConnected && address && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                <strong>Connected Wallet:</strong> {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Dr. Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane.smith@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="institution">Institution/Organization</Label>
            <Input
              id="institution"
              placeholder="University of Research"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expertise">Area of Expertise</Label>
            <Select value={expertise} onValueChange={setExpertise} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="social-science">Social Sciences</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experience">Review Experience</Label>
            <Textarea
              id="experience"
              placeholder="Describe your peer review experience, publications, and qualifications..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={4}
              required
            />
          </div>

          {!isConnected && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Please connect your Rainbow Wallet to apply as a reviewer
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button type="submit" className="flex-1 gap-2" disabled={!isConnected}>
              <Send className="h-4 w-4" />
              Submit Application
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
