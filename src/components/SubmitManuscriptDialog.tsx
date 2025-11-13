import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface SubmitManuscriptDialogProps {
  children: React.ReactNode;
}

export const SubmitManuscriptDialog = ({ children }: SubmitManuscriptDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { isConnected } = useAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!title || !abstract || !file) {
      toast.error("Please fill in all fields and upload a file");
      return;
    }

    // Simulate submission
    toast.success("Manuscript submitted successfully! Your work has been encrypted and will be assigned to reviewers.");
    setOpen(false);
    
    // Reset form
    setTitle("");
    setAbstract("");
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF or DOCX file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      toast.success("File uploaded successfully");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair">Submit Manuscript</DialogTitle>
          <DialogDescription>
            Submit your encrypted manuscript for peer review. All submissions are protected with end-to-end encryption.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Manuscript Title</Label>
            <Input
              id="title"
              placeholder="Enter your manuscript title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              placeholder="Enter your abstract (250 words max)"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={5}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Upload Manuscript (PDF or DOCX, max 10MB)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="cursor-pointer"
                required
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {!isConnected && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Please connect your wallet to submit a manuscript
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button type="submit" className="flex-1 gap-2" disabled={!isConnected}>
              <Upload className="h-4 w-4" />
              Submit Manuscript
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
